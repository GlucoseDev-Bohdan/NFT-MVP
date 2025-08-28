import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Metaplex, keypairIdentity, type UploadMetadataInput } from '@metaplex-foundation/js';
import {
  getAssociatedTokenAddress,
  createBurnInstruction,
  createCloseAccountInstruction
} from '@solana/spl-token';
import fetch from 'node-fetch';
import { ENV } from '../config.js';
import { MintBody, MintResponse, UpdateResponse, BurnResponse, PinataResponse } from '../types.js';
import { transformToMetaplexMetadata, mergeMetadata } from './metadata.js';
import { getExplorerUrl } from '../config.js';

let connection: Connection;
let metaplex: Metaplex;
let walletKeypair: Keypair;

/** Initialize Solana connection and Metaplex instance */
export function initializeSolana() {
  if (ENV.MOCK_MODE) {
    console.log('🔧 Running in MOCK MODE - no real blockchain operations');
    return;
  }

  connection = new Connection(ENV.RPC_URL, 'confirmed');

  const secretKeyArray = JSON.parse(ENV.WALLET_SECRET_KEY);
  walletKeypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));

  metaplex = Metaplex.make(connection).use(keypairIdentity(walletKeypair));

  console.log('🔑 Wallet Public Key:', walletKeypair.publicKey.toString());
}

/** Upload JSON metadata to Pinata */
async function uploadToPinata(json: object): Promise<string> {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ENV.NFT_STORAGE_TOKEN}`
    },
    body: JSON.stringify({ pinataContent: json })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Pinata upload failed: ${errText}`);
  }

  // Use type assertion to tell TypeScript the response matches PinataResponse
  const data = (await resp.json()) as PinataResponse;

  return `ipfs://${data.IpfsHash}`;
}

/** Mint a new NFT */
export async function mintNFT(data: MintBody, tokenOwner?: string): Promise<MintResponse> {
  if (ENV.MOCK_MODE) {
    // const mockMintAddress = 'MOCK_' + Math.random().toString(36).slice(2);
    // const mockSignature = 'MOCK_SIG_' + Math.random().toString(36).slice(2);
    // return {
    //   txSignature: mockSignature,
    //   mintAddress: mockMintAddress,
    //   metadataUri: 'ipfs://mock-metadata-uri',
    //   explorerUrl: getExplorerUrl(mockSignature)
    // };
  }

  const metadata: UploadMetadataInput = transformToMetaplexMetadata(data);
  const ownerPublicKey = tokenOwner ? new PublicKey(tokenOwner) : walletKeypair.publicKey;

  // Upload metadata directly to Pinata
  const uri = await uploadToPinata(metadata);
  console.log('Metadata URI:', uri);

  const { nft, response } = await metaplex.nfts().create({
    uri,
    name: metadata.name!,
    symbol: (metadata.symbol as string | undefined) ?? ENV.NFT_SYMBOL,
    sellerFeeBasisPoints: ENV.SELLER_FEE_BPS,
    isMutable: true,
    tokenOwner: ownerPublicKey,
    updateAuthority: walletKeypair
  });

  const httpUri = uri.replace('ipfs://', ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/');

  return {
    txSignature: response.signature,
    mintAddress: nft.mint.address.toBase58(),
    metadataUri: uri,
    metadataHttpUri: httpUri,
    explorerUrl: getExplorerUrl(response.signature)
  };
}

/** Update an existing NFT's metadata */
export async function updateNFT(mintAddress: string, patch: Partial<MintBody>): Promise<UpdateResponse> {
  if (ENV.MOCK_MODE) {
    // const mockSignature = 'MOCK_UPDATE_SIG_' + Math.random().toString(36).slice(2);
  //   return {
  //     txSignature: mockSignature,
  //     newMetadataUri: 'ipfs://mock-updated-metadata-uri',
  //     explorerUrl: getExplorerUrl(mockSignature)
  //   };
  }

  const mintPk = new PublicKey(mintAddress);
  const nft = await metaplex.nfts().findByMint({ mintAddress: mintPk });
  
  // Use Pinata gateway to fetch current metadata
  const gateway = ENV.PINATA_GATEWAY?.endsWith('/') 
  ? ENV.PINATA_GATEWAY 
  : ENV.PINATA_GATEWAY + '/';
  const pinataUrl = nft.uri.replace('ipfs://', gateway);
  // const pinataUrl = nft.uri.replace('ipfs://', ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/');
  const resp = await fetch(pinataUrl);
  const text = await resp.text();

  let currentMetadata: UploadMetadataInput;
  try {
    currentMetadata = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse NFT metadata:', text);
    throw new Error('Failed to fetch or parse NFT metadata from IPFS');
  }
  // const currentMetadata = (await resp.json()) as UploadMetadataInput;
  
  // Merge patch
  const updated: UploadMetadataInput = mergeMetadata(currentMetadata, patch);
  
  // Upload updated metadata
  const uri = await uploadToPinata(updated);
  console.log('🔗 Updated Metadata URI:', uri);
  
  const { response: updResp } = await metaplex.nfts().update({
    nftOrSft: nft,
    uri,
    name: updated.name,
    symbol: updated.symbol as string | undefined
  });  

  const httpUri = uri.replace('ipfs://', ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/');
  return {
    txSignature: updResp.signature,
    newMetadataUri: uri,
    metadataHttpUri: httpUri,
    explorerUrl: getExplorerUrl(updResp.signature)
  };
}

/** Burn an NFT and close its associated token account */
export async function burnNFT(mintAddress: string): Promise<BurnResponse> {
  if (ENV.MOCK_MODE) {
    const mockBurnSig = 'MOCK_BURN_SIG_' + Math.random().toString(36).slice(2);
    const mockCloseSig = 'MOCK_CLOSE_SIG_' + Math.random().toString(36).slice(2);
    return {
      burnSignature: mockBurnSig,
      closeSignature: mockCloseSig,
      explorerUrl: getExplorerUrl(mockBurnSig)
    };
  }

  const mintPk = new PublicKey(mintAddress);
  const ata = await getAssociatedTokenAddress(mintPk, walletKeypair.publicKey);

  const tx = new Transaction()
    .add(
      createBurnInstruction(
        ata,
        mintPk,
        walletKeypair.publicKey,
        1
      )
    )
    .add(
      createCloseAccountInstruction(
        ata,
        walletKeypair.publicKey,
        walletKeypair.publicKey
      )
    );

  const sig = await connection.sendTransaction(tx, [walletKeypair]);
  await connection.confirmTransaction(sig, 'confirmed');

  return {
    burnSignature: sig,
    closeSignature: sig,
    explorerUrl: getExplorerUrl(sig)
  };
}
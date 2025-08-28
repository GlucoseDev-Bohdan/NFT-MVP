// import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
// import { Metaplex, keypairIdentity, type UploadMetadataInput } from '@metaplex-foundation/js';
// import { nftStorage } from '@metaplex-foundation/js-plugin-nft-storage';
// import {
//   getAssociatedTokenAddress,
//   createBurnInstruction,
//   createCloseAccountInstruction
// } from '@solana/spl-token';
// import { ENV } from '../config.js';
// import { MintBody, MintResponse, UpdateResponse, BurnResponse } from '../types.js';
// import { transformToMetaplexMetadata, mergeMetadata } from './metadata.js';
// import { getExplorerUrl } from '../config.js';

// let connection: Connection;
// let metaplex: Metaplex;
// let walletKeypair: Keypair;

// export function initializeSolana() {
//   if (ENV.MOCK_MODE) {
//     console.log('🔧 Running in MOCK MODE - no real blockchain operations');
//     return;
//   }

//   connection = new Connection(ENV.RPC_URL, 'confirmed');

//   // Parse the wallet secret key (expects a JSON array string in .env)
//   const secretKeyArray = JSON.parse(ENV.WALLET_SECRET_KEY);
//   walletKeypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));

//   metaplex = Metaplex.make(connection)
//     .use(keypairIdentity(walletKeypair))
//     .use(
//       nftStorage({
//         token: ENV.NFT_STORAGE_TOKEN,
//         gatewayHost: ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
//         useGatewayUrls: true
//       })
//     );
    
//   console.log('🔑 Wallet Public Key:', walletKeypair.publicKey.toString());
// }

// export async function mintNFT(data: MintBody, tokenOwner?: string): Promise<MintResponse> {
//   if (ENV.MOCK_MODE) {
//     const mockMintAddress = 'MOCK_' + Math.random().toString(36).slice(2);
//     const mockSignature = 'MOCK_SIG_' + Math.random().toString(36).slice(2);
//     return {
//       txSignature: mockSignature,
//       mintAddress: mockMintAddress,
//       metadataUri: 'ipfs://mock-metadata-uri',
//       explorerUrl: getExplorerUrl(mockSignature)
//     };
//   }

//   const metadata: UploadMetadataInput = transformToMetaplexMetadata(data);
//   const ownerPublicKey = tokenOwner ? new PublicKey(tokenOwner) : walletKeypair.publicKey;

//   const { uri } = await metaplex.nfts().uploadMetadata(metadata);
//   console.log('Metadata URI:', uri);

//   const { nft, response } = await metaplex.nfts().create({
//     uri,
//     name: metadata.name!,
//     symbol: (metadata.symbol as string | undefined) ?? ENV.NFT_SYMBOL,
//     sellerFeeBasisPoints: ENV.SELLER_FEE_BPS,
//     isMutable: true,
//     tokenOwner: ownerPublicKey,
//     updateAuthority: walletKeypair
//   });

//   return {
//     txSignature: response.signature,
//     mintAddress: nft.mint.address.toBase58(),
//     metadataUri: uri,
//     explorerUrl: getExplorerUrl(response.signature)
//   };
// }

// export async function updateNFT(mintAddress: string, patch: Partial<MintBody>): Promise<UpdateResponse> {
//   if (ENV.MOCK_MODE) {
//     const mockSignature = 'MOCK_UPDATE_SIG_' + Math.random().toString(36).slice(2);
//     return {
//       txSignature: mockSignature,
//       newMetadataUri: 'ipfs://mock-updated-metadata-uri',
//       explorerUrl: getExplorerUrl(mockSignature)
//     };
//   }

//   const mintPk = new PublicKey(mintAddress);
//   const nft = await metaplex.nfts().findByMint({ mintAddress: mintPk });

//   // Download current metadata JSON
//   const resp = await fetch(nft.uri);
//   const currentMetadata = (await resp.json()) as UploadMetadataInput;

//   // Merge patch
//   const updated: UploadMetadataInput = mergeMetadata(currentMetadata, patch);

//   // Upload new metadata to Pinata/IPFS
//   const { uri } = await metaplex.nfts().uploadMetadata(updated);
//   const pinataGatewayUrl = uri.replace('ipfs://', (ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'));
//   console.log('🔗 Updated Metadata (Pinata Gateway):', pinataGatewayUrl);

//   const { response: updResp } = await metaplex.nfts().update({
//     nftOrSft: nft,
//     uri,
//     name: updated.name,
//     symbol: updated.symbol as string | undefined
//   });

//   return {
//     txSignature: updResp.signature,
//     newMetadataUri: uri,
//     explorerUrl: getExplorerUrl(updResp.signature)
//   };
// }

// export async function burnNFT(mintAddress: string): Promise<BurnResponse> {
//   if (ENV.MOCK_MODE) {
//     const mockBurnSig = 'MOCK_BURN_SIG_' + Math.random().toString(36).slice(2);
//     const mockCloseSig = 'MOCK_CLOSE_SIG_' + Math.random().toString(36).slice(2);
//     return {
//       burnSignature: mockBurnSig,
//       closeSignature: mockCloseSig,
//       explorerUrl: getExplorerUrl(mockBurnSig)
//     };
//   }

//   const mintPk = new PublicKey(mintAddress);

//   // Central wallet's ATA for this mint
//   const ata = await getAssociatedTokenAddress(mintPk, walletKeypair.publicKey);

//   const tx = new Transaction()
//     .add(
//       createBurnInstruction(
//         ata,                // token account
//         mintPk,             // mint
//         walletKeypair.publicKey,
//         1                   // amount (NFT supply = 1)
//       )
//     )
//     .add(
//       createCloseAccountInstruction(
//         ata,                // account to close
//         walletKeypair.publicKey, // destination for lamports
//         walletKeypair.publicKey
//       )
//     );

//   const sig = await connection.sendTransaction(tx, [walletKeypair]);
//   await connection.confirmTransaction(sig, 'confirmed');

//   return {
//     burnSignature: sig,
//     closeSignature: sig, // same tx carries both instructions
//     explorerUrl: getExplorerUrl(sig)
//   };
// }

import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Metaplex, keypairIdentity, type UploadMetadataInput } from '@metaplex-foundation/js';
// @ts-expect-error ipfs-car types not published
import { pack } from 'ipfs-car/pack'
// @ts-expect-error ipfs-car types not published
import { MemoryBlockStore } from 'ipfs-car/blockstore/memory'


import { File, NFTStorage } from 'nft.storage';
import {
  getAssociatedTokenAddress,
  createBurnInstruction,
  createCloseAccountInstruction
} from '@solana/spl-token';
import { ENV } from '../config.js';
import { MintBody, MintResponse, UpdateResponse, BurnResponse } from '../types.js';
import { transformToMetaplexMetadata, mergeMetadata } from './metadata.js';
import { getExplorerUrl } from '../config.js';

let connection: Connection;
let metaplex: Metaplex;
let walletKeypair: Keypair;
let nftStorageClient: NFTStorage;

export function initializeSolana() {
  if (ENV.MOCK_MODE) {
    console.log('🔧 Running in MOCK MODE - no real blockchain operations');
    return;
  }

  connection = new Connection(ENV.RPC_URL, 'confirmed');

  // Parse wallet secret key
  const secretKeyArray = JSON.parse(ENV.WALLET_SECRET_KEY);
  walletKeypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));

  // Metaplex
  metaplex = Metaplex.make(connection).use(keypairIdentity(walletKeypair));

  if (!ENV.NFT_STORAGE_TOKEN) {
    throw new Error('NFT_STORAGE_TOKEN is not set!');
  }
  console.log('✅ NFT_STORAGE_TOKEN loaded');
  // NFT.Storage client
  nftStorageClient = new NFTStorage({ token: ENV.NFT_STORAGE_TOKEN });

  console.log('🔑 Wallet Public Key:', walletKeypair.publicKey.toString());
}

async function uploadMetadata(metadata: UploadMetadataInput) {
  const file = new File([JSON.stringify(metadata)], 'metadata.json', {
    type: 'application/json'
  })

  const blockstore = new MemoryBlockStore()

  const { root, out } = await pack({
    input: [file],
    blockstore,
    wrapWithDirectory: false
  })

  const cid = await nftStorageClient.storeCar(out)
  await blockstore.close()

  return `ipfs://${root.toString()}`
}

export async function mintNFT(data: MintBody, tokenOwner?: string): Promise<MintResponse> {
  if (ENV.MOCK_MODE) {
    const mockMintAddress = 'MOCK_' + Math.random().toString(36).slice(2);
    const mockSignature = 'MOCK_SIG_' + Math.random().toString(36).slice(2);
    return {
      txSignature: mockSignature,
      mintAddress: mockMintAddress,
      metadataUri: 'ipfs://mock-metadata-uri',
      explorerUrl: getExplorerUrl(mockSignature)
    };
  }

  const metadata: UploadMetadataInput = transformToMetaplexMetadata(data);
  const ownerPublicKey = tokenOwner ? new PublicKey(tokenOwner) : walletKeypair.publicKey;

  // Upload metadata
  const uri = await uploadMetadata(metadata);
  console.log('Metadata URI:', uri);

  // Mint NFT
  const { nft, response } = await metaplex.nfts().create({
    uri,
    name: metadata.name!,
    symbol: metadata.symbol ?? ENV.NFT_SYMBOL,
    sellerFeeBasisPoints: ENV.SELLER_FEE_BPS,
    isMutable: true,
    tokenOwner: ownerPublicKey,
    updateAuthority: walletKeypair
  });

  return {
    txSignature: response.signature,
    mintAddress: nft.mint.address.toBase58(),
    metadataUri: uri,
    explorerUrl: getExplorerUrl(response.signature)
  };
}

export async function updateNFT(mintAddress: string, patch: Partial<MintBody>): Promise<UpdateResponse> {
  if (ENV.MOCK_MODE) {
    const mockSignature = 'MOCK_UPDATE_SIG_' + Math.random().toString(36).slice(2);
    return {
      txSignature: mockSignature,
      newMetadataUri: 'ipfs://mock-updated-metadata-uri',
      explorerUrl: getExplorerUrl(mockSignature)
    };
  }

  const mintPk = new PublicKey(mintAddress);
  const nft = await metaplex.nfts().findByMint({ mintAddress: mintPk });

  const resp = await fetch(nft.uri);
  const currentMetadata = (await resp.json()) as UploadMetadataInput;

  const updated = mergeMetadata(currentMetadata, patch);
  const uri = await uploadMetadata(updated);

  const { response: updResp } = await metaplex.nfts().update({
    nftOrSft: nft,
    uri,
    name: updated.name,
    symbol: updated.symbol as string | undefined
  });

  return {
    txSignature: updResp.signature,
    newMetadataUri: uri,
    explorerUrl: getExplorerUrl(updResp.signature)
  };
}

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
      createBurnInstruction(ata, mintPk, walletKeypair.publicKey, 1)
    )
    .add(
      createCloseAccountInstruction(ata, walletKeypair.publicKey, walletKeypair.publicKey)
    );

  const sig = await connection.sendTransaction(tx, [walletKeypair]);
  await connection.confirmTransaction(sig, 'confirmed');

  return {
    burnSignature: sig,
    closeSignature: sig,
    explorerUrl: getExplorerUrl(sig)
  };
}

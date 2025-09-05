// import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
// import { Metaplex, keypairIdentity, type UploadMetadataInput } from '@metaplex-foundation/js';
// import {
//   getAssociatedTokenAddress,
//   createBurnInstruction,
//   createCloseAccountInstruction
// } from '@solana/spl-token';
// import fetch from 'node-fetch';
// import { ENV } from '../config.js';
// import { MintBody, MintResponse, UpdateResponse, BurnResponse, PinataResponse } from '../types.js';
// import { transformToMetaplexMetadata, mergeMetadata } from './metadata.js';
// import { getExplorerUrl } from '../config.js';

// let connection: Connection;
// let metaplex: Metaplex;
// let walletKeypair: Keypair;

// export async function uploadImageBase64ToIPFS(
//   dataUrl: string,
//   filename = "image.png"
// ): Promise<string> {
//   try {
//     const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
//     if (!match) throw new Error("Invalid data URL");
//     const contentType = match[1] || "application/octet-stream";
//     const base64 = match[2];
//     const buffer = Buffer.from(base64, "base64");

//     if (ENV.PINATA_JWT) {
//       const form = new FormData();
//       form.append("file", new Blob([buffer], { type: contentType }), filename);

//       const resp = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${ENV.PINATA_JWT}` },
//         body: form as any,
//       });

//       if (!resp.ok) {
//         const errText = await resp.text();
//         throw new Error(`File upload failed: ${errText}`);
//       }

//       const data = (await resp.json()) as { IpfsHash: string };
//       return `ipfs://${data.IpfsHash}`;
//     }

//     // 3) Pinata using API Key + Secret
//     if (ENV.PINATA_API_KEY && ENV.PINATA_API_SECRET) {
//       const form = new FormData();
//       form.append("file", new Blob([buffer], { type: contentType }), filename);

//       const resp = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
//         method: "POST",
//         headers: {
//           pinata_api_key: ENV.PINATA_API_KEY,
//           pinata_secret_api_key: ENV.PINATA_API_SECRET,
//         },
//         body: form as any,
//       });

//       if (!resp.ok) {
//         const errText = await resp.text();
//         throw new Error(`File upload failed: ${errText}`);
//       }

//       const data = (await resp.json()) as { IpfsHash: string };
//       return `ipfs://${data.IpfsHash}`;
//     }

//     throw new Error("No IPFS credentials found. Provide NFT_STORAGE_TOKEN or Pinata keys.");
//   } catch (e: any) {
//     console.error("Upload image failed:", e);
//     throw e;
//   }
// }



// /** Initialize Solana connection and Metaplex instance */
// export function initializeSolana() {
//   if (ENV.MOCK_MODE) {
//     console.log('🔧 Running in MOCK MODE - no real blockchain operations');
//     return;
//   }

//   connection = new Connection(ENV.RPC_URL, 'confirmed');

//   const secretKeyArray = JSON.parse(ENV.WALLET_SECRET_KEY);
//   walletKeypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));

//   metaplex = Metaplex.make(connection).use(keypairIdentity(walletKeypair));

//   console.log('🔑 Wallet Public Key:', walletKeypair.publicKey.toString());
// }

// /** Upload JSON metadata to Pinata */
// async function uploadToPinata(json: object): Promise<string> {
//   const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

//   const resp = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${ENV.NFT_STORAGE_TOKEN}`
//     },
//     body: JSON.stringify({ pinataContent: json })
//   });

//   if (!resp.ok) {
//     const errText = await resp.text();
//     throw new Error(`Pinata upload failed: ${errText}`);
//   }

//   // Use type assertion to tell TypeScript the response matches PinataResponse
//   const data = (await resp.json()) as PinataResponse;

//   return `ipfs://${data.IpfsHash}`;
// }

// /** Mint a new NFT */
// /** Mint a new NFT */
// export async function mintNFT(data: MintBody, tokenOwner?: string): Promise<MintResponse> {
//   if (ENV.MOCK_MODE) {
//     // const mockMintAddress = 'MOCK_' + Math.random().toString(36).slice(2);
//     // const mockSignature = 'MOCK_SIG_' + Math.random().toString(36).slice(2);
//     // return {
//     //   txSignature: mockSignature,
//     //   mintAddress: mockMintAddress,
//     //   metadataUri: 'ipfs://mock-metadata-uri',
//     //   explorerUrl: getExplorerUrl(mockSignature)
//     // };
//   }

//   const metadata: UploadMetadataInput = transformToMetaplexMetadata(data);

//   // Upload metadata to Pinata
//   const uri = await uploadToPinata(metadata);
//   console.log('📦 Metadata URI:', uri);

//   // Step 1: Mint NFT into backend wallet
//   const { nft, response } = await metaplex.nfts().create({
//     uri,
//     name: metadata.name!,
//     symbol: (metadata.symbol as string | undefined) ?? ENV.NFT_SYMBOL,
//     sellerFeeBasisPoints: ENV.SELLER_FEE_BPS,
//     isMutable: true,
//     updateAuthority: walletKeypair
//   });

//   let finalOwner = walletKeypair.publicKey;
//   let finalSig = response.signature;

//   // Step 2: If Phantom wallet address is provided → transfer to it
//   const targetOwner = tokenOwner || (data.owners && data.owners[0]);
//   if (targetOwner) {
//     try {
//       const { response: transferResp } = await metaplex.nfts().transfer({
//         nftOrSft: nft,
//         toOwner: new PublicKey(targetOwner),
//       });
//       finalSig = transferResp.signature;
//       finalOwner = new PublicKey(targetOwner);
//       console.log(`🚀 NFT transferred to ${targetOwner} (sig: ${finalSig})`);
//     } catch (err) {
//       console.error('⚠️ Failed to transfer NFT to Phantom wallet:', err);
//     }
//   }

//   const httpUri = uri.replace('ipfs://', ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/');

//   return {
//     txSignature: finalSig,
//     mintAddress: nft.mint.address.toBase58(),
//     metadataUri: uri,
//     metadataHttpUri: httpUri,
//     explorerUrl: getExplorerUrl(finalSig)
//   };
// }

// /** Update an existing NFT's metadata */
// export async function updateNFT(mintAddress: string, patch: Partial<MintBody>): Promise<UpdateResponse> {
//   if (ENV.MOCK_MODE) {
//     // const mockSignature = 'MOCK_UPDATE_SIG_' + Math.random().toString(36).slice(2);
//     // return {
//     //   txSignature: mockSignature,
//     //   newMetadataUri: 'ipfs://mock-updated-metadata-uri',
//     //   explorerUrl: getExplorerUrl(mockSignature)
//     // };
//   }

//   const mintPk = new PublicKey(mintAddress);
//   const nft = await metaplex.nfts().findByMint({ mintAddress: mintPk });

//   // Fetch old metadata
//   const gateway = ENV.PINATA_GATEWAY?.endsWith('/')
//     ? ENV.PINATA_GATEWAY
//     : (ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/') + '/';
//   const resp = await fetch(nft.uri.replace('ipfs://', gateway));
//   const currentMetadata = (await resp.json()) as UploadMetadataInput;

//   // Merge patch
//   const updated: UploadMetadataInput = mergeMetadata(currentMetadata, patch);

//   // Upload updated metadata
//   const uri = await uploadToPinata(updated);
//   console.log('🔗 Updated Metadata URI:', uri);

//   // Update NFT on-chain (backend is updateAuthority)
//   const { response: updResp } = await metaplex.nfts().update({
//     nftOrSft: nft,
//     uri,
//     name: updated.name,
//     symbol: updated.symbol as string | undefined,
//     updateAuthority: walletKeypair
//   });

//   // HTTP gateway for easy preview
//   const httpUri = uri.replace('ipfs://', ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/');

//   return {
//     txSignature: updResp.signature,
//     newMetadataUri: uri,
//     metadataHttpUri: httpUri,
//     explorerUrl: getExplorerUrl(updResp.signature)
//   };
// }

// /** Burn an NFT and close its associated token account */
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
//   const ata = await getAssociatedTokenAddress(mintPk, walletKeypair.publicKey);

//   const tx = new Transaction()
//     .add(
//       createBurnInstruction(
//         ata,
//         mintPk,
//         walletKeypair.publicKey,
//         1
//       )
//     )
//     .add(
//       createCloseAccountInstruction(
//         ata,
//         walletKeypair.publicKey,
//         walletKeypair.publicKey
//       )
//     );

//   const sig = await connection.sendTransaction(tx, [walletKeypair]);
//   await connection.confirmTransaction(sig, 'confirmed');

//   return {
//     burnSignature: sig,
//     closeSignature: sig,
//     explorerUrl: getExplorerUrl(sig)
//   };
// }

// /** Transfer an NFT from backend wallet to another wallet */
// export async function transferNFT(mintAddress: string, toOwner: string) {
//   if (ENV.MOCK_MODE) {
//     const mockTransferSig = 'MOCK_TRANSFER_SIG_' + Math.random().toString(36).slice(2);
//     return {
//       txSignature: mockTransferSig,
//       explorerUrl: getExplorerUrl(mockTransferSig)
//     };
//   }

//   const mintPk = new PublicKey(mintAddress);
//   const nft = await metaplex.nfts().findByMint({ mintAddress: mintPk });

//   const { response } = await metaplex.nfts().transfer({
//     nftOrSft: nft,
//     toOwner: new PublicKey(toOwner),
//   });

//   return {
//     txSignature: response.signature,
//     explorerUrl: getExplorerUrl(response.signature),
//   };
// }


import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Metaplex, keypairIdentity, type UploadMetadataInput } from '@metaplex-foundation/js';
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
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

export async function uploadImageBase64ToIPFS(
  dataUrl: string,
  filename = "image.png"
): Promise<string> {
  try {
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) throw new Error("Invalid data URL");
    const contentType = match[1] || "application/octet-stream";
    const base64 = match[2];
    const buffer = Buffer.from(base64, "base64");

    if (ENV.PINATA_JWT) {
      const form = new FormData();
      form.append("file", new Blob([buffer], { type: contentType }), filename);

      const resp = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${ENV.PINATA_JWT}` },
        body: form as any,
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`File upload failed: ${errText}`);
      }

      const data = (await resp.json()) as { IpfsHash: string };
      return `ipfs://${data.IpfsHash}`;
    }

    if (ENV.PINATA_API_KEY && ENV.PINATA_API_SECRET) {
      const form = new FormData();
      form.append("file", new Blob([buffer], { type: contentType }), filename);

      const resp = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: ENV.PINATA_API_KEY,
          pinata_secret_api_key: ENV.PINATA_API_SECRET,
        },
        body: form as any,
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`File upload failed: ${errText}`);
      }

      const data = (await resp.json()) as { IpfsHash: string };
      return `ipfs://${data.IpfsHash}`;
    }

    throw new Error("No IPFS credentials found. Provide NFT_STORAGE_TOKEN or Pinata keys.");
  } catch (e: any) {
    console.error("Upload image failed:", e);
    throw e;
  }
}

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

  const data = (await resp.json()) as PinataResponse;
  return `ipfs://${data.IpfsHash}`;
}

/** Mint a new NFT */
export async function mintNFT(data: MintBody, tokenOwner?: string): Promise<MintResponse> {
  if (ENV.MOCK_MODE) {
    return {
      txSignature: "MOCK_SIG_" + Math.random().toString(36).slice(2),
      mintAddress: "MOCK_MINT_" + Math.random().toString(36).slice(2),
      metadataUri: "ipfs://mock-metadata-uri",
      metadataHttpUri: "https://gateway.pinata.cloud/ipfs/mock-metadata-uri",
      explorerUrl: getExplorerUrl("mock"),
    };
  }

  const metadata: UploadMetadataInput = transformToMetaplexMetadata(data);

  // 1️⃣ Upload metadata JSON to Pinata
  const uri = await uploadToPinata(metadata);
  console.log("📦 Metadata URI:", uri);

  // 2️⃣ Check backend wallet balance before mint
  const balanceLamports = await connection.getBalance(walletKeypair.publicKey);
  const balanceSOL = balanceLamports / 1e9;
  console.log("💰 Backend wallet balance:", balanceSOL.toFixed(4), "SOL");

  if (balanceLamports < 0.05 * 1e9) {
    throw new Error(
      `❌ Backend wallet has only ${balanceSOL.toFixed(
        4
      )} SOL. At least 0.05 SOL required for rent + fees. Please fund it.`
    );
  }

  // 3️⃣ Choose final NFT owner (Phantom or backend)
  const finalOwnerPk = tokenOwner
    ? new PublicKey(tokenOwner)
    : walletKeypair.publicKey;

  try {
    // 4️⃣ Mint NFT directly to the final owner
    const { nft, response } = await metaplex.nfts().create({
      uri,
      name: metadata.name!,
      symbol: (metadata.symbol as string | undefined) ?? ENV.NFT_SYMBOL,
      sellerFeeBasisPoints: ENV.SELLER_FEE_BPS,
      isMutable: true,
      updateAuthority: walletKeypair,
      tokenOwner: finalOwnerPk,
    });

    const httpUri = uri.replace(
      "ipfs://",
      ENV.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/"
    );

    console.log(
      `🚀 NFT minted to ${finalOwnerPk.toBase58()} (sig: ${response.signature})`
    );

    return {
      txSignature: response.signature,
      mintAddress: nft.mint.address.toBase58(),
      metadataUri: uri,
      metadataHttpUri: httpUri,
      explorerUrl: getExplorerUrl(response.signature),
    };
  } catch (err: any) {
    console.error("❌ Mint failed:", err.message);
    if (err.logs) console.error("Simulation logs:", err.logs);
    if (err.signature) console.error("Debug signature:", err.signature);
    throw err;
  }
}

/** Update an existing NFT's metadata */
export async function updateNFT(mintAddress: string, patch: Partial<MintBody>): Promise<UpdateResponse> {
  if (ENV.MOCK_MODE) {
    return {
      txSignature: 'MOCK_UPDATE_SIG',
      newMetadataUri: 'ipfs://mock-update',
      metadataHttpUri: 'https://gateway.pinata.cloud/ipfs/mock-update',
      explorerUrl: getExplorerUrl('MOCK_UPDATE_SIG')
    };
  }

  const mintPk = new PublicKey(mintAddress);
  const nft = await metaplex.nfts().findByMint({ mintAddress: mintPk });

  const gateway = ENV.PINATA_GATEWAY?.endsWith('/')
    ? ENV.PINATA_GATEWAY
    : (ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/') + '/';
  const resp = await fetch(nft.uri.replace('ipfs://', gateway));
  const currentMetadata = (await resp.json()) as UploadMetadataInput;

  const updated: UploadMetadataInput = mergeMetadata(currentMetadata, patch);

  const uri = await uploadToPinata(updated);
  console.log('🔗 Updated Metadata URI:', uri);

  const { response: updResp } = await metaplex.nfts().update({
    nftOrSft: nft,
    uri,
    name: updated.name,
    symbol: updated.symbol as string | undefined,
    updateAuthority: walletKeypair
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
    return {
      burnSignature: 'MOCK_BURN_SIG',
      closeSignature: 'MOCK_CLOSE_SIG',
      explorerUrl: getExplorerUrl('MOCK_BURN_SIG')
    };
  }

  const mintPk = new PublicKey(mintAddress);
  const ata = await getAssociatedTokenAddress(mintPk, walletKeypair.publicKey);

  const tx = new Transaction()
    .add(createBurnInstruction(ata, mintPk, walletKeypair.publicKey, 1))
    .add(createCloseAccountInstruction(ata, walletKeypair.publicKey, walletKeypair.publicKey));

  const sig = await connection.sendTransaction(tx, [walletKeypair]);
  await connection.confirmTransaction(sig, 'confirmed');

  return {
    burnSignature: sig,
    closeSignature: sig,
    explorerUrl: getExplorerUrl(sig)
  };
}

/** Transfer an NFT from backend wallet to another wallet */
export async function transferNFT(mintAddress: string, toOwner: string) {
  if (ENV.MOCK_MODE) {
    return {
      txSignature: 'MOCK_TRANSFER_SIG',
      explorerUrl: getExplorerUrl('MOCK_TRANSFER_SIG')
    };
  }

  const mintPk = new PublicKey(mintAddress);
  const nft = await metaplex.nfts().findByMint({ mintAddress: mintPk });

  const { response } = await metaplex.nfts().transfer({
    nftOrSft: nft,
    toOwner: new PublicKey(toOwner),
  });

  return {
    txSignature: response.signature,
    explorerUrl: getExplorerUrl(response.signature),
  };
}

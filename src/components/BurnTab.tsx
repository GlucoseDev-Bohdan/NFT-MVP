// import React, { useState } from 'react';
// import { apiClient } from '../api';
// import { BurnRequest, BurnResponse } from '../types';
// import { Flame, ExternalLink, AlertTriangle } from 'lucide-react';
// interface BurnTabProps {
//   onToast: (type: 'success' | 'error', message: string) => void;
// }

// export function BurnTab({ onToast }: BurnTabProps) {
//   const [mintAddress, setMintAddress] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<BurnResponse | null>(null);
//   const [showWarning, setShowWarning] = useState(false);

//   const loadExample = () => {
//     setMintAddress('EXAMPLE_MINT_ADDRESS_FROM_PREVIOUS_MINT');
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setShowWarning(true);
//   };

//   const confirmBurn = async () => {
//     setLoading(true);
//     setShowWarning(false);

//     try {
//       const burnRequest: BurnRequest = { mintAddress };
//       const result = await apiClient.burn(burnRequest);
//       setResult(result);
//       onToast('success', 'NFT burned successfully!');
//       setMintAddress(''); // Clear form after successful burn
//     } catch (error: any) {
//       onToast('error', 'Failed to burn NFT: ' + (error.response?.data?.error || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
//           <Flame className="h-5 w-5 text-red-500" />
//           <span>Burn NFT</span>
//         </h2>
//         <button
//           onClick={loadExample}
//           className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//         >
//           Load Example
//         </button>
//       </div>

//       <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//         <div className="flex items-start space-x-3">
//           <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
//           <div>
//             <h3 className="font-medium text-red-800">⚠️ Warning: This action is irreversible</h3>
//             <p className="text-sm text-red-700 mt-1">
//               Burning an NFT permanently destroys it and closes the associated token account. 
//               This action cannot be undone. Make sure you have the correct mint address.
//             </p>
//           </div>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Mint Address *
//           </label>
//           <input
//             type="text"
//             required
//             value={mintAddress}
//             onChange={(e) => setMintAddress(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
//             placeholder="Enter the mint address of the NFT to burn"
//           />
//           <p className="text-xs text-gray-500 mt-1">
//             Use the mint address from a previously minted NFT
//           </p>
//         </div>

//         <button
//           type="submit"
//           disabled={loading || !mintAddress}
//           className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//         >
//           {loading ? 'Burning NFT...' : 'Burn NFT'}
//         </button>
//       </form>

//       {/* Confirmation Modal */}
//       {showWarning && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//             <div className="flex items-start space-x-3">
//               <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
//               <div>
//                 <h3 className="text-lg font-medium text-gray-900">Confirm NFT Burn</h3>
//                 <p className="text-sm text-gray-600 mt-2">
//                   You are about to permanently burn the NFT with mint address:
//                 </p>
//                 <code className="block bg-gray-100 p-2 rounded text-sm mt-2 break-all">
//                   {mintAddress}
//                 </code>
//                 <p className="text-sm text-red-600 mt-2 font-medium">
//                   This action cannot be undone. Are you sure?
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex space-x-3 mt-6">
//               <button
//                 onClick={() => setShowWarning(false)}
//                 className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmBurn}
//                 className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 Yes, Burn NFT
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {result && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
//           <h3 className="font-medium text-red-800">🔥 NFT Burned Successfully!</h3>
          
//           <div className="space-y-2 text-sm">
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">Burn Transaction:</span>
//               <a
//                 href={result.explorerUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-red-600 hover:text-red-700 flex items-center space-x-1"
//               >
//                 <span>View on Explorer</span>
//                 <ExternalLink className="h-4 w-4" />
//               </a>
//             </div>
            
//             <div className="text-xs text-gray-500">
//               <p>Burn Signature: <code>{result.burnSignature}</code></p>
//               <p>Close Signature: <code>{result.closeSignature}</code></p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Flame, ExternalLink, AlertTriangle } from 'lucide-react';
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createBurnInstruction,
  createCloseAccountInstruction
} from "@solana/spl-token";

interface BurnTabProps {
  onToast: (type: 'success' | 'error', message: string) => void;
}

// RPC
const connection = new Connection("https://api.mainnet-beta.solana.com");

interface BurnResult {
  explorerUrl: string;
  burnSignature: string;
}

export async function burnNFTWithPhantom(mintAddress: string): Promise<BurnResult> {
  try {
    const provider = (window as any).solana;
    if (!provider?.isPhantom) throw new Error("Phantom not installed");

    const resp = await provider.connect();
    const userPublicKey = new PublicKey(resp.publicKey.toString());

    const mintPk = new PublicKey(mintAddress);
    const ata = await getAssociatedTokenAddress(mintPk, userPublicKey);

    const tx = new Transaction().add(
      createBurnInstruction(ata, mintPk, userPublicKey, 1),
      createCloseAccountInstruction(ata, userPublicKey, userPublicKey)
    );

    tx.feePayer = userPublicKey;
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    tx.recentBlockhash = blockhash;

    const signedTx = await provider.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signedTx.serialize());

    return {
      explorerUrl: `https://solscan.io/tx/${sig}?cluster=mainnet`,
      burnSignature: sig
    };
  } catch (err: any) {
    console.error("Failed to burn NFT:", err);
    throw err;
  }
}

export function BurnTab({ onToast }: BurnTabProps) {
  const [mintAddress, setMintAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [result, setResult] = useState<BurnResult | null>(null);

  const loadExample = () => {
    setMintAddress('EXAMPLE_MINT_ADDRESS_FROM_PREVIOUS_MINT');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowWarning(true);
  };

  const confirmBurn = async () => {
    setLoading(true);
    setShowWarning(false);
    setResult(null);

    try {
      const burnResult = await burnNFTWithPhantom(mintAddress);
      setResult(burnResult);
      onToast('success', 'NFT burned successfully!');
      setMintAddress('');
    } catch (error: any) {
      onToast('error', 'Failed to burn NFT: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Flame className="h-5 w-5 text-red-500" />
          <span>Burn NFT</span>
        </h2>
        <button
          onClick={loadExample}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Load Example
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">⚠️ Warning: This action is irreversible</h3>
            <p className="text-sm text-red-700 mt-1">
              Burning an NFT permanently destroys it and closes the associated token account. 
              This action cannot be undone. Make sure you have the correct mint address.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mint Address *
          </label>
          <input
            type="text"
            required
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Enter the mint address of the NFT to burn"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use the mint address from a previously minted NFT
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !mintAddress}
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Burning NFT...' : 'Burn NFT'}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirm NFT Burn</h3>
                <p className="text-sm text-gray-600 mt-2">
                  You are about to permanently burn the NFT with mint address:
                </p>
                <code className="block bg-gray-100 p-2 rounded text-sm mt-2 break-all">
                  {mintAddress}
                </code>
                <p className="text-sm text-red-600 mt-2 font-medium">
                  This action cannot be undone. Are you sure?
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmBurn}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                Yes, Burn NFT
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-red-800">🔥 NFT Burned Successfully!</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Burn Transaction:</span>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <span>View on Explorer</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Transaction Signature: <code>{result.burnSignature}</code></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

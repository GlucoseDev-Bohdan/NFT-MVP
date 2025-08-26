import React, { useState } from 'react';
import { apiClient } from '../api';
import { UpdateRequest, UpdateResponse } from '../types';
import { Edit, ExternalLink, Copy } from 'lucide-react';

interface UpdateTabProps {
  onToast: (type: 'success' | 'error', message: string) => void;
}

export function UpdateTab({ onToast }: UpdateTabProps) {
  const [mintAddress, setMintAddress] = useState('');
  const [patchData, setPatchData] = useState({
    imageUrl: '',
    exitPrice: '',
    profitLoss: '',
    exitFees: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpdateResponse | null>(null);

  const loadExample = () => {
    setMintAddress('EXAMPLE_MINT_ADDRESS_FROM_PREVIOUS_MINT');
    setPatchData({
      imageUrl: 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg',
      exitPrice: '$110,000',
      profitLoss: '$1,000',
      exitFees: '$3.00'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    onToast('success', 'Copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateRequest: UpdateRequest = {
        mintAddress,
        patch: {
          imageUrl: patchData.imageUrl || undefined,
          trade: {
            exitPrice: patchData.exitPrice || undefined,
            profitLoss: patchData.profitLoss || undefined,
            exitFees: patchData.exitFees || undefined,
          }
        }
      };

      // Clean up undefined values
      if (updateRequest.patch.trade) {
        Object.keys(updateRequest.patch.trade).forEach(key => {
          if (updateRequest.patch.trade![key as keyof typeof updateRequest.patch.trade] === undefined) {
            delete updateRequest.patch.trade![key as keyof typeof updateRequest.patch.trade];
          }
        });
        
        if (Object.keys(updateRequest.patch.trade).length === 0) {
          delete updateRequest.patch.trade;
        }
      }

      const result = await apiClient.update(updateRequest);
      setResult(result);
      onToast('success', 'NFT updated successfully!');
    } catch (error: any) {
      onToast('error', 'Failed to update NFT: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Edit className="h-5 w-5 text-orange-500" />
          <span>Update NFT</span>
        </h2>
        <button
          onClick={loadExample}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Load Example
        </button>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter the mint address of the NFT to update"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use the mint address from a previously minted NFT
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Fields to Update</h3>
          <p className="text-sm text-gray-600 mb-4">
            Fill in only the fields you want to update. Leave others blank to keep existing values.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={patchData.imageUrl}
                onChange={(e) => setPatchData({...patchData, imageUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://example.com/final-image.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exit Price
                </label>
                <input
                  type="text"
                  value={patchData.exitPrice}
                  onChange={(e) => setPatchData({...patchData, exitPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="$110,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profit/Loss
                </label>
                <input
                  type="text"
                  value={patchData.profitLoss}
                  onChange={(e) => setPatchData({...patchData, profitLoss: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="$1,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exit Fees
                </label>
                <input
                  type="text"
                  value={patchData.exitFees}
                  onChange={(e) => setPatchData({...patchData, exitFees: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="$3.00"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !mintAddress}
          className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Updating NFT...' : 'Update Metadata'}
        </button>
      </form>

      {result && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-orange-800">✅ NFT Updated Successfully!</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Transaction:</span>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 flex items-center space-x-1"
              >
                <span>View on Explorer</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Metadata URI:</span>
              <div className="flex items-center space-x-2">
                <a
                  href={result.newMetadataUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                >
                  <span>View Metadata</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button onClick={() => copyToClipboard(result.newMetadataUri)} className="text-gray-500 hover:text-gray-700">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
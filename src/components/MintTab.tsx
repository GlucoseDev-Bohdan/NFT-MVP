import React, { useState } from 'react';
import { apiClient } from '../api';
import { MintRequest, MintResponse } from '../types';
import { Coins, ExternalLink, Copy } from 'lucide-react';

interface MintTabProps {
  onToast: (type: 'success' | 'error', message: string) => void;
}

export function MintTab({ onToast }: MintTabProps) {
  const [formData, setFormData] = useState<MintRequest>({
    title: '',
    description: '',
    imageUrl: '',
    owners: [],
    trade: {
      exchange: '',
      coin: '',
      direction: 'Long',
      amountUSD: '',
      entryPrice: '',
      leverage: '',
      entryFees: '',
      size: '',
      transactionId: '',
      pctOfFullPosition: '',
      splitApproach: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MintResponse | null>(null);

  const loadExample = () => {
    setFormData({
      title: 'Bitcoin Long Position #1',
      description: 'This is the XYZ Long position for Bitcoin',
      imageUrl: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
      owners: ['9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'],
      trade: {
        exchange: 'Coinbase',
        coin: 'BTC',
        direction: 'Long',
        amountUSD: '$1,000',
        entryPrice: '$100,000',
        leverage: '10x',
        entryFees: '$2.50',
        size: '0.1',
        transactionId: 'CB_123ABC',
        pctOfFullPosition: '5%',
        splitApproach: 'A'
      }
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
      const result = await apiClient.mint(formData);
      setResult(result);
      onToast('success', 'NFT minted successfully!');
    } catch (error: any) {
      onToast('error', 'Failed to mint NFT: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Coins className="h-5 w-5 text-blue-500" />
          <span>Mint NFT</span>
        </h2>
        <button
          onClick={loadExample}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Load Example
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bitcoin Long Position #1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="This is the XYZ Long position for Bitcoin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owners (comma-separated base58 addresses)
              </label>
              <input
                type="text"
                value={formData.owners?.join(', ') || ''}
                onChange={(e) => setFormData({...formData, owners: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
              />
            </div>
          </div>

          {/* Trade Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Trade Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exchange *</label>
                <input
                  type="text"
                  required
                  value={formData.trade.exchange}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, exchange: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Coinbase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coin *</label>
                <input
                  type="text"
                  required
                  value={formData.trade.coin}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, coin: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="BTC"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direction *</label>
                <select
                  required
                  value={formData.trade.direction}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, direction: e.target.value as 'Long' | 'Short'}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount USD *</label>
                <input
                  type="text"
                  required
                  value={formData.trade.amountUSD}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, amountUSD: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="$1,000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Price *</label>
                <input
                  type="text"
                  required
                  value={formData.trade.entryPrice}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, entryPrice: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="$100,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leverage *</label>
                <input
                  type="text"
                  required
                  value={formData.trade.leverage}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, leverage: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10x"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                <input
                  type="text"
                  required
                  value={formData.trade.size}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, size: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fees *</label>
                <input
                  type="text"
                  required
                  value={formData.trade.entryFees}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, entryFees: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="$2.50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID *</label>
                <input
                  type="text"
                  required
                  value={formData.trade.transactionId}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, transactionId: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CB_123ABC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% of Full Position *</label>
                <input
                  type="text"
                  required
                  value={formData.trade.pctOfFullPosition}
                  onChange={(e) => setFormData({...formData, trade: {...formData.trade, pctOfFullPosition: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5%"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Split Approach *</label>
              <input
                type="text"
                required
                value={formData.trade.splitApproach}
                onChange={(e) => setFormData({...formData, trade: {...formData.trade, splitApproach: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="A"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Minting NFT...' : 'Mint NFT'}
        </button>
      </form>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-green-800">✅ NFT Minted Successfully!</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mint Address:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-white px-2 py-1 rounded text-gray-800">{result.mintAddress}</code>
                <button onClick={() => copyToClipboard(result.mintAddress)} className="text-gray-500 hover:text-gray-700">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Transaction:</span>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>View on Explorer</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Metadata URI:</span>
              <a
                href={result.metadataHttpUri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>View Metadata</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
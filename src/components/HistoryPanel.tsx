import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { HistoryOperation } from '../types';
import { History, ExternalLink, Copy, Coins, Edit, Flame } from 'lucide-react';

interface HistoryPanelProps {
  onToast: (type: 'success' | 'error', message: string) => void;
}

export function HistoryPanel({ onToast }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryOperation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await apiClient.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const copyMintAddress = (mintAddress: string) => {
    navigator.clipboard.writeText(mintAddress);
    onToast('success', 'Mint address copied to clipboard!');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mint': return <Coins className="h-4 w-4 text-blue-500" />;
      case 'update': return <Edit className="h-4 w-4 text-orange-500" />;
      case 'burn': return <Flame className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mint': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-orange-100 text-orange-800';
      case 'burn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <History className="h-5 w-5 text-gray-500" />
          <span>Recent Operations</span>
        </h3>
        <div className="text-center text-gray-500 py-8">
          Loading history...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
        <History className="h-5 w-5 text-gray-500" />
        <span>Recent Operations</span>
        <span className="text-sm text-gray-500">({history.length})</span>
      </h3>

      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No operations yet. Start by minting your first NFT!
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((op, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => copyMintAddress(op.mintAddress)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(op.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(op.type)}`}>
                        {op.type.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(op.when).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {op.mintAddress.substring(0, 8)}...{op.mintAddress.substring(op.mintAddress.length - 8)}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyMintAddress(op.mintAddress);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <a
                  href={op.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 Click on any operation to copy the mint address
          </p>
        </div>
      )}
    </div>
  );
}
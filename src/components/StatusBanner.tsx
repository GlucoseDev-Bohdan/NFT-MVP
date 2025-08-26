import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { ServerStatus } from '../types';
import { AlertCircle, CheckCircle, Globe } from 'lucide-react';

export function StatusBanner() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const statusData = await apiClient.getStatus();
        setStatus(statusData);
        setError(null);
      } catch (err) {
        setError('Unable to connect to server');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium text-gray-700">Connected</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Network: <strong className="text-blue-600">{status.network.toUpperCase()}</strong>
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            RPC: <strong>{status.rpcUrl}</strong>
          </div>
        </div>

        {status.mockMode && (
          <div className="bg-orange-100 border border-orange-300 px-3 py-1 rounded-full">
            <span className="text-orange-700 text-sm font-medium">🎭 Mock Mode</span>
          </div>
        )}
      </div>
    </div>
  );
}
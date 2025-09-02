import React, { useState } from 'react';
import { apiClient } from '../api';
import { MintRequest, MintResponse } from '../types';
import { Coins, ExternalLink, Copy } from 'lucide-react';

interface MintTabProps {
  onToast: (type: 'success' | 'error', message: string) => void;
}

export function MintTab({ onToast }: MintTabProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSelectedFile(file);
      setUploading(true);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { ipfsUri } = await apiClient.uploadImage(dataUrl, file.name);
      setFormData(prev => ({ ...prev, imageUrl: ipfsUri }));
      onToast('success', 'Image uploaded to IPFS');
    } catch (e:any) {
      console.error(e);
      onToast('error', e?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
      {/* ... all your JSX above ... */}
  
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          {/* ... result content ... */}
          {formData.imageUrl && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Preview</div>
              <img
                src={
                  formData.imageUrl.startsWith('ipfs://')
                    ? formData.imageUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                    : formData.imageUrl
                }
                alt="preview"
                className="h-32 rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
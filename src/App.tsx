import React, { useState } from 'react';
import { StatusBanner } from './components/StatusBanner';
import { MintTab } from './components/MintTab';
import { UpdateTab } from './components/UpdateTab';
import { BurnTab } from './components/BurnTab';
import { HistoryPanel } from './components/HistoryPanel';
import { Toast } from './components/Toast';

type TabType = 'mint' | 'update' | 'burn';

interface ToastData {
  type: 'success' | 'error' | 'info';
  message: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('mint');
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const tabs = [
    { id: 'mint' as TabType, label: 'Mint', color: 'blue' },
    { id: 'update' as TabType, label: 'Update', color: 'orange' },
    { id: 'burn' as TabType, label: 'Burn', color: 'red' }
  ];

  const getTabClasses = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab.id;
    const baseClasses = 'px-6 py-3 text-sm font-medium rounded-lg transition-colors';
    
    if (isActive) {
      switch (tab.color) {
        case 'blue': return `${baseClasses} bg-blue-600 text-white`;
        case 'orange': return `${baseClasses} bg-orange-600 text-white`;
        case 'red': return `${baseClasses} bg-red-600 text-white`;
        default: return `${baseClasses} bg-gray-600 text-white`;
      }
    }
    
    return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NFT Ownership MVP</h1>
          <p className="text-gray-600">
            Create, update, and burn NFTs representing trading positions on Solana blockchain
          </p>
        </div>

        <StatusBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex space-x-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={getTabClasses(tab)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'mint' && <MintTab onToast={showToast} />}
                {activeTab === 'update' && <UpdateTab onToast={showToast} />}
                {activeTab === 'burn' && <BurnTab onToast={showToast} />}
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <HistoryPanel onToast={showToast} />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;

import React from 'react';
import Icon from './Icon';

type TabName = 'reader' | 'wordbank';

interface TabsProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  wordCount: number;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, wordCount }) => {
  const getButtonClasses = (tabName: TabName) => {
    const baseClasses = 'flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200';
    if (activeTab === tabName) {
      return `${baseClasses} bg-indigo-600 text-white`;
    }
    return `${baseClasses} text-slate-300 hover:bg-slate-700`;
  };

  return (
    <div className="flex justify-center">
        <div className="flex space-x-2 bg-slate-800 p-1 rounded-lg">
        <button className={getButtonClasses('reader')} onClick={() => setActiveTab('reader')}>
          <Icon type="file-text" className="w-5 h-5 mr-2" />
          Reader
        </button>
        <button className={getButtonClasses('wordbank')} onClick={() => setActiveTab('wordbank')}>
          <Icon type="book" className="w-5 h-5 mr-2" />
          Word Bank ({wordCount})
        </button>
      </div>
    </div>
  );
};

export default Tabs;

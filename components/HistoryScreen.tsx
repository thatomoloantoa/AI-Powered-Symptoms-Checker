
import React from 'react';
import { HistoryEntry } from '../types';
import { BackArrowIcon } from './icons';

interface HistoryScreenProps {
  history: HistoryEntry[];
  onBack: () => void;
  onSelectEntry: (entry: HistoryEntry) => void;
}

const getSeverityBorderClass = (severity: string) => {
    switch (severity.toLowerCase()) {
        case 'mild': return 'border-l-4 border-green-500';
        case 'moderate': return 'border-l-4 border-yellow-500';
        case 'severe': return 'border-l-4 border-red-500';
        default: return 'border-l-4 border-gray-300';
    }
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onBack, onSelectEntry }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center p-4 bg-white border-b">
        <button onClick={onBack} className="text-gray-700 mr-4">
          <BackArrowIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Patient History</h1>
      </header>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {history.map((entry, index) => (
            <button
              key={index}
              onClick={() => onSelectEntry(entry)}
              className={`w-full text-left p-4 bg-white rounded-lg shadow-sm border ${getSeverityBorderClass(entry.severity)} hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200 flex flex-col justify-center`}
            >
              <p className="text-sm text-gray-500 mb-1">{entry.date}</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {entry.condition} ({entry.severity})
              </h2>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;

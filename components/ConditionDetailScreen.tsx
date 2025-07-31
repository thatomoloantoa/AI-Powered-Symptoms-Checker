
import React from 'react';
import { jsPDF } from 'jspdf';
import { Condition } from '../types';
import { BackArrowIcon, DownloadIcon, ShareIcon } from './icons';

interface ConditionDetailScreenProps {
  condition: Condition | null;
  onBack: () => void;
  isLoading: boolean;
}

const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
        case 'mild': return 'bg-green-100 text-green-800';
        case 'moderate': return 'bg-yellow-100 text-yellow-800';
        case 'severe': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const ConditionDetailScreen: React.FC<ConditionDetailScreenProps> = ({ condition, onBack, isLoading }) => {
  if (!condition) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-4 items-center justify-center">
        <p className="text-gray-600 mb-4">No condition selected.</p>
        <button onClick={onBack} className="text-teal-500 font-semibold">Go Back</button>
      </div>
    );
  }

  const handleExport = () => {
    if (!condition) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(condition.name, 15, 20);

    // Severity
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Severity: ${condition.severity}`, 15, 30);

    // Description
    const descriptionText = doc.splitTextToSize(condition.description || 'No description available.', pageWidth - 30);
    doc.text(descriptionText, 15, 40);
    
    // Disclaimer (at the bottom)
    doc.setFontSize(8);
    doc.setTextColor(150);
    const disclaimer = "This information is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.";
    const disclaimerText = doc.splitTextToSize(disclaimer, pageWidth - 30);
    doc.text(disclaimerText, 15, pageHeight - 25);


    doc.save(`${condition.name.replace(/\s/g, '_')}_Details.pdf`);
  };

  const handleShare = async () => {
    if (!condition) return;

    const shareData = {
      title: `SmartHealth AI: ${condition.name} Details`,
      text: `Condition: ${condition.name}\nSeverity: ${condition.severity}\n\nDescription:\n${condition.description}\n\nDisclaimer: This information is for informational purposes only and is not a substitute for professional medical advice.`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // We can ignore the error if the user cancels the share action.
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing content:', err);
        }
      }
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };


  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center p-4 bg-white border-b sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-700 mr-4 p-1 rounded-full hover:bg-gray-100">
          <BackArrowIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 truncate">{condition.name}</h1>
      </header>
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{condition.name}</h2>
                 <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSeverityClass(condition.severity)}`}>
                    {condition.severity}
                </span>
            </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Details</h3>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="text-gray-600 space-y-4 prose prose-sm max-w-none">
                    {condition.description?.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                       <p key={index} className="leading-relaxed">{paragraph}</p>
                    )) || <p>No detailed description available.</p>}
                </div>
            )}
        </div>
      </div>
      
      <footer className="p-4 bg-white border-t space-y-3 sticky bottom-0 z-10">
        <p className="text-center text-xs text-gray-500 px-2">
            This information is for informational purposes only and is not a substitute for professional medical advice.
        </p>
        <div className="flex items-center space-x-3">
            <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center py-3 px-4 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-md hover:bg-gray-100 transition-colors duration-300"
                aria-label="Export details"
            >
                <DownloadIcon className="w-5 h-5 mr-2"/>
                Export
            </button>
            <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center py-3 px-4 bg-blue-500 text-white font-bold rounded-lg text-md hover:bg-blue-600 transition-colors duration-300"
                aria-label="Share details"
            >
                <ShareIcon className="w-5 h-5 mr-2"/>
                Share
            </button>
        </div>
      </footer>
    </div>
  );
};

export default ConditionDetailScreen;
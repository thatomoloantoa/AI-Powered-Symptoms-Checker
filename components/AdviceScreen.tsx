import React from 'react';
import { BackArrowIcon } from './icons';

interface AdviceScreenProps {
  advice: string | null;
  onBack: () => void;
  onRestart: () => void;
  onPrepareForVisit: () => void;
  isPrepLoading: boolean;
}

const AdviceScreen: React.FC<AdviceScreenProps> = ({ advice, onBack, onRestart, onPrepareForVisit, isPrepLoading }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center p-4 bg-white border-b">
        <button onClick={onBack} className="text-gray-700 mr-4 p-1 rounded-full hover:bg-gray-100">
          <BackArrowIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">General Advice</h1>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-700 space-y-4 prose prose-base max-w-none">
            {advice ? (
              advice.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                <p key={index} className="leading-relaxed">{paragraph}</p>
              ))
            ) : (
              <p>No advice available. Please go back and try again.</p>
            )}
          </div>
        </div>
      </div>

      <footer className="p-6 bg-white border-t space-y-4">
        <p className="text-center text-sm text-gray-600">
          This advice is for informational purposes. Always consult with a healthcare professional for a proper diagnosis and treatment.
        </p>
         <button
          onClick={onPrepareForVisit}
          disabled={isPrepLoading}
          className="w-full py-3 px-6 bg-teal-500 text-white font-bold rounded-lg text-lg hover:bg-teal-600 transition-colors duration-300 disabled:bg-teal-300 disabled:cursor-wait flex items-center justify-center"
        >
          {isPrepLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Guide...
            </>
          ) : "Prepare for Doctor's Visit"}
        </button>
        <button
          onClick={onRestart}
          disabled={isPrepLoading}
          className="w-full py-3 px-6 bg-white border border-slate-800 text-slate-800 font-bold rounded-lg text-lg hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50"
        >
          Start New Checkup
        </button>
      </footer>
    </div>
  );
};

export default AdviceScreen;

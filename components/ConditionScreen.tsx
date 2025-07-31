import React from 'react';
import { Condition } from '../types';
import { BackArrowIcon, MoreIcon } from './icons';

interface ConditionScreenProps {
  conditions: Condition[];
  onRestart: () => void;
  onBack: () => void;
  onSelectCondition: (condition: Condition) => void;
  onReviewAdvice: () => void;
  isAdviceLoading: boolean;
}

const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
        case 'mild': return 'bg-green-100 text-green-800';
        case 'moderate': return 'bg-yellow-100 text-yellow-800';
        case 'severe': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const ConditionScreen: React.FC<ConditionScreenProps> = ({ conditions, onRestart, onBack, onSelectCondition, onReviewAdvice, isAdviceLoading }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <button onClick={onBack} className="text-gray-700">
          <BackArrowIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Potential Conditions</h1>
        <button className="text-gray-700">
          <MoreIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <button
              key={index}
              onClick={() => onSelectCondition(condition)}
              className="w-full text-left p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
              aria-label={`View details for ${condition.name}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{condition.name}</h2>
                  <p className="text-sm text-gray-500">{condition.matchingSymptoms} matching symptoms</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSeverityClass(condition.severity)}`}>
                  {condition.severity}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <footer className="p-6 bg-white border-t space-y-3">
        <button
          onClick={onReviewAdvice}
          disabled={isAdviceLoading}
          className="w-full py-3 px-6 bg-teal-500 text-white font-bold rounded-lg text-lg hover:bg-teal-600 transition-colors duration-300 disabled:bg-teal-300 disabled:cursor-wait flex items-center justify-center"
        >
          {isAdviceLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : "Review Advice"}
        </button>
        <button
          onClick={onRestart}
          disabled={isAdviceLoading}
          className="w-full py-3 px-6 bg-white border border-slate-800 text-slate-800 font-bold rounded-lg text-lg hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50"
        >
          Start New Checkup
        </button>
        <p className="text-center text-xs text-gray-500 pt-2">
          This is not a medical diagnosis. Click "Review Advice" for next steps.
        </p>
      </footer>
    </div>
  );
};

export default ConditionScreen;
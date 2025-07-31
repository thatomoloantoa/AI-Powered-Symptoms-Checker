import React from 'react';
import { DoctorVisitPrep } from '../types';
import { BackArrowIcon } from './icons';

interface DoctorVisitPrepScreenProps {
  prepData: DoctorVisitPrep | null;
  isLoading: boolean;
  onBack: () => void;
  onRestart: () => void;
}

const FullScreenLoader: React.FC = () => (
    <div className="flex flex-col h-full bg-gray-50 items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Generating your guide...</p>
    </div>
);

const DoctorVisitPrepScreen: React.FC<DoctorVisitPrepScreenProps> = ({ prepData, isLoading, onBack, onRestart }) => {
    
    if (isLoading) {
        return <FullScreenLoader />;
    }

    if (!prepData) {
        return (
             <div className="flex flex-col h-full bg-gray-50 p-4 items-center justify-center">
                <p className="text-gray-600 mb-4 text-center">Could not load the preparation guide. Please try again.</p>
                <button onClick={onBack} className="text-teal-500 font-semibold">Go Back</button>
            </div>
        );
    }

    const renderSection = (title: string, items: string[]) => (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
            {items && items.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            ) : (
                <p className="text-gray-500">No suggestions available for this section.</p>
            )}
        </div>
    );
    
    return (
        <div className="flex flex-col h-full bg-gray-50">
            <header className="flex items-center p-4 bg-white border-b sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-700 mr-4 p-1 rounded-full hover:bg-gray-100">
                    <BackArrowIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Prepare for Doctor's Visit</h1>
            </header>
            
            <div className="flex-1 p-6 overflow-y-auto">
                {renderSection("Questions to Ask Your Doctor", prepData.questions)}
                {renderSection("Information to Prepare", prepData.preparation)}
                {renderSection("What to Expect", prepData.expectations)}
            </div>
            
            <footer className="p-6 bg-white border-t space-y-4 sticky bottom-0 z-10">
                <p className="text-center text-sm text-gray-600">
                    This guide is intended to help you prepare. It is not medical advice.
                </p>
                <button
                    onClick={onRestart}
                    className="w-full py-3 px-6 bg-teal-500 text-white font-bold rounded-lg text-lg hover:bg-teal-600 transition-colors duration-300"
                >
                    Start New Checkup
                </button>
            </footer>
        </div>
    );
};

export default DoctorVisitPrepScreen;


import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">SmartHealth AI</h2>
        <p className="text-xl text-gray-600 mb-12">Your Digital Symptom Checker</p>
      </div>
      <button
        onClick={onStart}
        className="w-full py-4 px-6 bg-teal-500 text-white font-bold rounded-full text-lg shadow-lg hover:bg-teal-600 transition-colors duration-300"
      >
        Start Checkup
      </button>
    </div>
  );
};

export default WelcomeScreen;

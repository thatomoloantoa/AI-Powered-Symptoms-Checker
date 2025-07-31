import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SendIcon, MicrophoneIcon, HistoryIcon } from './icons';

interface ChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onShowHistory: () => void;
  isLoading: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ messages, onSendMessage, onShowHistory, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }
    
    if (isLoading) return;

    const recognitionInstance = new SpeechRecognition();
    recognitionRef.current = recognitionInstance;

    recognitionInstance.lang = 'en-US';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setInput(''); // Clear input for new recording
    };

    recognitionInstance.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone permission was denied. Please enable it in your browser settings to use this feature.');
      } else if (event.error === 'no-speech') {
        // This error occurs if no speech is detected.
        // We can handle it silently without alerting the user.
        // The UI will stop listening, which is sufficient feedback.
        console.warn('No speech was detected.');
      }
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    
    try {
      recognitionInstance.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
      setIsListening(false);
    }
  };

  useEffect(() => {
    // Cleanup function to stop listening if component unmounts
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/50">
            <h1 className="text-lg font-bold text-gray-700">Symptom Checker</h1>
            <button onClick={onShowHistory} className="text-gray-600 hover:text-teal-500">
                <HistoryIcon className="w-6 h-6"/>
            </button>
        </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-white ${
                msg.sender === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                 <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-200 text-gray-800 rounded-bl-none">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isListening
                ? 'text-red-500 bg-red-100 animate-pulse'
                : 'text-gray-500 hover:text-teal-500 hover:bg-teal-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <MicrophoneIcon className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening...' : 'Type a message....'}
            className="flex-1 px-4 py-2 bg-gray-100 text-black placeholder:text-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 text-gray-500 rounded-full hover:bg-teal-100 hover:text-teal-500 disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
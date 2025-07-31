import React, { useState, useCallback } from 'react';
import { Screen, ChatMessage, Condition, HistoryEntry, DoctorVisitPrep } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import ChatScreen from './components/ChatScreen';
import ConditionScreen from './components/ConditionScreen';
import HistoryScreen from './components/HistoryScreen';
import ConditionDetailScreen from './components/ConditionDetailScreen';
import AdviceScreen from './components/AdviceScreen';
import DoctorVisitPrepScreen from './components/DoctorVisitPrepScreen';
import { getPotentialConditions, getConditionDetails, getGeneralAdvice, getDoctorVisitPrep } from './services/geminiService';
import { PATIENT_HISTORY } from './constants';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.WELCOME);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: 'Hello, how can I help you today?', sender: 'ai' },
  ]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [doctorPrepData, setDoctorPrepData] = useState<DoctorVisitPrep | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState<boolean>(false);
  const [isPrepLoading, setIsPrepLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [detailSourceScreen, setDetailSourceScreen] = useState<Screen>(Screen.CONDITIONS);


  const resetChat = () => {
    setMessages([{ id: 1, text: 'Hello, how can I help you today?', sender: 'ai' }]);
    setConditions([]);
    setSelectedCondition(null);
    setAdvice(null);
    setDoctorPrepData(null);
    setError(null);
  };

  const handleStart = () => {
    resetChat();
    setCurrentScreen(Screen.CHAT);
  };

  const handleRestart = () => {
    resetChat();
    setCurrentScreen(Screen.CHAT);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    const newUserMessage: ChatMessage = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPotentialConditions(text);
      setConditions(result);
      setCurrentScreen(Screen.CONDITIONS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      const aiErrorMessage: ChatMessage = { 
        id: Date.now() + 1, 
        text: `Sorry, I couldn't analyze your symptoms. ${errorMessage}`, 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectCondition = useCallback(async (condition: Condition) => {
    setCurrentScreen(Screen.CONDITION_DETAIL);
    // If we already have a description from a previous fetch, don't re-fetch.
    const cachedCondition = conditions.find(c => c.name === condition.name && c.description);
    if (cachedCondition) {
      setSelectedCondition(cachedCondition);
      return;
    }
    
    setSelectedCondition(condition);
    setIsDetailLoading(true);
    setError(null);

    try {
      const description = await getConditionDetails(condition.name);
      const updatedCondition = { ...condition, description };
      
      setConditions(prevConditions => {
        const existing = prevConditions.find(c => c.name === condition.name);
        if (existing) {
          return prevConditions.map(c => 
            c.name === condition.name ? updatedCondition : c
          );
        }
        return [...prevConditions, updatedCondition];
      });
      setSelectedCondition(updatedCondition);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setSelectedCondition(prev => prev ? { ...prev, description: `Could not load details: ${errorMessage}` } : null);
    } finally {
      setIsDetailLoading(false);
    }
  }, [conditions]);

  const handleSelectHistoryEntry = useCallback((entry: HistoryEntry) => {
    setDetailSourceScreen(Screen.HISTORY);
    const conditionFromHistory: Condition = {
      name: entry.condition,
      severity: entry.severity,
      matchingSymptoms: 0, // This data is not available in the mock history
    };
    handleSelectCondition(conditionFromHistory);
  }, [handleSelectCondition]);

  const handleSelectConditionFromList = useCallback((condition: Condition) => {
    setDetailSourceScreen(Screen.CONDITIONS);
    handleSelectCondition(condition);
  }, [handleSelectCondition]);

  const handleReviewAdvice = useCallback(async () => {
    if (!conditions || conditions.length === 0) return;

    setIsAdviceLoading(true);
    setError(null);

    try {
      const result = await getGeneralAdvice(conditions);
      setAdvice(result);
      setCurrentScreen(Screen.ADVICE);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      alert(`Could not get advice: ${errorMessage}`);
    } finally {
      setIsAdviceLoading(false);
    }
  }, [conditions]);

  const handlePrepareForVisit = useCallback(async () => {
    if (!conditions || conditions.length === 0) return;

    setIsPrepLoading(true);
    setError(null);

    try {
      const result = await getDoctorVisitPrep(conditions);
      setDoctorPrepData(result);
      setCurrentScreen(Screen.DOCTOR_PREP);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      alert(`Could not generate preparation guide: ${errorMessage}`);
    } finally {
      setIsPrepLoading(false);
    }
  }, [conditions]);


  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.WELCOME:
        return <WelcomeScreen onStart={handleStart} />;
      case Screen.CHAT:
        return <ChatScreen 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                  onShowHistory={() => setCurrentScreen(Screen.HISTORY)}
                  isLoading={isLoading} 
                />;
      case Screen.CONDITIONS:
        return <ConditionScreen 
                  conditions={conditions} 
                  onRestart={handleRestart}
                  onBack={() => setCurrentScreen(Screen.CHAT)}
                  onSelectCondition={handleSelectConditionFromList}
                  onReviewAdvice={handleReviewAdvice}
                  isAdviceLoading={isAdviceLoading}
                />;
      case Screen.HISTORY:
        return <HistoryScreen 
                  history={PATIENT_HISTORY} 
                  onBack={() => setCurrentScreen(Screen.CHAT)}
                  onSelectEntry={handleSelectHistoryEntry}
                />;
      case Screen.CONDITION_DETAIL:
        return <ConditionDetailScreen
                  condition={selectedCondition}
                  onBack={() => setCurrentScreen(detailSourceScreen)}
                  isLoading={isDetailLoading}
               />
      case Screen.ADVICE:
        return <AdviceScreen
                  advice={advice}
                  onBack={() => setCurrentScreen(Screen.CONDITIONS)}
                  onRestart={handleRestart}
                  onPrepareForVisit={handlePrepareForVisit}
                  isPrepLoading={isPrepLoading}
                />;
      case Screen.DOCTOR_PREP:
        return <DoctorVisitPrepScreen
                  prepData={doctorPrepData}
                  isLoading={isPrepLoading}
                  onBack={() => setCurrentScreen(Screen.ADVICE)}
                  onRestart={handleRestart}
                />
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-200 p-4">
      <div className="w-full max-w-[400px] h-[844px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border-8 border-black">
        {renderScreen()}
      </div>
    </main>
  );
};

export default App;

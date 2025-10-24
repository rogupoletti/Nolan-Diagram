import React, { useState, useEffect, useContext } from 'react';
import { QuizQuestion, Answer, GameState, UserData, Results, Submission, Language } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import QuizScreen from './components/QuizScreen';
import DataCollectionScreen from './components/DataCollectionScreen';
import ResultsScreen from './components/ResultsScreen';
import AdminIndex from './components/admin/AdminIndex';
import { saveSubmission, getQuestions } from './services/dbService';
import { LanguageContext } from './context/LanguageContext';
import { useTranslation } from './hooks/useTranslation';
import LanguageSwitcher from './components/LanguageSwitcher';

const getPoliticalCategoryKey = (economic: number, personal: number): string => {
    if (economic > 10 && personal > 10) return "libertarian";
    if (economic < -10 && personal > 10) return "left_liberal";
    if (economic > 10 && personal < -10) return "right_conservative";
    if (economic < -10 && personal < -10) return "authoritarian";
    if (Math.abs(economic) <= 10 && Math.abs(personal) <= 10) return "centrist";
    
    if (economic > 10) return "economic_right";
    if (economic < -10) return "economic_left";
    if (personal > 10) return "social_libertarian";
    if (personal < -10) return "social_authoritarian";
    
    return "centrist";
};

const QuizFlow: React.FC = () => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<GameState>(GameState.Welcome);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<Results | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const fetchedQuestions = await getQuestions();
      setQuestions(fetchedQuestions);
      setIsLoading(false);
    };
    fetchQuestions();
  }, []);

  const startQuiz = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setGameState(GameState.Quiz);
  };

  const handleAnswer = (question: QuizQuestion, value: number) => {
    const newAnswers = [...answers, { question, value }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameState(GameState.Form);
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswers(prev => prev.slice(0, prev.length - 1));
    } else {
      setGameState(GameState.Welcome);
    }
  };
  
  const goBack = () => {
    if (gameState === GameState.Form) {
      setGameState(GameState.Quiz);
      // We are on the form screen, so the last question was just answered.
      // Set the index to the last question.
      setCurrentQuestionIndex(questions.length - 1);
    } else if (gameState === GameState.Results) {
      setGameState(GameState.Form);
    }
  };


  const handleSubmitData = async (userData: UserData) => {
    let economicScore = 0;
    let personalScore = 0;

    const economicQuestions = questions.filter(q => q.type === 'economic');
    const personalQuestions = questions.filter(q => q.type === 'personal');
    
    const maxEconomicScore = economicQuestions.reduce((sum, q) => sum + Math.abs(q.weight) * 2, 0);
    const maxPersonalScore = personalQuestions.reduce((sum, q) => sum + Math.abs(q.weight) * 2, 0);

    answers.forEach(answer => {
      const score = answer.value * answer.question.weight;
      if (answer.question.type === 'economic') {
        economicScore += score;
      } else {
        personalScore += score;
      }
    });
    
    const finalEconomicScore = maxEconomicScore > 0 ? (economicScore / maxEconomicScore) * 100 : 0;
    const finalPersonalScore = maxPersonalScore > 0 ? (personalScore / maxPersonalScore) * 100 : 0;
    const categoryKey = getPoliticalCategoryKey(finalEconomicScore, finalPersonalScore);

    const finalResults: Results = {
      economic: finalEconomicScore,
      personal: finalPersonalScore,
      categoryKey,
    };
    
    const submission: Omit<Submission, 'id'> = {
      userData,
      answers,
      results: finalResults,
      timestamp: new Date().toISOString(),
    };

    await saveSubmission(submission);

    setResults(finalResults);
    setGameState(GameState.Results);
  };

  const restartQuiz = () => {
    setGameState(GameState.Welcome);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setResults(null);
  };
  
  const renderScreen = () => {
    if (isLoading) {
      return <div className="text-center text-lg p-8 flex-grow flex items-center justify-center">{t('loadingQuiz')}</div>;
    }

    if (questions.length === 0) {
      return (
        <div className="text-center bg-white p-8 flex-grow flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">{t('quizNotAvailable.title')}</h2>
          <p className="text-gray-600">{t('quizNotAvailable.description')}</p>
        </div>
      );
    }

    switch (gameState) {
      case GameState.Welcome:
        return <WelcomeScreen onStart={startQuiz} />;
      case GameState.Quiz:
        return (
          <QuizScreen
            question={questions[currentQuestionIndex]}
            onAnswer={handleAnswer}
            onBack={handleBack}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />
        );
      case GameState.Form:
        return <DataCollectionScreen onSubmit={handleSubmitData} onBack={goBack} />;
      case GameState.Results:
        return results && <ResultsScreen results={results} onRestart={restartQuiz} onBack={goBack} />;
      default:
        return <WelcomeScreen onStart={startQuiz} />;
    }
  };

  return <>{renderScreen()}</>;
};


const App: React.FC = () => {
  const [route, setRoute] = useState<'quiz' | 'admin'>('quiz');
  const { setLanguage } = useContext(LanguageContext);
  const validLanguages: Language[] = ['en', 'es', 'pt-BR'];

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const path = hash.replace(/^#\/?/, '');
      const hashParts = path.split('/');

      let lang: Language = 'en';
      let currentRoute: 'quiz' | 'admin' = 'quiz';
      
      // FIX: This comparison appears to be unintentional because the types 'Language' and '"admin"' have no overlap.
      // The original code incorrectly asserted that the first part of the hash was always a `Language`,
      // which caused a type error when it was 'admin'. The logic is now corrected to handle both cases.
      const potentialLang = hashParts[0];
      const potentialRoute = hashParts[1];

      const matchedLang = validLanguages.find(l => l === potentialLang);

      if (matchedLang) {
        lang = matchedLang;
        if (potentialRoute === 'admin') {
          currentRoute = 'admin';
        }
      } else if (potentialLang === 'admin') {
        currentRoute = 'admin';
        // lang remains 'en' (default)
      }
      
      setLanguage(lang);
      setRoute(currentRoute);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [setLanguage]);


  return (
    <main className="font-sans min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mx-auto bg-white shadow-xl rounded-2xl flex flex-col overflow-y-auto" style={{ minHeight: '600px', maxHeight: '90vh' }}>
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>
        {route === 'admin' ? <AdminIndex /> : <QuizFlow />}
      </div>
    </main>
  );
};

export default App;
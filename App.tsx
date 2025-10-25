import React, { useState, useEffect, useContext } from 'react';
import { QuizQuestion, Answer, GameState, UserData, Results, Submission, Language } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import QuizScreen from './components/QuizScreen';
import DataCollectionScreen from './components/DataCollectionScreen';
import ResultsScreen from './components/ResultsScreen';
import AdminIndex from './components/admin/AdminIndex';
import CategoryScreen from './components/CategoryScreen';
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

const CATEGORY_KEYS = ["libertarian", "left_liberal", "right_conservative", "authoritarian", "centrist", "economic_right", "economic_left", "social_libertarian", "social_authoritarian"];
const VALID_LANGUAGES: Language[] = ['en', 'es', 'pt-BR'];


const App: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useContext(LanguageContext);
  
  // App-level routing state
  const [route, setRoute] = useState<{ view: 'quiz' | 'admin' | 'category'; key?: string }>({ view: 'quiz' });

  // Quiz-specific state
  const [gameState, setGameState] = useState<GameState>(GameState.Welcome);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<Results | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Data fetching
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const fetchedQuestions = await getQuestions();
      setQuestions(fetchedQuestions);
      setIsLoading(false);
    };
    fetchQuestions();
  }, []);

  // Main router effect
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const path = hash.replace(/^#\/?/, '');
      const hashParts = path.split('/'); // e.g., "en/libertarian" -> ["en", "libertarian"]

      let lang: Language = 'en';
      let routePart = '';

      const firstPartIsLang = VALID_LANGUAGES.includes(hashParts[0] as Language);
      
      if (firstPartIsLang) {
        lang = hashParts[0] as Language;
        routePart = hashParts[1];
      } else {
        routePart = hashParts[0];
      }

      if (lang !== language) {
        setLanguage(lang);
      }
      
      if (routePart === 'admin') {
        setRoute({ view: 'admin' });
      } else if (CATEGORY_KEYS.includes(routePart)) {
        setRoute({ view: 'category', key: routePart });
        // If we land on a category page coming from the form, update state to Results
        if (gameState === GameState.Form) {
            setGameState(GameState.Results);
        }
      } else {
        setRoute({ view: 'quiz' });
        // If we came from a results page, reset the quiz flow to welcome
        if (gameState === GameState.Results) {
           setGameState(GameState.Welcome);
           setAnswers([]);
           setCurrentQuestionIndex(0);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [setLanguage, language, gameState]);


  // Quiz flow handlers
  const startQuiz = () => {
    setResults(null); // Clear previous results when starting fresh
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
  
  const goBackToQuiz = () => {
    if (gameState === GameState.Form) {
      setGameState(GameState.Quiz);
      setCurrentQuestionIndex(questions.length - 1);
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
    // Let the router handle the gameState transition by setting the hash.
    window.location.hash = `#/${language}/${categoryKey}`;
  };

  const restartQuiz = () => {
    setResults(null);
    setGameState(GameState.Welcome);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    // Navigate to the base URL for the current language
    window.location.hash = `#/${language}`;
  };
  
  const renderContent = () => {
    if (route.view === 'admin') {
        return <AdminIndex />;
    }

    if (isLoading) {
      return <div className="text-center text-lg p-8 flex-grow flex items-center justify-center">{t('loadingQuiz')}</div>;
    }
    
    if (route.view === 'category' && route.key) {
        // If we have results in state and they match the URL, show the user's specific results.
        if (results && results.categoryKey === route.key) {
            return <ResultsScreen results={results} onRestart={restartQuiz} />;
        }
        // Otherwise, show the generic page for that category.
        return <CategoryScreen categoryKey={route.key} />;
    }

    // Default to quiz flow
    if (questions.length === 0 && !isLoading) {
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
        return <DataCollectionScreen onSubmit={handleSubmitData} onBack={goBackToQuiz} />;
      // Results are now handled by the router, but have a fallback
      case GameState.Results:
        return results ? <ResultsScreen results={results} onRestart={restartQuiz} /> : <WelcomeScreen onStart={startQuiz} />;
      default:
        return <WelcomeScreen onStart={startQuiz} />;
    }
  };

  return (
    <main className="font-sans min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mx-auto bg-white shadow-xl rounded-2xl flex flex-col overflow-y-auto" style={{ minHeight: '600px', maxHeight: '90vh' }}>
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>
        {renderContent()}
      </div>
    </main>
  );
};

export default App;

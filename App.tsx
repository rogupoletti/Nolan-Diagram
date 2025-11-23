import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { VALID_LANGUAGES } from './constants';
import { DEFAULT_LANGUAGE } from './config';

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

// Wrapper component to handle language and category params
const RouteHandler: React.FC<{
  element: React.ReactNode;
  setLanguage: (lang: Language) => void;
  currentLanguage: Language;
}> = ({ element, setLanguage, currentLanguage }) => {
  const { lang, category } = useParams<{ lang?: string; category?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (lang && VALID_LANGUAGES.includes(lang as Language)) {
      if (lang !== currentLanguage) {
        setLanguage(lang as Language);
      }
    } else if (lang) {
      // Invalid language, redirect to default
      navigate(`/${DEFAULT_LANGUAGE}`, { replace: true });
    }
  }, [lang, currentLanguage, setLanguage, navigate]);

  return <>{element}</>;
};


const App: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Update page title based on route and language
  useEffect(() => {
    const baseTitle = t('welcome.title');
    let pageTitle = baseTitle;

    if (location.pathname.includes('/admin')) {
      pageTitle = `${t('admin.title')} | ${baseTitle}`;
    } else if (location.pathname.includes('/category/')) { // Check for category in path
      // This is a bit tricky without the exact param, but we can infer or let the child component handle it.
      // For now, let's rely on the specific screens to set titles if needed, or just keep generic.
      // Or we can parse location.pathname manually if we really want it here.
      const pathParts = location.pathname.split('/');
      const category = pathParts[pathParts.length - 1]; // simplistic
      if (category && !['en', 'es', 'pt-BR'].includes(category)) {
        const categoryName = t(`categories.${category}`);
        pageTitle = `${categoryName} | ${baseTitle}`;
      }
    } else {
      switch (gameState) {
        case GameState.Welcome:
          pageTitle = `${t('welcome.mainTitle')} | ${baseTitle}`;
          break;
        case GameState.Quiz:
          pageTitle = `${t('quiz.title')} | ${baseTitle}`;
          break;
        case GameState.Form:
          pageTitle = `${t('form.title')} | ${baseTitle}`;
          break;
        case GameState.Results:
          if (results) {
            const categoryName = t(`categories.${results.categoryKey}`);
            pageTitle = `${categoryName} | ${baseTitle}`;
          } else {
            pageTitle = `${t('results.title')} | ${baseTitle}`;
          }
          break;
        default:
          pageTitle = baseTitle;
      }
    }

    document.title = pageTitle;
  }, [location, gameState, results, t]);


  // Quiz flow handlers
  const startQuiz = () => {
    setResults(null);
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
    setGameState(GameState.Results);
    navigate(`/${language}/${categoryKey}`);
  };

  const restartQuiz = () => {
    setResults(null);
    setGameState(GameState.Welcome);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    navigate(`/${language}`);
  };

  const QuizContent = () => {
    if (isLoading) {
      return <div className="text-center text-lg p-8 flex-grow flex items-center justify-center">{t('loadingQuiz')}</div>;
    }

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
      case GameState.Results:
        // If we are in Results state but URL is just /, show results.
        // Ideally we should redirect to /lang/category, which handleSubmitData does.
        // But if we are here, it means we are rendering the quiz flow.
        return results ? <ResultsScreen results={results} onRestart={restartQuiz} /> : <WelcomeScreen onStart={startQuiz} />;
      default:
        return <WelcomeScreen onStart={startQuiz} />;
    }
  };

  const CategoryPage = () => {
    const { category } = useParams<{ category: string }>();

    // If we have results in state and they match the URL, show the user's specific results.
    if (results && results.categoryKey === category) {
      return <ResultsScreen results={results} onRestart={restartQuiz} />;
    }

    // Otherwise, show the generic page for that category.
    if (category) {
      return <CategoryScreen categoryKey={category} />;
    }
    return <QuizContent />;
  };

  const containerMaxWidth = location.pathname.includes('/admin') ? 'max-w-6xl' : 'max-w-md';

  return (
    <main className="font-sans min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className={`relative w-full ${containerMaxWidth} mx-auto bg-white shadow-xl rounded-2xl flex flex-col overflow-y-auto`} style={{ minHeight: '600px', maxHeight: '90vh' }}>
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>

        <Routes>
          {/* Admin routes must come first to avoid being caught by :lang/:category */}
          <Route path="/admin" element={<AdminIndex />} />
          <Route path="/:lang/admin" element={<AdminIndex />} />

          <Route path="/:lang" element={
            <RouteHandler setLanguage={setLanguage} currentLanguage={language} element={<QuizContent />} />
          } />

          <Route path="/:lang/:category" element={
            <RouteHandler setLanguage={setLanguage} currentLanguage={language} element={<CategoryPage />} />
          } />

          <Route path="/" element={
            <RouteHandler setLanguage={setLanguage} currentLanguage={language} element={<QuizContent />} />
          } />

          {/* Catch all redirect to default lang */}
          <Route path="*" element={<QuizContent />} />

        </Routes>
      </div>
    </main>
  );
};

export default App;

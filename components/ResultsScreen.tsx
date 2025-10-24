import React, { useState, useEffect, useContext } from 'react';
import { Results } from '../types';
import Button from './ui/Button';
import NolanDiagram from './NolanDiagram';
import { getCategoryDescription } from '../services/dbService';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageContext } from '../context/LanguageContext';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => (
  <div className="grid grid-cols-[4rem_1fr_4rem] items-center h-16 border-b border-gray-200">
    <div className="flex justify-start pl-2">
      {onBack && (
        <button onClick={onBack} className="p-2" aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
    <h1 className="text-lg font-semibold text-gray-800 text-center truncate">{title}</h1>
    <div className="flex justify-end pr-2">
      {/* This space is reserved for the absolutely positioned language switcher */}
    </div>
  </div>
);


interface ResultsScreenProps {
  results: Results;
  onRestart: () => void;
  onBack: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onRestart, onBack }) => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const { categoryKey, economic, personal } = results;
  const categoryName = t(`categories.${categoryKey}`);

  useEffect(() => {
    const fetchDescription = async () => {
      setIsLoading(true);
      const desc = await getCategoryDescription(categoryKey, categoryName, language);
      setDescription(desc);
      setIsLoading(false);
    };

    fetchDescription();
  }, [categoryKey, categoryName, language]);

  return (
    <div className="flex flex-col flex-grow">
      <Header title={t('results.title')} onBack={onBack}/>
      <div className="p-6 text-center flex-grow">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{t('results.yourCompass')}</h2>
        
        <div className="max-w-xs mx-auto my-6">
          <NolanDiagram economic={economic} personal={personal} />
        </div>
        
        <div className="text-left">
           <h3 className="text-xl font-bold text-gray-800 mb-2">{categoryName}</h3>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      </div>
      <div className="p-4 mt-auto space-y-3">
        <Button onClick={() => alert('Share feature coming soon!')} fullWidth>
          {t('buttons.shareResults')}
        </Button>
        <Button onClick={onRestart} variant="secondary" fullWidth>
          {t('buttons.retakeQuiz')}
        </Button>
      </div>
    </div>
  );
};

export default ResultsScreen;
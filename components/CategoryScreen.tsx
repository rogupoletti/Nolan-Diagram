import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { getCategoryDescription } from '../services/dbService';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageContext } from '../context/LanguageContext';

interface CategoryScreenProps {
  categoryKey: string;
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ categoryKey }) => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const categoryName = t(`categories.${categoryKey}`);

  useEffect(() => {
    const fetchDescription = async () => {
      setIsLoading(true);
      const desc = await getCategoryDescription(categoryKey, language);
      setDescription(desc);
      setIsLoading(false);
    };

    fetchDescription();
  }, [categoryKey, language]);

  const startQuiz = () => {
    navigate(`/${language}`);
  };

  const renderDescription = (text: string) => {
    return text.split('\n').map((paragraph, i) => (
      <p key={i}>
        {paragraph.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    ));
  };

  return (
    <div className="flex flex-col flex-grow">
      <div className="p-8 text-center flex-grow flex flex-col justify-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{categoryName}</h2>
        {isLoading ? (
          <div className="space-y-2 animate-pulse my-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ) : (
          <div className="text-gray-600 space-y-2 text-left my-4">{renderDescription(description)}</div>
        )}
      </div>
      <div className="p-6 mt-auto border-t border-gray-200">
        <p className="text-base text-center text-gray-500 mb-6">{t('categoryScreen.prompt')}</p>
        <Button onClick={startQuiz} fullWidth>{t('buttons.startQuiz')}</Button>
      </div>
    </div>
  );
};

export default CategoryScreen;
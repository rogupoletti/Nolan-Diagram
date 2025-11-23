import React from 'react';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col flex-grow text-center p-8 md:p-10">
      <div className="flex-grow flex flex-col justify-center">
        <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase">
          {t('welcome.title')}
        </h2>
        <h1 className="text-4xl font-extrabold my-3 text-slate-800">
          {t('welcome.mainTitle')}
        </h1>
        <p className="text-base text-gray-500 mb-10 max-w-md mx-auto">
          {t('welcome.description')}
        </p>
      </div>
      <div className="mt-auto">
         <Button onClick={onStart} fullWidth>
          {t('buttons.startQuiz')}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
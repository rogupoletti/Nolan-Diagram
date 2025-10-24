import React, { useState, useContext } from 'react';
import { QuizQuestion } from '../types';
import { ANSWER_OPTIONS } from '../constants';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';
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


interface QuizScreenProps {
  question: QuizQuestion;
  onAnswer: (question: QuizQuestion, value: number) => void;
  onBack: () => void;
  currentQuestion: number;
  totalQuestions: number;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ question, onAnswer, onBack, currentQuestion, totalQuestions }) => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const questionText = question.text[language] || question.text.en;

  const handleNext = () => {
    if (selectedValue !== null) {
      onAnswer(question, selectedValue);
      setSelectedValue(null);
    }
  };
  
  const AnswerOption = ({ option, selected, onSelect }: { option: { value: number, labelKey: string }, selected: number | null, onSelect: (value: number) => void}) => {
    const isSelected = selected === option.value;
    return (
      <div 
        onClick={() => onSelect(option.value)} 
        className={`border rounded-lg p-4 flex items-center cursor-pointer transition-colors ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
        role="radio"
        aria-checked={isSelected}
        tabIndex={0}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onSelect(option.value)}
      >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-gray-400'}`}>
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
        </div>
        <span className={`ml-4 font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>{t(option.labelKey)}</span>
      </div>
    )
  };

  return (
    <div className="flex flex-col flex-grow">
      <Header title={t('quiz.title')} onBack={onBack}/>
      <div className="p-6 flex-grow">
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-500 mb-2">{t('quiz.questionOf', { current: currentQuestion, total: totalQuestions })}</p>
          <ProgressBar current={currentQuestion} total={totalQuestions} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">{questionText}</h2>
        <div className="space-y-3">
          {ANSWER_OPTIONS.map((option) => (
            <AnswerOption key={option.value} option={option} selected={selectedValue} onSelect={setSelectedValue} />
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 mt-auto grid grid-cols-2 gap-4">
        <Button variant="secondary" onClick={onBack} disabled={currentQuestion === 1}>{t('buttons.back')}</Button>
        <Button onClick={handleNext} disabled={selectedValue === null}>{t('buttons.next')}</Button>
      </div>
    </div>
  );
};

export default QuizScreen;
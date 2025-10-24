import React, { useState, FormEvent } from 'react';
import { QuizQuestion, Language } from '../../types';
import Button from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

interface QuestionFormProps {
  onSubmit: (question: Omit<QuizQuestion, 'id'> | QuizQuestion) => Promise<void>;
  onCancel: () => void;
  initialData?: QuizQuestion | null;
}

const LANGUAGES: { id: Language; name: string }[] = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Español' },
  { id: 'pt-BR', name: 'Português (BR)' },
];

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { t } = useTranslation();
  const [texts, setTexts] = useState(initialData?.text || { en: '', es: '', 'pt-BR': '' });
  const [type, setType] = useState<'economic' | 'personal'>(initialData?.type || 'economic');
  const [weight, setWeight] = useState<number>(initialData?.weight ?? 1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const inputClass = "w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-50";

  const handleTextChange = (lang: Language, value: string) => {
    setTexts(prev => ({ ...prev, [lang]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!texts.en?.trim()) {
      setError(t('admin.questionForm.errors.textRequired'));
      return;
    }
    setError('');
    setIsSubmitting(true);

    const questionData = {
      text: texts,
      type,
      weight,
    };
    
    if (initialData) {
        await onSubmit({ ...questionData, id: initialData.id });
    } else {
        await onSubmit(questionData);
    }
    // No need to set isSubmitting to false if the component unmounts
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-gray-800">{initialData ? t('admin.questionForm.editTitle') : t('admin.questionForm.addTitle')}</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          {LANGUAGES.map(lang => (
            <div key={lang.id}>
              <label htmlFor={`text-${lang.id}`} className="block text-sm font-medium text-gray-700">
                {t('admin.questionForm.textLabelLang', { lang: lang.name })}
              </label>
              <textarea
                id={`text-${lang.id}`}
                value={texts[lang.id] || ''}
                onChange={e => handleTextChange(lang.id, e.target.value)}
                className={`mt-1 block ${inputClass}`}
                rows={2}
                required={lang.id === 'en'}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">{t('admin.questionForm.typeLabel')}</label>
          <select
            id="type"
            value={type}
            onChange={e => setType(e.target.value as 'economic' | 'personal')}
            className={`mt-1 block ${inputClass}`}
            disabled={isSubmitting}
          >
            <option value="economic">{t('admin.questionForm.types.economic')}</option>
            <option value="personal">{t('admin.questionForm.types.personal')}</option>
          </select>
        </div>
        <div>
           <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
             {t('admin.questionForm.weightLabel')} ({weight.toFixed(1)})
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {t('admin.questionForm.weightDescription')}
          </p>
          <input
            id="weight"
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={weight}
            onChange={e => setWeight(parseFloat(e.target.value))}
            className="mt-1 block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            disabled={isSubmitting}
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-4">
          <Button type="button" onClick={onCancel} variant="secondary" disabled={isSubmitting}>{t('buttons.cancel')}</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('buttons.saving') : (initialData ? t('buttons.updateQuestion') : t('buttons.saveQuestion'))}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
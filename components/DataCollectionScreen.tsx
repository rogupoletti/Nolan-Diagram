import React, { useState } from 'react';
import { UserData } from '../types';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';

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


interface DataCollectionScreenProps {
  onSubmit: (userData: UserData) => Promise<void>;
  onBack: () => void;
}

const DataCollectionScreen: React.FC<DataCollectionScreenProps> = ({ onSubmit, onBack }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({ email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const validate = (): boolean => {
    const newErrors = { email: '', phone: '' };
    let isValid = true;

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = t('form.errors.invalidEmail');
      isValid = false;
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = t('form.errors.invalidPhone');
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      await onSubmit({ email, phone });
      // No need to set isSubmitting to false, as the component will unmount
    }
  };

  return (
    <div className="flex flex-col flex-grow">
      <Header title={t('results.title')} onBack={onBack}/>
      <div className="p-6 flex-grow">
        <h2 className="text-2xl font-bold mb-2 text-center">{t('form.title')}</h2>
        <p className="text-gray-600 mb-8 text-center">
          {t('form.description')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">{t('form.emailLabel')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              placeholder={t('form.emailPlaceholder')}
              required
              disabled={isSubmitting}
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 sr-only">{t('form.phoneLabel')}</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              placeholder={t('form.phonePlaceholder')}
              required
              disabled={isSubmitting}
            />
            {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={isSubmitting} fullWidth>
              {isSubmitting ? t('buttons.saving') : t('buttons.viewResults')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataCollectionScreen;
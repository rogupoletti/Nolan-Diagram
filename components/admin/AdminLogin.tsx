import React, { useState } from 'react';
import { signIn } from '../../services/authService';
import Button from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const inputClass = "w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-blue-500 focus:border-blue-500 bg-gray-50";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(t('admin.login.errorMessage'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-8 flex flex-col items-center justify-center flex-grow">
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          {t('admin.login.title')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('form.emailLabel')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block ${inputClass}`}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('admin.login.passwordLabel')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block ${inputClass}`}
              required
              disabled={isSubmitting}
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div className="text-center pt-2">
            <Button type="submit" disabled={isSubmitting} fullWidth>
              {isSubmitting ? t('buttons.loggingIn') : t('buttons.login')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
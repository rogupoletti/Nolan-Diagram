import React, { useState, useEffect, useContext } from 'react';
import { onAuthChange } from '../../services/authService';
import { isAdmin } from '../../services/dbService';
import AdminLogin from './AdminLogin';
import AdminScreen from './AdminScreen';
import { useTranslation } from '../../hooks/useTranslation';
import { LanguageContext } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

type AuthState = 'loading' | 'loggedIn' | 'loggedOut' | 'notAdmin';

const AdminIndex: React.FC = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const userIsAdmin = await isAdmin(user.uid);
        if (userIsAdmin) {
          setAuthState('loggedIn');
        } else {
          setAuthState('notAdmin');
        }
      } else {
        setAuthState('loggedOut');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    // The onAuthChange listener will handle setting the correct state
    setAuthState('loading');
  };

  const handleLogout = () => {
    // The onAuthChange listener will set state to 'loggedOut'
  };

  switch (authState) {
    case 'loading':
      return (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    case 'loggedIn':
      return <AdminScreen onLogout={handleLogout} />;
    case 'notAdmin':
      return (
        <div className="text-center p-8 flex flex-col items-center justify-center flex-grow">
          <h2 className="text-2xl font-bold mb-4 text-red-600">{t('admin.accessDenied.title')}</h2>
          <p className="text-gray-700">{t('admin.accessDenied.description')}</p>
          <button onClick={() => navigate(`/${language}`)} className="mt-6 text-blue-600 hover:underline font-semibold">{t('buttons.goToHomepage')}</button>
        </div>
      );
    case 'loggedOut':
    default:
      return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }
};

export default AdminIndex;
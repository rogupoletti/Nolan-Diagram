import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { Language } from '../types';

const LANGUAGES: { id: Language; name: string; flag: string }[] = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'es', name: 'Español', flag: '🇪🇸' },
  { id: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);

    // Get current path parts
    const pathParts = location.pathname.split('/').filter(Boolean);
    const validLanguages = LANGUAGES.map(l => l.id);

    // Remove current language if present
    let cleanPathParts = pathParts;
    if (pathParts.length > 0 && validLanguages.includes(pathParts[0] as Language)) {
      cleanPathParts = pathParts.slice(1);
    }

    // Construct new path
    let newPath;
    if (cleanPathParts.length > 0) {
      newPath = `/${lang}/${cleanPathParts.join('/')}`;
    } else {
      newPath = `/${lang}`;
    }

    navigate(newPath);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{currentLang.flag}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <ul role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {LANGUAGES.map(lang => (
              <li key={lang.id}>
                <button
                  onClick={() => handleLanguageChange(lang.id)}
                  className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

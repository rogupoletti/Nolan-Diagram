import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { en } from '../locales/en';
import { es } from '../locales/es';
import { ptBR } from '../locales/pt-BR';

const translations = {
  en,
  es,
  'pt-BR': ptBR,
};

// Helper function to get a nested property from an object
const get = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Helper function to replace placeholders like {count}
const interpolate = (str: string, values: Record<string, any>): string => {
  return str.replace(/{(\w+)}/g, (placeholder, key) =>
    values[key] !== undefined ? String(values[key]) : placeholder
  );
}

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  const t = (key: string, fallbackOrValues?: string | Record<string, any>, values?: Record<string, any>) => {
    let fallback: string | undefined;
    let interpolationValues: Record<string, any> | undefined;

    if (typeof fallbackOrValues === 'string') {
        fallback = fallbackOrValues;
        interpolationValues = values;
    } else if (typeof fallbackOrValues === 'object') {
        interpolationValues = fallbackOrValues;
    }


    const translation = get(translations[language], key) || get(translations.en, key) || fallback || key;
    
    if (interpolationValues) {
        return interpolate(translation, interpolationValues);
    }

    return translation;
  };

  return { t, language };
};

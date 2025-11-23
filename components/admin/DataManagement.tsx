import React, { useState } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { CATEGORY_KEYS, VALID_LANGUAGES } from '../../constants';
import { getPoliticalCategoryDescription } from '../../services/geminiService';
import { saveBatchDescriptions } from '../../services/dbService';
import { en } from '../../locales/en';
import { es } from '../../locales/es';
import { ptBR } from '../../locales/pt-BR';
import { Language } from '../../types';

const translations = { en, es, 'pt-BR': ptBR };

const DataManagement: React.FC = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!window.confirm(t('admin.data.confirmGeneration'))) {
            return;
        }

        setStatus('generating');
        setError(null);
        const total = CATEGORY_KEYS.length * VALID_LANGUAGES.length;
        setProgress({ current: 0, total });
        
        const descriptionsToSave: { docId: string; data: any }[] = [];

        try {
            // Use Promise.all for parallel execution
            await Promise.all(CATEGORY_KEYS.flatMap(categoryKey =>
                VALID_LANGUAGES.map(async (lang: Language) => {
                    const categoryName = translations[lang].categories[categoryKey as keyof typeof translations[typeof lang]['categories']];
                    
                    const description = await getPoliticalCategoryDescription(categoryName, lang);
                    
                    const docId = `${categoryKey}_${lang}`;
                    descriptionsToSave.push({
                        docId,
                        data: { description, categoryKey, lang }
                    });

                    setProgress(prev => ({ ...prev, current: prev.current + 1 }));
                })
            ));

            await saveBatchDescriptions(descriptionsToSave);
            setStatus('success');

        } catch (e: any) {
            console.error("Failed to generate descriptions:", e);
            setError(e.message || 'An unknown error occurred.');
            setStatus('error');
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('admin.data.title')}</h3>
            <p className="text-gray-600 mb-4">{t('admin.data.description')}</p>
            <Button onClick={handleGenerate} disabled={status === 'generating'}>
                {status === 'generating' ? t('admin.data.generating') : t('admin.data.generateButton')}
            </Button>
            
            {status === 'generating' && (
                <div className="mt-4">
                    <p>{t('admin.data.progress', { current: progress.current, total: progress.total })}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-width duration-500" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}></div>
                    </div>
                </div>
            )}
            
            {status === 'success' && (
                <p className="mt-4 text-green-600 font-semibold">{t('admin.data.success')}</p>
            )}

            {status === 'error' && (
                <div className="mt-4 text-red-600">
                    <p className="font-bold">{t('admin.data.errorTitle')}</p>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default DataManagement;

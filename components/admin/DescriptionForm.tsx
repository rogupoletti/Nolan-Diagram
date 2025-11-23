import React, { useState, FormEvent } from 'react';
import { Language } from '../../types';
import Button from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

interface DescriptionFormProps {
  categoryKey: string;
  categoryName: string;
  initialData: { [lang in Language]?: string };
  onSubmit: (categoryKey: string, descriptions: { [lang in Language]?: string }) => Promise<void>;
  onCancel: () => void;
}

const LANGUAGES: { id: Language; name: string }[] = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Español' },
  { id: 'pt-BR', name: 'Português (BR)' },
];

const DescriptionForm: React.FC<DescriptionFormProps> = ({ categoryKey, categoryName, initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [descriptions, setDescriptions] = useState(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTextChange = (lang: Language, value: string) => {
        setDescriptions(prev => ({ ...prev, [lang]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(categoryKey, descriptions);
        // isSubmitting is not set to false because the component will be unmounted by parent
    };
    
    const inputClass = "w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-50";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{t('admin.descriptions.editTitle', { category: categoryName })}</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {LANGUAGES.map(lang => (
                        <div key={lang.id}>
                            <label htmlFor={`desc-${lang.id}`} className="block text-sm font-medium text-gray-700">
                                {t('admin.descriptions.descriptionLabelLang', { lang: lang.name })}
                            </label>
                            <textarea
                                id={`desc-${lang.id}`}
                                value={descriptions[lang.id] || ''}
                                onChange={e => handleTextChange(lang.id, e.target.value)}
                                className={`mt-1 block ${inputClass}`}
                                rows={4}
                                disabled={isSubmitting}
                            />
                        </div>
                    ))}
                </form>
                <div className="flex justify-end gap-4 p-6 border-t mt-auto flex-shrink-0">
                    <Button type="button" onClick={onCancel} variant="secondary" disabled={isSubmitting}>{t('buttons.cancel')}</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? t('buttons.saving') : t('buttons.saveDescription')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DescriptionForm;

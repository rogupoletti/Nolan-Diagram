import React, { useState, useEffect, useMemo } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { CATEGORY_KEYS } from '../../constants';
import { getAllCategoryDescriptions, saveCategoryDescriptions, CategoryDescriptionsMap } from '../../services/dbService';
import DescriptionForm from './DescriptionForm';
import { Language } from '../../types';

const DescriptionManager: React.FC = () => {
    const { t } = useTranslation();
    const [descriptions, setDescriptions] = useState<CategoryDescriptionsMap>({});
    const [isLoading, setIsLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

    const loadDescriptions = async () => {
        setIsLoading(true);
        const fetchedDescriptions = await getAllCategoryDescriptions();
        setDescriptions(fetchedDescriptions);
        setIsLoading(false);
    };

    useEffect(() => {
        loadDescriptions();
    }, []);

    const translatedCategories = useMemo(() => {
        return CATEGORY_KEYS.map(key => ({ key, label: t(`categories.${key}`) }));
    }, [t]);

    const handleEdit = (categoryKey: string) => {
        setEditingCategory(categoryKey);
    };

    const handleCloseForm = () => {
        setEditingCategory(null);
    };

    const handleFormSubmit = async (categoryKey: string, updatedDescriptions: { [lang in Language]?: string }) => {
        setStatusMessage(null);
        try {
            await saveCategoryDescriptions(categoryKey, updatedDescriptions);
            await loadDescriptions(); // Refresh data
            handleCloseForm();
            setStatusMessage({ type: 'success', message: t('admin.descriptions.saveSuccess') });
        } catch (error) {
            console.error("Failed to save descriptions", error);
            setStatusMessage({ type: 'error', message: t('admin.descriptions.saveError') });
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('admin.descriptions.manageTitle')}</h3>
            
            {statusMessage && (
                <div className={`p-4 mb-4 rounded-md text-sm ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {statusMessage.message}
                </div>
            )}

            <div className="space-y-3">
                {translatedCategories.length === 0 && (
                    <p className="text-center text-gray-500 py-8">{t('admin.descriptions.noDescriptions')}</p>
                )}
                {translatedCategories.map(({ key, label }) => (
                    <div key={key} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex justify-between items-center gap-4">
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-800">{label}</p>
                            <p className="text-sm text-gray-500 truncate">{descriptions[key]?.en || 'No English description set.'}</p>
                        </div>
                        <div className="flex-shrink-0">
                            <Button onClick={() => handleEdit(key)} variant="secondary">{t('buttons.edit')}</Button>
                        </div>
                    </div>
                ))}
            </div>
            
            {editingCategory && (
                <DescriptionForm
                    categoryKey={editingCategory}
                    categoryName={t(`categories.${editingCategory}`)}
                    initialData={descriptions[editingCategory] || {}}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseForm}
                />
            )}
        </div>
    );
};

export default DescriptionManager;

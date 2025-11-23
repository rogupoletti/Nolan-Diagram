import React, { useState } from 'react';
import { QuizQuestion } from '../../types';
import Button from '../ui/Button';
import QuestionForm from './QuestionForm';
import { useTranslation } from '../../hooks/useTranslation';

interface QuestionManagerProps {
  questions: QuizQuestion[];
  onAdd: (question: Omit<QuizQuestion, 'id'>) => Promise<void>;
  onUpdate: (question: QuizQuestion) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ questions, onAdd, onUpdate, onDelete, isLoading }) => {
  const { t } = useTranslation();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  const handleEdit = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingQuestion(null);
    setIsFormVisible(true);
  };

  const handleFormSubmit = async (questionData: Omit<QuizQuestion, 'id'> | QuizQuestion) => {
    if ('id' in questionData) {
      await onUpdate(questionData);
    } else {
      await onAdd(questionData);
    }
    setIsFormVisible(false);
    setEditingQuestion(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('admin.questions.deleteConfirm'))) {
        onDelete(id);
    }
  }

  if (isFormVisible) {
    return (
      <QuestionForm
        onSubmit={handleFormSubmit}
        onCancel={() => { setIsFormVisible(false); setEditingQuestion(null); }}
        initialData={editingQuestion}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-lg font-bold text-gray-800">{t('admin.questions.manageTitle', { count: questions.length })}</h3>
        <Button onClick={handleAddNew}>{t('buttons.addNewQuestion')}</Button>
      </div>
      <div className="space-y-3">
        {questions.length === 0 && (
            <p className="text-center text-gray-500 py-8">{t('admin.questions.noneFound')}</p>
        )}
        {questions.map(q => (
          <div key={q.id} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex justify-between items-center">
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">{q.text.en}</p>
              <p className="text-sm text-gray-500">
                {t('admin.questions.type')}: <span className="font-mono bg-gray-200 px-1 rounded">{q.type}</span> | {t('admin.questions.weight')}: <span className="font-mono bg-gray-200 px-1 rounded">{q.weight.toFixed(1)}</span>
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              <Button onClick={() => handleEdit(q)} variant="secondary">{t('buttons.edit')}</Button>
              <Button onClick={() => handleDelete(q.id)} variant="secondary" className="!bg-red-600 !text-white hover:!bg-red-700 focus:!ring-red-500">{t('buttons.delete')}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionManager;

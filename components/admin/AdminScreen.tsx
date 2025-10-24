import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../types';
import Button from '../ui/Button';
import SubmissionsViewer from './SubmissionsViewer';
import QuestionManager from './QuestionManager';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '../../services/dbService';
import { signOut } from '../../services/authService';
import { useTranslation } from '../../hooks/useTranslation';

interface AdminScreenProps {
  onLogout: () => void;
}

type AdminTab = 'submissions' | 'questions';

const AdminScreen: React.FC<AdminScreenProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    const fetchedQuestions = await getQuestions();
    setQuestions(fetchedQuestions);
    setIsLoading(false);
  };

  const handleAddQuestion = async (question: Omit<QuizQuestion, 'id'>) => {
    await addQuestion(question);
    await loadQuestions();
  };
  
  const handleUpdateQuestion = async (updatedQuestion: QuizQuestion) => {
    await updateQuestion(updatedQuestion);
    setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  };
  
  const handleDeleteQuestion = async (id: string) => {
    await deleteQuestion(id);
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error("Failed to log out", error);
      alert(t('admin.logoutFailed'));
    }
  };

  const getTabClass = (tabName: AdminTab) => {
    return `px-4 py-2 font-semibold transition-colors duration-200 border-b-2 ${
      activeTab === tabName
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;
  };

  return (
    <div className="w-full bg-white p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('admin.title')}
        </h2>
        <Button onClick={handleLogout} variant="secondary">{t('buttons.logout')}</Button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button onClick={() => setActiveTab('submissions')} className={getTabClass('submissions')}>
            {t('admin.tabs.submissions')}
          </button>
          <button onClick={() => setActiveTab('questions')} className={getTabClass('questions')}>
            {t('admin.tabs.questions')}
          </button>
        </nav>
      </div>

      <div className="py-6 flex-grow flex flex-col">
        {activeTab === 'submissions' && <SubmissionsViewer />}
        {activeTab === 'questions' && (
          <QuestionManager
            questions={questions}
            onAdd={handleAddQuestion}
            onUpdate={handleUpdateQuestion}
            onDelete={handleDeleteQuestion}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default AdminScreen;
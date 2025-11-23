import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../types';
import SubmissionsViewer from './SubmissionsViewer';
import QuestionManager from './QuestionManager';
import DataManagement from './DataManagement';
import DescriptionManager from './DescriptionManager';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '../../services/dbService';
import { signOut } from '../../services/authService';
import { useTranslation } from '../../hooks/useTranslation';

interface AdminScreenProps {
  onLogout: () => void;
}

type AdminTab = 'submissions' | 'questions' | 'data' | 'descriptions';

const AdminScreen: React.FC<AdminScreenProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const getMenuClass = (tabName: AdminTab) => {
    const baseClasses = 'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-3';
    if (activeTab === tabName) {
      return `${baseClasses} bg-blue-100 text-blue-700`;
    }
    return `${baseClasses} text-gray-600 hover:bg-gray-100 hover:text-gray-900`;
  };
  
  const baseMenuClass = 'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  return (
    <div className="w-full bg-white p-0 flex flex-col flex-grow h-full">
      <div className="flex items-center p-6 border-b border-gray-200 flex-shrink-0">
        <button 
          onClick={() => setIsMenuOpen(true)} 
          className="md:hidden mr-4 p-1 text-gray-600 hover:text-gray-900"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {t('admin.title')}
        </h2>
      </div>

      <div className="flex flex-row flex-grow min-h-0">
         {/* Overlay for mobile */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          ></div>
        )}

         <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-30 flex flex-col p-4 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0`}>
           <nav className="flex-grow flex flex-col space-y-1">
             <button onClick={() => handleTabChange('submissions')} className={getMenuClass('submissions')}>
               {t('admin.tabs.submissions')}
             </button>
             <button onClick={() => handleTabChange('questions')} className={getMenuClass('questions')}>
               {t('admin.tabs.questions')}
             </button>             
             <button onClick={() => handleTabChange('descriptions')} className={getMenuClass('descriptions')}>
               {t('admin.tabs.descriptions')}
             </button>
             <button onClick={() => handleTabChange('data')} className={getMenuClass('data')}>
               {t('admin.tabs.data')}
             </button>
           </nav>
           <div className="mt-auto pt-4 border-t border-gray-200">
             <button onClick={handleLogout} className={baseMenuClass}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
               {t('buttons.logout')}
            </button>
           </div>
         </aside>

         <main className="flex-grow p-6 overflow-y-auto">
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
           {activeTab === 'data' && <DataManagement />}
           {activeTab === 'descriptions' && <DescriptionManager />}
         </main>
      </div>
    </div>
  );
};

export default AdminScreen;
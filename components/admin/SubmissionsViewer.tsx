import React, { useState, useEffect, useMemo } from 'react';
import { Submission } from '../../types';
import { getSubmissions } from '../../services/dbService';
import { exportSubmissionsToCSV } from '../../services/csvService';
import Button from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

const CATEGORY_KEYS = ["libertarian", "left_liberal", "right_conservative", "authoritarian", "centrist", "economic_right", "economic_left", "social_libertarian", "social_authoritarian"];

const SubmissionsViewer: React.FC = () => {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      const fetchedSubmissions = await getSubmissions();
      setSubmissions(fetchedSubmissions);
      setIsLoading(false);
    };
    
    fetchSubmissions();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      const submissionDate = new Date(s.timestamp);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      const categoryMatch = categoryFilter === 'All' ? true : s.results.categoryKey === categoryFilter;
      const startDateMatch = start ? submissionDate >= start : true;
      const endDateMatch = end ? submissionDate <= end : true;
      
      return categoryMatch && startDateMatch && endDateMatch;
    });
  }, [submissions, categoryFilter, startDate, endDate]);
  
  const translatedCategories = useMemo(() => {
    return CATEGORY_KEYS.map(key => ({ key, label: t(`categories.${key}`)}));
  }, [t]);

  const renderContent = () => {
    if (isLoading) {
      return (
         <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
      );
    }

    if (submissions.length === 0) {
      return <p className="text-center text-gray-500 py-8">{t('admin.submissions.noneFound')}</p>;
    }

    if (filteredSubmissions.length === 0) {
        return <p className="text-center text-gray-500 py-8">{t('admin.submissions.noFilterMatch')}</p>;
    }

    return (
      <div className="space-y-3">
        {filteredSubmissions.map((submission) => (
          <div key={submission.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="font-bold text-blue-700 text-lg truncate">{t(`categories.${submission.results.categoryKey}`)}</p>
                <p className="text-sm text-gray-700 truncate">{submission.userData.email}</p>
                <p className="text-sm text-gray-500">{new Date(submission.timestamp).toLocaleString()}</p>
              </div>
              <div className="text-right text-sm text-gray-600 mt-2 flex-shrink-0 ml-4">
                 <p>{t('admin.submissions.econ')}: {submission.results.economic.toFixed(1)}</p>
                 <p>{t('admin.submissions.pers')}: {submission.results.personal.toFixed(1)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const inputClass = "w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-50";

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-3 items-center mb-6 p-3 bg-gray-100 rounded-lg border flex-shrink-0">
        <label className="text-sm font-medium text-gray-600">Filter by:</label>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={inputClass}>
          <option value="All">{t('admin.submissions.allCategories')}</option>
          {translatedCategories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
      </div>
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-lg font-bold text-gray-800">{t('admin.submissions.showingCount', { count: filteredSubmissions.length, total: submissions.length })}</h3>
        <Button onClick={() => exportSubmissionsToCSV(filteredSubmissions)} disabled={filteredSubmissions.length === 0}>
          {t('buttons.downloadCsv')}
        </Button>
      </div>
      {renderContent()}
    </div>
  );
};

export default SubmissionsViewer;

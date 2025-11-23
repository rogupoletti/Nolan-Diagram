import { Submission } from '../types';

export const exportSubmissionsToCSV = (submissions: Submission[]) => {
  if (submissions.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = [
    'Submission ID',
    'Timestamp',
    'Email',
    'Phone',
    'Category',
    'Economic Score',
    'Personal Score',
  ];

  const rows = submissions.map(s => [
    s.id,
    new Date(s.timestamp).toLocaleString(),
    s.userData.email,
    s.userData.phone,
    s.results.categoryKey,
    s.results.economic.toFixed(2),
    s.results.personal.toFixed(2),
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const fileName = `submissions_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};

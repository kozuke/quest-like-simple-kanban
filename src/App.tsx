import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import ReportModal from './components/ReportModal';
import TemplateEditorModal from './components/TemplateEditorModal';
import { useTaskStore } from './store/useTaskStore';
import { useReportStore } from './store/useReportStore';

function App() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const { loadFromLocalStorage } = useTaskStore();
  const { loadTemplate } = useReportStore();

  useEffect(() => {
    // Load saved data on mount
    loadFromLocalStorage();
    loadTemplate();
    
    // Add pixel font
    const pixelFont = document.createElement('link');
    pixelFont.rel = 'stylesheet';
    pixelFont.href = 'https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap';
    document.head.appendChild(pixelFont);

    // Update document title
    document.title = 'ドラゴンタスク | ローカルファースト看板ボード';
    
    // Find favicon element and update it
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute('href', 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230d41ff"><rect width="24" height="24" fill="%230d41ff"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="white">🗺️</text></svg>');
    }
  }, [loadFromLocalStorage, loadTemplate]);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header 
        openReportModal={() => setReportModalOpen(true)}
        openTemplateModal={() => setTemplateModalOpen(true)}
      />
      
      <main className="flex-1 overflow-hidden">
        <Board />
      </main>
      
      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)}
        openTemplateModal={() => {
          setReportModalOpen(false);
          setTemplateModalOpen(true);
        }}
      />
      
      <TemplateEditorModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />
    </div>
  );
}

export default App;
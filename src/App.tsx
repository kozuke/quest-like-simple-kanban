import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import ReportModal from './components/ReportModal';
import TemplateEditorModal from './components/TemplateEditorModal';
import TermsOfService from './components/TermsOfService';
import { useTaskStore } from './store/useTaskStore';
import { useReportStore } from './store/useReportStore';

function App() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
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
    document.title = 'Dragon Task | Local First Kanban Board';
  }, [loadFromLocalStorage, loadTemplate]);

  const handleGithubClick = () => {
    window.open('https://github.com/kozuke/quest-like-simple-kanban', '_blank', 'noopener,noreferrer');
  };

  if (showTermsOfService) {
    return <TermsOfService onBack={() => setShowTermsOfService(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header 
        openReportModal={() => setReportModalOpen(true)}
        openTemplateModal={() => setTemplateModalOpen(true)}
      />
      
      <main className="flex-1 overflow-hidden">
        <Board />
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-2 px-4">
        <div className="container mx-auto flex justify-center items-center space-x-6 text-xs text-slate-400">
          <button
            onClick={handleGithubClick}
            className="hover:text-slate-600 transition-colors duration-200"
          >
            GitHub
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setShowTermsOfService(true)}
            className="hover:text-slate-600 transition-colors duration-200"
          >
            利用規約
          </button>
        </div>
      </footer>
      
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
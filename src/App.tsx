import React, { useEffect, useState } from 'react';
import TaskBoard from './components/TaskBoard';
import JourneyPage from './components/JourneyPage';
import TermsOfService from './components/TermsOfService';
import { useTaskStore } from './store/useTaskStore';
import { useReportStore } from './store/useReportStore';
import { useAudioStore } from './store/useAudioStore';
import { useJourneyStore } from './store/useJourneyStore';
import { debugLocalStorage } from './utils/debug';
import { migrateLegacyData } from './utils/migration';

type Page = 'board' | 'journey' | 'terms';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('board');
  const { loadTemplate } = useReportStore();
  const { loadFromLocalStorage: loadAudioSettings } = useAudioStore();
  const { loadFromLocalStorage: loadJourneyData } = useJourneyStore();

  useEffect(() => {
    // Debug localStorage content
    debugLocalStorage();

    // Migrate legacy data if it exists
    const migratedData = migrateLegacyData();
    if (migratedData) {
      useTaskStore.setState(migratedData);
    }

    loadTemplate();
    loadAudioSettings();
    loadJourneyData();
    
    const pixelFont = document.createElement('link');
    pixelFont.rel = 'stylesheet';
    pixelFont.href = 'https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap';
    document.head.appendChild(pixelFont);

    document.title = 'Dragon Task | Local First Kanban Board';

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (currentPage === 'board') {
          const activeElement = document.activeElement;
          const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.hasAttribute('contenteditable')
          );
          
          if (!isInputFocused) {
            // タスク追加モーダルを開く処理は TaskBoard コンポーネント内で処理
            const event = new CustomEvent('openTaskModal');
            document.dispatchEvent(event);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loadTemplate, loadAudioSettings, loadJourneyData, currentPage]);

  const navigateToBoard = () => setCurrentPage('board');
  const navigateToJourney = () => setCurrentPage('journey');
  const navigateToTerms = () => setCurrentPage('terms');

  if (currentPage === 'terms') {
    return <TermsOfService onBack={navigateToBoard} />;
  }

  if (currentPage === 'journey') {
    return <JourneyPage onNavigateToBoard={navigateToBoard} />;
  }

  return <TaskBoard onNavigateToJourney={navigateToJourney} />;
}

export default App;
import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import ReportModal from './components/ReportModal';
import TemplateEditorModal from './components/TemplateEditorModal';
import TaskEditorModal from './components/TaskEditorModal';
import TermsOfService from './components/TermsOfService';
import SlimeDashboard from './components/SlimeDashboard';
import { useTaskStore } from './store/useTaskStore';
import { useReportStore } from './store/useReportStore';
import { useAudioStore } from './store/useAudioStore';
import { useJourneyStore } from './store/useJourneyStore';
import { TaskStatus, Task } from './types/task';
import { debugLocalStorage } from './utils/debug';

function App() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [taskEditorModalOpen, setTaskEditorModalOpen] = useState(false);
  const [taskEditorStatus, setTaskEditorStatus] = useState<TaskStatus>('backlog');
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [taskEditorMode, setTaskEditorMode] = useState<'add' | 'edit'>('add');
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const { addTask, updateTask, removeTask } = useTaskStore();
  const { loadTemplate } = useReportStore();
  const { loadFromLocalStorage: loadAudioSettings } = useAudioStore();
  const { loadFromLocalStorage: loadJourneyData } = useJourneyStore();

  useEffect(() => {
    // Debug localStorage content
    debugLocalStorage();

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
        if (!reportModalOpen && !templateModalOpen && !showTermsOfService) {
          const activeElement = document.activeElement;
          const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.hasAttribute('contenteditable')
          );
          
          if (!isInputFocused) {
            setTaskEditorStatus('backlog');
            setTaskEditorMode('add');
            setEditingTask(undefined);
            setTaskEditorModalOpen(true);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loadTemplate, loadAudioSettings, loadJourneyData, reportModalOpen, templateModalOpen, showTermsOfService]);

  const handleGithubClick = () => {
    window.open('https://github.com/kozuke/quest-like-simple-kanban', '_blank', 'noopener,noreferrer');
  };

  const openAddTaskModal = (status: TaskStatus = 'backlog') => {
    setTaskEditorStatus(status);
    setTaskEditorMode('add');
    setEditingTask(undefined);
    setTaskEditorModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setTaskEditorStatus(task.status);
    setTaskEditorMode('edit');
    setEditingTask(task);
    setTaskEditorModalOpen(true);
  };

  const handleTaskSave = (title: string, description: string) => {
    if (taskEditorMode === 'add') {
      addTask(title, description, taskEditorStatus);
    } else if (taskEditorMode === 'edit' && editingTask) {
      updateTask(editingTask.id, { title, description });
    }
  };

  const handleTaskDelete = (taskId: string) => {
    removeTask(taskId);
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
      
      <main className="flex-1 overflow-hidden p-4">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          <div className="lg:col-span-3 overflow-hidden">
            <Board 
              openAddTaskModal={openAddTaskModal}
              onEditTask={openEditTaskModal}
              onDeleteTask={handleTaskDelete}
            />
          </div>
          <div className="overflow-y-auto">
            <SlimeDashboard />
          </div>
        </div>
      </main>
      
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
          <span className="text-slate-300">|</span>
          <span 
            className="text-slate-400 font-mono text-xs"
            title="Command+K (Mac) または Ctrl+K でタスク作成"
          >
            ⌘K / Ctrl+K
          </span>
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

      <TaskEditorModal
        isOpen={taskEditorModalOpen}
        onClose={() => setTaskEditorModalOpen(false)}
        onSave={handleTaskSave}
        status={taskEditorStatus}
        task={editingTask}
        mode={taskEditorMode}
      />
    </div>
  );
}

export default App;
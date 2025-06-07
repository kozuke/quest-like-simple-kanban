import React, { useState } from 'react';
import Header from './Header';
import Board from './Board';
import ReportModal from './ReportModal';
import TemplateEditorModal from './TemplateEditorModal';
import TaskEditorModal from './TaskEditorModal';
import MiniSlime from './MiniSlime';
import { useTaskStore } from '../store/useTaskStore';
import { TaskStatus, Task } from '../types/task';

interface TaskBoardProps {
  onNavigateToJourney: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ onNavigateToJourney }) => {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [taskEditorModalOpen, setTaskEditorModalOpen] = useState(false);
  const [taskEditorStatus, setTaskEditorStatus] = useState<TaskStatus>('backlog');
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [taskEditorMode, setTaskEditorMode] = useState<'add' | 'edit'>('add');
  
  const { addTask, updateTask, removeTask } = useTaskStore();

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

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header 
        openReportModal={() => setReportModalOpen(true)}
        openTemplateModal={() => setTemplateModalOpen(true)}
      />
      
      <main className="flex-1 overflow-hidden p-4">
        <div className="container mx-auto h-full">
          <Board 
            openAddTaskModal={openAddTaskModal}
            onEditTask={openEditTaskModal}
            onDeleteTask={handleTaskDelete}
          />
        </div>
      </main>
      
      <footer className="bg-slate-100 border-t border-slate-200 py-2 px-4">
        <div className="container mx-auto flex justify-center items-center space-x-6 text-xs text-slate-400">
          <button
            onClick={() => window.open('https://github.com/kozuke/quest-like-simple-kanban', '_blank', 'noopener,noreferrer')}
            className="hover:text-slate-600 transition-colors duration-200"
          >
            GitHub
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={onNavigateToJourney}
            className="hover:text-slate-600 transition-colors duration-200"
          >
            旅の記録
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

      {/* ミニスライム表示 */}
      <MiniSlime onClick={onNavigateToJourney} />
      
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
};

export default TaskBoard;
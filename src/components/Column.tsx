import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { PlusCircle } from 'lucide-react';
import TaskCard from './TaskCard';
import { Task, TaskStatus } from '../types/task';

interface ColumnProps {
  title: string;
  emoji: string;
  status: TaskStatus;
  tasks: Task[];
  openAddTaskModal: (status?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onCopyTask: (taskId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ title, emoji, status, tasks, openAddTaskModal, onEditTask, onDeleteTask, onCopyTask }) => {
  const { setNodeRef } = useDroppable({ id: status });

  const handleAddTask = () => {
    openAddTaskModal(status);
  };

  // Column emoji backgrounds
  const columnBg = {
    backlog: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/60',
    doing: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/60',
    done: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200/60',
  };

  // Column emoji styles
  const emojiStyles = {
    backlog: 'bg-blue-100 text-blue-800 shadow-sm',
    doing: 'bg-amber-100 text-amber-800 shadow-sm',
    done: 'bg-green-100 text-green-800 shadow-sm',
  };

  return (
    <div className={`flex-1 min-w-[280px] max-w-[360px] flex flex-col rounded-xl border shadow-lg ${columnBg[status]} overflow-hidden backdrop-blur-sm`}>
      <div className="p-4 border-b border-inherit bg-white/90 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${emojiStyles[status]} font-pixel text-lg`}>
            {emoji}
          </span>
          <h2 className="font-pixel text-lg font-medium text-gray-800">{title}</h2>
        </div>
        <button
          onClick={handleAddTask}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto min-h-[200px] bg-gradient-to-b from-white/40 to-white/60 backdrop-blur-sm"
      >
        <SortableContext 
          items={tasks.map(task => task.id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onCopy={onCopyTask}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-300/60 rounded-xl bg-white/60 text-gray-500 text-sm font-medium backdrop-blur-sm">
              タスクがありません
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
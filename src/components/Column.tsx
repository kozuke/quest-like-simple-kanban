import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { PlusCircle } from 'lucide-react';
import TaskCard from './TaskCard';
import { Task, TaskStatus } from '../types/task';
import { useTaskStore } from '../store/useTaskStore';

interface ColumnProps {
  title: string;
  emoji: string;
  status: TaskStatus;
  tasks: Task[];
}

const Column: React.FC<ColumnProps> = ({ title, emoji, status, tasks }) => {
  const { addTask } = useTaskStore();
  const { setNodeRef } = useDroppable({ id: status });

  const handleAddTask = () => {
    const taskTitle = prompt('タスク名を入力してください:');
    if (taskTitle?.trim()) {
      const description = prompt('説明 (任意):') || '';
      addTask(taskTitle, description, status);
    }
  };

  // Column emoji backgrounds
  const columnBg = {
    backlog: 'bg-blue-50 border-blue-200',
    doing: 'bg-amber-50 border-amber-200',
    done: 'bg-green-50 border-green-200',
  };

  // Column emoji styles
  const emojiStyles = {
    backlog: 'bg-blue-100 text-blue-800',
    doing: 'bg-amber-100 text-amber-800',
    done: 'bg-green-100 text-green-800',
  };

  return (
    <div className={`flex-1 min-w-[250px] max-w-[350px] flex flex-col rounded-lg border ${columnBg[status]} overflow-hidden`}>
      <div className="p-3 border-b border-inherit bg-white/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${emojiStyles[status]} font-pixel`}>
            {emoji}
          </span>
          <h2 className="font-pixel text-lg">{title}</h2>
        </div>
        <button
          onClick={handleAddTask}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-2 overflow-y-auto min-h-[200px] bg-gradient-to-b from-transparent to-white/30"
      >
        <SortableContext 
          items={tasks.map(task => task.id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          
          {tasks.length === 0 && (
            <div className="h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-md bg-white/50 text-gray-400 text-sm">
              タスクがありません
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
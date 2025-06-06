import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Copy } from 'lucide-react';
import { Task } from '../types/task';
import { useTaskStore } from '../store/useTaskStore';
import { useJourneyStore } from '../store/useJourneyStore';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onCopy: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onCopy }) => {
  const [isDisappearing, setIsDisappearing] = useState(false);
  const { claimExp } = useTaskStore();
  const { addClearedTask } = useJourneyStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(task.id);
  };

  const handleClaimExp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDisappearing(true);
    
    // Add task to journey record
    addClearedTask(task);
    
    // Wait for the animation to complete
    await new Promise(resolve => setTimeout(resolve, 800));
    
    claimExp(task.id);
    onDelete(task.id);
  };

  if (isDisappearing) {
    return (
      <div 
        className="relative bg-white/95 backdrop-blur-sm border border-gray-200/60 p-4 rounded-xl shadow-md mb-3 animate-disappear"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-sparkle">✨</div>
        </div>
        <div className="opacity-0">
          <h3 className="font-pixel text-gray-900 mb-2">{task.title}</h3>
          {task.description && (
            <p className="font-pixel text-gray-700 text-sm mt-2">{task.description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes} 
      {...listeners}
      className="bg-white/95 backdrop-blur-sm border border-gray-200/60 p-4 rounded-xl shadow-md mb-3 cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-xl hover:translate-y-[-3px] hover:scale-[1.02] group"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-pixel text-gray-900 mb-2 leading-relaxed flex-1 pr-2 break-words overflow-wrap-anywhere">
          {task.title}
        </h3>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
          {task.status === 'done' && !task.expClaimed && (
            <button 
              onClick={handleClaimExp}
              className="p-1.5 hover:bg-yellow-50 rounded-lg transition-all duration-200"
              title="経験値を獲得"
            >
              <img 
                src="/exp_icon.png" 
                alt="経験値を獲得" 
                className="w-4 h-4"
              />
            </button>
          )}
          <button 
            onClick={handleEdit}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
      {task.description && (
        <p className="font-pixel text-gray-700 text-sm mt-2 leading-relaxed opacity-80 whitespace-pre-wrap break-words">
          {task.description}
        </p>
      )}
    </div>
  );
};

export default TaskCard;
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Save, X } from 'lucide-react';
import { Task } from '../types/task';
import { useTaskStore } from '../store/useTaskStore';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  
  const { updateTask, removeTask } = useTaskStore();
  
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

  const handleSave = () => {
    if (title.trim()) {
      updateTask(task.id, { title, description });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    removeTask(task.id);
  };

  if (isEditing) {
    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className="bg-white/95 backdrop-blur-sm border border-gray-200/60 p-4 rounded-xl shadow-lg mb-3 transition-all hover:shadow-xl"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 p-3 border border-gray-300/60 rounded-lg font-pixel text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
          placeholder="タスク名"
          autoFocus
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-3 p-3 border border-gray-300/60 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
          placeholder="説明 (任意)"
          rows={2}
        />
        <div className="flex justify-end space-x-2">
          <button 
            onClick={handleCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X size={16} />
          </button>
          <button 
            onClick={handleSave}
            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Save size={16} />
          </button>
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
        <h3 className="font-pixel text-gray-900 mb-2 leading-relaxed">{task.title}</h3>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {task.description && (
        <p className="text-gray-700 text-sm mt-2 leading-relaxed opacity-80">{task.description}</p>
      )}
    </div>
  );
};

export default TaskCard;
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
  } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
        className="bg-white border border-gray-200 p-3 rounded-md shadow-sm mb-2 transition-all hover:shadow-md"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-2 border border-gray-300 rounded font-pixel text-sm"
          placeholder="タスク名"
          autoFocus
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-2 p-2 border border-gray-300 rounded text-sm resize-none"
          placeholder="説明 (任意)"
          rows={2}
        />
        <div className="flex justify-end space-x-2">
          <button 
            onClick={handleCancel}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
          <button 
            onClick={handleSave}
            className="p-1 text-blue-500 hover:text-blue-700"
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
      className="bg-white border border-gray-200 p-3 rounded-md shadow-sm mb-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:translate-y-[-2px]"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-pixel text-gray-900 mb-1">{task.title}</h3>
        <div className="flex space-x-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <Pencil size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="p-1 text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {task.description && (
        <p className="text-gray-700 text-sm mt-1">{task.description}</p>
      )}
    </div>
  );
};

export default TaskCard;
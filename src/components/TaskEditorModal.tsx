import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import { TaskStatus, Task } from '../types/task';

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  status: TaskStatus;
  task?: Task; // 編集時に渡される既存のタスク
  mode?: 'add' | 'edit'; // モード判定
}

const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  status, 
  task,
  mode = 'add'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // モーダルが開いた時、編集モードの場合は既存データをセット
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && task) {
        setTitle(task.title);
        setDescription(task.description || '');
      } else {
        setTitle('');
        setDescription('');
      }
    }
  }, [isOpen, mode, task]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), description.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  const statusLabels = {
    backlog: 'クエスト',
    doing: '冒険中',
    done: 'クリア'
  };

  const modalTitle = mode === 'edit' 
    ? 'タスクを編集' 
    : `新しいタスクを${statusLabels[status]}に追加`;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-pixel font-medium text-gray-900">
              {modalTitle}
            </h3>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4 flex-grow overflow-y-auto">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
              タスク名 <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-pixel text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="何をするタスクですか？"
              autoFocus
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              {title.length}/100文字
            </div>
          </div>
          
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
              説明（任意）
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="タスクの詳細を説明してください...&#10;複数行で入力できます"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500文字 (Ctrl+Enterで保存)
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <Save size={16} />
            {mode === 'edit' ? '更新' : '保存'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskEditorModal; 
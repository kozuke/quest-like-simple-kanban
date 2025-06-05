import React from 'react';
import { X, Calendar } from 'lucide-react';
import { Task } from '../types/task';

interface PastTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

const PastTasksModal: React.FC<PastTasksModalProps> = ({ isOpen, onClose, tasks }) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'backlog': return 'クエスト';
      case 'doing': return '冒険中';
      case 'done': return 'クリア';
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'backlog': return 'bg-blue-100 text-blue-800';
      case 'doing': return 'bg-amber-100 text-amber-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-auto max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-royal-blue" />
            <h2 className="text-xl font-pixel text-gray-900">過去のタスク一覧</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              過去のタスクはありません
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-pixel text-gray-900 mb-2">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{task.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      <time className="text-xs text-gray-500">
                        {formatDate(task.createdAt)}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastTasksModal;
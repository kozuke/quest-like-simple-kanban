import React from 'react';
import { X, Calendar, RotateCcw } from 'lucide-react';
import { useJourneyStore } from '../store/useJourneyStore';
import { useTaskStore } from '../store/useTaskStore';
import { useAudioStore } from '../store/useAudioStore';
import { playAddTaskSound } from '../utils/audio';

interface PastTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PastTasksModal: React.FC<PastTasksModalProps> = ({ isOpen, onClose }) => {
  const { clearedTasks, removeClearedTask } = useJourneyStore();
  const { addTask } = useTaskStore();
  const { getVolumeValue } = useAudioStore();

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleRestoreTask = (date: string, taskIndex: number, task: any) => {
    // タスクをクリアボードに復元
    addTask(task.title, task.description || '', 'backlog');
    
    // 過去タスクから削除
    removeClearedTask(date, taskIndex);
    
    // 効果音再生
    playAddTaskSound();
  };

  // Sort dates in descending order
  const sortedDates = Object.entries(clearedTasks)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA));

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
            <h2 className="text-xl font-pixel text-gray-900">タスク達成履歴</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {sortedDates.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              達成したタスクはまだありません
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDates.map(([date, record]) => (
                <div key={date} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-baseline gap-3 mb-4">
                    <h3 className="text-lg font-pixel text-gray-900">
                      {formatDate(date)}
                    </h3>
                    <span className="text-sm font-medium text-blue-600">
                      {record.count}タスク達成
                    </span>
                  </div>
                  
                  <div className="space-y-4 pl-4">
                    {record.tasks.map((task, index) => (
                      <div 
                        key={`${date}-${index}`}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-pixel text-gray-900 mb-2">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-gray-600 text-sm whitespace-pre-wrap pl-4 border-l-2 border-gray-200">
                                {task.description}
                              </p>
                            )}
                          </div>
                          
                          {/* 復元ボタン */}
                          <button
                            onClick={() => handleRestoreTask(date, index, task)}
                            className="ml-4 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-1"
                            title="クリアボードに戻す"
                          >
                            <RotateCcw size={16} />
                            <span className="text-xs font-medium">復元</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            💡 各タスクにマウスを合わせると復元ボタンが表示されます
          </p>
        </div>
      </div>
    </div>
  );
};

export default PastTasksModal;
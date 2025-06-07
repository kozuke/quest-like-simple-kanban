import React, { useState, useEffect } from 'react';
import { useJourneyStore } from '../store/useJourneyStore';
import { useTaskStore } from '../store/useTaskStore';

interface MiniSlimeProps {
  onClick: () => void;
}

const MiniSlime: React.FC<MiniSlimeProps> = ({ onClick }) => {
  const { clearedTasks } = useJourneyStore();
  const { columnOrder, tasks } = useTaskStore();
  const [currentSlime, setCurrentSlime] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const total = Object.values(clearedTasks).reduce((sum, record) => sum + record.count, 0);
    
    // 新しい進化レベル設定: 5個, 10個, 20個, 30個で進化
    const newSlimeLevel = total >= 30 ? 5 
                       : total >= 20 ? 4 
                       : total >= 10 ? 3 
                       : total >= 5 ? 2 
                       : 1;
    setCurrentSlime(newSlimeLevel);
  }, [clearedTasks]);

  // クリアボードのタスク数を計算
  const completedTasksCount = columnOrder.done
    .map(id => tasks[id])
    .filter(task => task && !task.expClaimed).length;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative bg-white rounded-full p-3 shadow-lg border-2 border-blue-200
          transition-all duration-300 hover:shadow-xl hover:scale-110
          ${isHovered ? 'animate-bounce' : ''}
        `}
        title={`旅の記録を見る (完了タスク: ${completedTasksCount}個)`}
      >
        <img 
          src={`/slime_${currentSlime}.jpg`} 
          alt={`Level ${currentSlime} Slime`}
          className="w-16 h-16 object-contain rounded-full"
        />
        
        {/* ホバー時のツールチップ */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            旅の記録を見る
            <br />
            完了タスク: {completedTasksCount}個
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
        
        {/* クリアタスク数表示 */}
        <div className={`
          absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center
          ${completedTasksCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}
        `}>
          {completedTasksCount}
        </div>
      </button>
    </div>
  );
};

export default MiniSlime;
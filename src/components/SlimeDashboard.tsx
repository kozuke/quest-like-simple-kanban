import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useJourneyStore } from '../store/useJourneyStore';
import { useTaskStore } from '../store/useTaskStore';
import { RefreshCw, Star, History } from 'lucide-react';
import PastTasksModal from './PastTasksModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SlimeDashboard: React.FC = () => {
  const { clearedTasks, resetJourney } = useJourneyStore();
  const { claimAllExp } = useTaskStore();
  const [currentSlime, setCurrentSlime] = useState(1);
  const [nextGoal, setNextGoal] = useState(5);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [previousSlime, setPreviousSlime] = useState(1);
  const [showPastTasks, setShowPastTasks] = useState(false);

  useEffect(() => {
    const total = Object.values(clearedTasks).reduce((sum, record) => sum + record.count, 0);
    
    // 新しい進化レベル設定: 5個, 10個, 20個, 30個で進化
    const newSlimeLevel = total >= 30 ? 5 
                       : total >= 20 ? 4 
                       : total >= 10 ? 3 
                       : total >= 5 ? 2 
                       : 1;

    if (newSlimeLevel !== currentSlime) {
      setPreviousSlime(currentSlime);
      setCurrentSlime(newSlimeLevel);
      setIsEvolving(true);
      setTimeout(() => setIsEvolving(false), 2000);
    }

    // 次の目標設定
    const goals = [5, 10, 20, 30];
    const next = goals.find(n => n > total) ?? Infinity;
    setNextGoal(next);
  }, [clearedTasks, currentSlime]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const chartData = {
    labels: last7Days.map(date => date.split('-').slice(1).join('/')),
    datasets: [{
      label: 'クリアしたタスク',
      data: last7Days.map(date => clearedTasks[date]?.count || 0),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '過去7日間のクリア数',
        font: {
          family: "'Press Start 2P', 'DotGothic16', sans-serif",
          size: 14
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const totalCleared = Object.values(clearedTasks).reduce((sum, record) => sum + record.count, 0);

  const handleResetClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmReset = () => {
    resetJourney();
    setShowConfirm(false);
  };

  const handleClaimAllExp = () => {
    const claimedCount = claimAllExp();
    if (claimedCount > 0) {
      // Optional: Show a success message
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-pixel text-gray-800">旅の記録</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPastTasks(true)}
              className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="過去のタスクを表示"
            >
              <History size={20} />
            </button>
            <button
              onClick={handleClaimAllExp}
              className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
              title="全ての経験値を獲得"
            >
              <Star size={20} />
            </button>
            <button
              onClick={handleResetClick}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="記録をリセット"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
        <div className="relative flex justify-center mb-4">
          {isEvolving && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute">
                  <div className="animate-sparkle absolute -top-8 -left-8">✨</div>
                  <div className="animate-sparkle absolute -top-8 left-8">✨</div>
                  <div className="animate-sparkle absolute top-8 -left-8">✨</div>
                  <div className="animate-sparkle absolute top-8 left-8">✨</div>
                </div>
              </div>
              <img 
                src={`/slime_${previousSlime}.jpg`}
                alt={`Level ${previousSlime} Slime`}
                className="w-32 h-32 object-contain rounded-lg shadow-md opacity-50 absolute"
              />
            </>
          )}
          <img 
            src={`/slime_${currentSlime}.jpg`} 
            alt={`Level ${currentSlime} Slime`}
            className={`w-32 h-32 object-contain rounded-lg shadow-md ${isEvolving ? 'animate-bounce' : ''}`}
          />
        </div>
        <p className="font-pixel text-lg text-gray-700 mb-2">
          これまでに{totalCleared}個のタスクをクリア！
        </p>
        {nextGoal !== Infinity && (
          <p className="font-pixel text-sm text-blue-600">
            あと{nextGoal - totalCleared}個で進化！
          </p>
        )}
      </div>

      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-pixel text-gray-800 mb-4">
              記録をリセットしますか？
            </h3>
            <p className="text-gray-600 mb-6">
              これまでのタスククリア記録が全て消去されます。この操作は取り消せません。
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      )}

      <PastTasksModal
        isOpen={showPastTasks}
        onClose={() => setShowPastTasks(false)}
      />
    </div>
  );
};

export default SlimeDashboard;
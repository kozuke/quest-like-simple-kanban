import React, { useState } from 'react';
import { ArrowLeft, Star, RefreshCw, History } from 'lucide-react';
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
import PastTasksModal from './PastTasksModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface JourneyPageProps {
  onNavigateToBoard: () => void;
}

const JourneyPage: React.FC<JourneyPageProps> = ({ onNavigateToBoard }) => {
  const { clearedTasks, resetJourney } = useJourneyStore();
  const { claimAllExp, columnOrder, tasks } = useTaskStore();
  const [currentSlime, setCurrentSlime] = useState(1);
  const [nextGoal, setNextGoal] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [previousSlime, setPreviousSlime] = useState(1);
  const [showPastTasks, setShowPastTasks] = useState(false);

  React.useEffect(() => {
    const total = Object.values(clearedTasks).reduce((sum, record) => sum + record.count, 0);
    const newSlimeLevel = total >= 100 ? 5 
                       : total >= 50 ? 4 
                       : total >= 20 ? 3 
                       : total >= 10 ? 2 
                       : 1;

    if (newSlimeLevel !== currentSlime) {
      setPreviousSlime(currentSlime);
      setCurrentSlime(newSlimeLevel);
      setIsEvolving(true);
      setTimeout(() => setIsEvolving(false), 2000);
    }

    const goals = [10, 20, 50, 100];
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
  const completedTasksCount = columnOrder.done
    .map(id => tasks[id])
    .filter(task => task && !task.expClaimed).length;

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
      // 進化演出のトリガー
      const newTotal = totalCleared + claimedCount;
      const newSlimeLevel = newTotal >= 100 ? 5 
                         : newTotal >= 50 ? 4 
                         : newTotal >= 20 ? 3 
                         : newTotal >= 10 ? 2 
                         : 1;

      if (newSlimeLevel !== currentSlime) {
        setPreviousSlime(currentSlime);
        setCurrentSlime(newSlimeLevel);
        setIsEvolving(true);
        setTimeout(() => setIsEvolving(false), 2000);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-royal-blue text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <button
            onClick={onNavigateToBoard}
            className="flex items-center bg-blue-700 hover:bg-blue-800 transition-colors duration-200 text-white px-3 py-2 rounded mr-4"
          >
            <ArrowLeft size={18} className="mr-1" />
            タスクボードに戻る
          </button>
          <div className="flex items-center">
            <img 
              src="/quest-board-logo.svg" 
              alt="Quest Board Logo" 
              className="w-8 h-8 mr-3"
            />
            <h1 className="text-2xl font-pixel">旅の記録</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            
            {/* スライム表示エリア */}
            <div className="text-center">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-pixel text-gray-800">冒険者の成長</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPastTasks(true)}
                    className="p-3 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="過去のタスクを表示"
                  >
                    <History size={24} />
                  </button>
                  <button
                    onClick={handleResetClick}
                    className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    title="記録をリセット"
                  >
                    <RefreshCw size={24} />
                  </button>
                </div>
              </div>

              {/* スライム進化演出エリア */}
              <div className="relative flex justify-center mb-8">
                {isEvolving && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute">
                        <div className="animate-sparkle absolute -top-12 -left-12">✨</div>
                        <div className="animate-sparkle absolute -top-12 left-12">✨</div>
                        <div className="animate-sparkle absolute top-12 -left-12">✨</div>
                        <div className="animate-sparkle absolute top-12 left-12">✨</div>
                        <div className="animate-sparkle absolute -top-8 right-16">⭐</div>
                        <div className="animate-sparkle absolute bottom-8 -right-16">🌟</div>
                      </div>
                    </div>
                    <img 
                      src={`/slime_${previousSlime}.jpg`}
                      alt={`Level ${previousSlime} Slime`}
                      className="w-48 h-48 object-contain rounded-lg shadow-md opacity-50 absolute"
                    />
                  </>
                )}
                <img 
                  src={`/slime_${currentSlime}.jpg`} 
                  alt={`Level ${currentSlime} Slime`}
                  className={`w-48 h-48 object-contain rounded-lg shadow-md ${isEvolving ? 'animate-bounce' : ''}`}
                />
              </div>

              <div className="space-y-4 mb-8">
                <p className="font-pixel text-2xl text-gray-700">
                  これまでに{totalCleared}個のタスクをクリア！
                </p>
                {nextGoal !== Infinity && (
                  <p className="font-pixel text-lg text-blue-600">
                    あと{nextGoal - totalCleared}個で進化！
                  </p>
                )}
                
                {/* 経験値反映ボタン */}
                {completedTasksCount > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mt-6">
                    <p className="font-pixel text-lg text-yellow-800 mb-4">
                      {completedTasksCount}個の完了タスクがあります
                    </p>
                    <button
                      onClick={handleClaimAllExp}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-pixel px-8 py-4 rounded-lg transition-all duration-200 flex items-center gap-3 mx-auto text-lg"
                    >
                      <Star size={24} />
                      経験値を反映する
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* グラフエリア */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 確認ダイアログ */}
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

export default JourneyPage;
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
import { useAudioStore } from '../store/useAudioStore';
import { playSound, playComplexSound } from '../utils/audio';
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
  const { clearedTasks, resetJourney, addClearedTask } = useJourneyStore();
  const { claimAllExp, columnOrder, tasks } = useTaskStore();
  const { getVolumeValue } = useAudioStore();
  const [currentSlime, setCurrentSlime] = useState(1);
  const [nextGoal, setNextGoal] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [previousSlime, setPreviousSlime] = useState(1);
  const [showPastTasks, setShowPastTasks] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [slimeAction, setSlimeAction] = useState('');

  // スライムレベルに応じた背景テーマを取得
  const getBackgroundTheme = (slimeLevel: number) => {
    const themes = {
      1: { 
        bg: 'bg-gradient-to-br from-green-200 via-green-300 to-green-400', 
        scene: '🌱草原',
        title: '新米冒険者'
      },
      2: { 
        bg: 'bg-gradient-to-br from-green-300 via-green-500 to-green-600', 
        scene: '🌲森',
        title: '見習い冒険者'
      },
      3: { 
        bg: 'bg-gradient-to-br from-gray-400 via-gray-600 to-gray-700', 
        scene: '🕳️洞窟',
        title: '熟練冒険者'
      },
      4: { 
        bg: 'bg-gradient-to-br from-purple-400 via-purple-600 to-purple-700', 
        scene: '🏰城',
        title: 'エキスパート'
      },
      5: { 
        bg: 'bg-gradient-to-br from-blue-300 via-indigo-500 to-indigo-600', 
        scene: '☁️天空',
        title: 'マスター冒険者'
      }
    };
    return themes[slimeLevel as keyof typeof themes] || themes[1];
  };

  const backgroundTheme = getBackgroundTheme(currentSlime);

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
      
      // 進化効果音を再生
      playComplexSound('evolution', getVolumeValue());
      
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
      label: 'クリアしたクエスト',
      data: last7Days.map(date => clearedTasks[date]?.count || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(37, 99, 235, 1)',
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
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
        text: '🗓️ 過去7日間のクリア数',
        font: {
          family: "'Press Start 2P', 'DotGothic16', sans-serif",
          size: 12
        },
        color: '#374151'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: "'Press Start 2P', 'DotGothic16', sans-serif",
            size: 10
          }
        },
        grid: {
          color: '#e5e7eb'
        }
      },
      x: {
        ticks: {
          font: {
            family: "'Press Start 2P', 'DotGothic16', sans-serif",
            size: 10
          }
        },
        grid: {
          color: '#e5e7eb'
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

  // スライムクリック処理
  const handleSlimeClick = () => {
    // 効果音再生
    playSound('slime_click', getVolumeValue());
    
    // ランダムアクション
    const actions = ['animate-slime-bounce', 'animate-slime-wiggle', 'animate-slime-glow', 'animate-slime-heart'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    setSlimeAction(randomAction);
    setTimeout(() => setSlimeAction(''), 1000);
  };

  const handleClaimAllExp = () => {
    // 完了タスクを取得してJourneyStoreに追加
    const completedTasks = columnOrder.done
      .map(id => tasks[id])
      .filter(task => task && !task.expClaimed);

    // 各タスクをJourneyStoreに追加
    completedTasks.forEach(task => {
      addClearedTask(task);
    });

    // TaskStoreから経験値を反映（タスクを削除）
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
        
        // 進化効果音を再生
        playComplexSound('evolution', getVolumeValue());
        
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
        <div className="container mx-auto max-w-7xl h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            
            {/* 左側: スライム主役エリア */}
            <div className={`${backgroundTheme.bg} rounded-xl overflow-hidden shadow-2xl relative min-h-[600px] lg:min-h-full`}>
              
              {/* メインコンテンツ */}
              <div className="relative z-10 flex flex-col h-full p-6 text-center">
                
                {/* ヘッダー情報 */}
                <div className="flex-shrink-0 mb-6">
                  <h2 className="text-3xl lg:text-4xl font-pixel text-white drop-shadow-lg mb-2">
                    Lv.{currentSlime} スライム
                  </h2>
                  <p className="text-lg lg:text-xl font-pixel text-white/90 drop-shadow-md mb-1">
                    {backgroundTheme.title}
                  </p>
                  <p className="text-base lg:text-lg font-pixel text-white/80 drop-shadow-md">
                    {backgroundTheme.scene}の住人
                  </p>
                </div>
                
                {/* メインスライム表示 */}
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div 
                    className="relative group cursor-pointer select-none"
                    onClick={handleSlimeClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {/* オーラエフェクト */}
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse scale-110 blur-sm"></div>
                    
                    {/* 進化時の旧スライム表示 */}
                    {isEvolving && (
                      <img 
                        src={`/slime_${previousSlime}.jpg`}
                        alt={`Level ${previousSlime} Slime`}
                        className="w-64 h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl opacity-50 absolute animate-evolution"
                      />
                    )}
                    
                    {/* スライム本体 */}
                    <img 
                      src={`/slime_${currentSlime}.jpg`} 
                      alt={`Level ${currentSlime} Slime`}
                      className={`w-64 h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl transition-all duration-300 
                                 group-hover:scale-105 ${isEvolving ? 'animate-evolution' : ''} ${slimeAction}`}
                    />
                  </div>
                </div>
                
                {/* 進捗情報 */}
                <div className="flex-shrink-0 w-full max-w-md mx-auto">
                  <div className="space-y-3 mb-4">
                    <p className="font-pixel text-xl lg:text-2xl text-white drop-shadow-lg">
                      {totalCleared}個のタスクをクリア！
                    </p>
                    {nextGoal !== Infinity && (
                      <p className="font-pixel text-sm lg:text-lg text-white/90 drop-shadow-md">
                        次の進化まで: {nextGoal - totalCleared}個
                      </p>
                    )}
                  </div>
                  
                  {/* 進捗バー */}
                  <div className="bg-white/30 rounded-full h-3 lg:h-4 backdrop-blur-sm border border-white/40 mb-4">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 lg:h-4 rounded-full transition-all duration-500 shadow-inner"
                      style={{ 
                        width: nextGoal !== Infinity ? `${((totalCleared % (nextGoal === 10 ? 10 : nextGoal === 20 ? 10 : nextGoal === 50 ? 30 : 50)) / (nextGoal === 10 ? 10 : nextGoal === 20 ? 10 : nextGoal === 50 ? 30 : 50)) * 100}%` : '100%'
                      }}
                    ></div>
                  </div>
                  
                  {/* 経験値反映ボタン */}
                  {completedTasksCount > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 w-full">
                      <p className="font-pixel text-sm lg:text-base text-white drop-shadow-md mb-3">
                        {completedTasksCount}個の完了タスクがあります
                      </p>
                      <button
                        onClick={handleClaimAllExp}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-pixel px-4 py-2 lg:px-6 lg:py-3 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Star size={16} className="lg:w-5 lg:h-5" />
                        経験値を反映する
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右側: 統計・グラフエリア */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              
              {/* 統計エリアヘッダー - インラインスタイルで強制的に背景色を適用 */}
              <div 
                className="text-white p-6"
                style={{
                  background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                  backgroundColor: '#3b82f6'
                }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-pixel text-white">冒険の記録</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPastTasks(true)}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                      title="過去のタスクを表示"
                    >
                      <History size={20} />
                    </button>
                    <button
                      onClick={handleResetClick}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                      title="記録をリセット"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 統計カード */}
              <div className="p-6 space-y-6">
                
                {/* 統計グリッド */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="font-pixel text-sm text-blue-600">総クリア数</div>
                      <div className="font-pixel text-2xl text-blue-800">{totalCleared}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">⭐</div>
                      <div className="font-pixel text-sm text-green-600">現在レベル</div>
                      <div className="font-pixel text-2xl text-green-800">Lv.{currentSlime}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🔥</div>
                      <div className="font-pixel text-sm text-purple-600">今週のクリア</div>
                      <div className="font-pixel text-2xl text-purple-800">
                        {last7Days.reduce((sum, date) => sum + (clearedTasks[date]?.count || 0), 0)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">⚡</div>
                      <div className="font-pixel text-sm text-orange-600">待機中</div>
                      <div className="font-pixel text-2xl text-orange-800">{completedTasksCount}</div>
                    </div>
                  </div>
                </div>

                {/* グラフエリア */}
                <div className="bg-gray-50 rounded-xl p-6 border">
                  <div className="h-80">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>
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
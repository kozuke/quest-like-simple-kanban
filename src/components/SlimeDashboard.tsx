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
import { useTaskStore } from '../store/useTaskStore';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SlimeDashboard: React.FC = () => {
  const { tasks } = useTaskStore();
  const [clearedTasks, setClearedTasks] = useState<Record<string, number>>({});
  const [totalCleared, setTotalCleared] = useState(0);
  const [currentSlime, setCurrentSlime] = useState(1);
  const [nextGoal, setNextGoal] = useState(10);

  useEffect(() => {
    // Calculate tasks cleared per day
    const tasksByDay: Record<string, number> = {};
    Object.values(tasks).forEach(task => {
      if (task.status === 'done') {
        const date = new Date(task.createdAt).toISOString().split('T')[0];
        tasksByDay[date] = (tasksByDay[date] || 0) + 1;
      }
    });
    setClearedTasks(tasksByDay);

    // Calculate total cleared tasks
    const total = Object.values(tasksByDay).reduce((sum, count) => sum + count, 0);
    setTotalCleared(total);

    // Determine slime evolution
    if (total >= 100) setCurrentSlime(5);
    else if (total >= 50) setCurrentSlime(4);
    else if (total >= 20) setCurrentSlime(3);
    else if (total >= 10) setCurrentSlime(2);
    else setCurrentSlime(1);

    // Set next evolution goal
    const goals = [10, 20, 50, 100];
    const next = goals.find(n => n > total) ?? Infinity;
    setNextGoal(next);
  }, [tasks]);

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const chartData = {
    labels: last7Days.map(date => date.split('-').slice(1).join('/')),
    datasets: [{
      label: 'クリアしたタスク',
      data: last7Days.map(date => clearedTasks[date] || 0),
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-pixel text-gray-800 mb-4">旅の記録</h2>
        <div className="flex justify-center mb-4">
          <img 
            src={`/images/slimes/slime${currentSlime}.gif`} 
            alt={`Level ${currentSlime} Slime`}
            className="w-32 h-32 object-contain"
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
    </div>
  );
};

export default SlimeDashboard;
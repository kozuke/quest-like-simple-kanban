import React from 'react';
import { Save, FileText, Settings } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

interface HeaderProps {
  openReportModal: () => void;
  openTemplateModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ openReportModal, openTemplateModal }) => {
  const { saveToLocalStorage } = useTaskStore();
  
  const handleSave = () => {
    saveToLocalStorage();
    
    // Optional: Show a save confirmation
    const saveNotification = document.getElementById('save-notification');
    if (saveNotification) {
      saveNotification.classList.remove('opacity-0');
      saveNotification.classList.add('opacity-100');
      
      setTimeout(() => {
        saveNotification.classList.remove('opacity-100');
        saveNotification.classList.add('opacity-0');
      }, 2000);
    }
    
    // Optional: Play chime sound
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1862/1862-preview.mp3');
      audio.volume = 0.3;
      audio.play();
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  return (
    <header className="bg-royal-blue text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-pixel">ドラゴンタスク</h1>
          <span className="ml-2 text-sm bg-yellow-500 text-blue-900 px-2 py-0.5 rounded font-pixel">
            v1.0
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={openTemplateModal}
            className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded flex items-center"
          >
            <Settings size={18} className="mr-1" />
            <span className="hidden sm:inline">テンプレート</span>
          </button>
          
          <button
            onClick={openReportModal}
            className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded flex items-center"
          >
            <FileText size={18} className="mr-1" />
            <span className="hidden sm:inline">日報</span>
          </button>
          
          <button
            onClick={handleSave}
            className="bg-gold hover:bg-yellow-600 text-blue-900 font-semibold px-3 py-2 rounded flex items-center"
          >
            <Save size={18} className="mr-1" />
            <span>保存</span>
          </button>
        </div>
      </div>
      
      {/* Save notification */}
      <div 
        id="save-notification" 
        className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 opacity-0 z-50"
      >
        タスクが保存されました ✓
      </div>
    </header>
  );
};

export default Header;
import React, { useState } from 'react';
import { Save, FileText, Settings } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

interface HeaderProps {
  openReportModal: () => void;
  openTemplateModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ openReportModal, openTemplateModal }) => {
  const { saveToLocalStorage } = useTaskStore();
  const [isReportHovered, setIsReportHovered] = useState(false);
  const [isSaveHovered, setIsSaveHovered] = useState(false);
  const [isTemplateHovered, setIsTemplateHovered] = useState(false);
  
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
  };

  return (
    <header className="bg-royal-blue text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/quest-board-logo.svg" 
            alt="Quest Board Logo" 
            className="w-8 h-8 mr-3"
          />
          <h1 className="text-2xl font-pixel">Dragon Task</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={openTemplateModal}
            onMouseEnter={() => setIsTemplateHovered(true)}
            onMouseLeave={() => setIsTemplateHovered(false)}
            className={`bg-blue-700 ${isTemplateHovered ? 'bg-blue-800' : ''} transition-colors duration-200 text-white px-3 py-2 rounded flex items-center`}
          >
            <Settings size={18} className="mr-1" />
            <span className="hidden sm:inline">テンプレート</span>
          </button>
          
          <button
            onClick={openReportModal}
            onMouseEnter={() => setIsReportHovered(true)}
            onMouseLeave={() => setIsReportHovered(false)}
            className={`bg-blue-700 ${isReportHovered ? 'bg-blue-800' : ''} transition-colors duration-200 text-white px-3 py-2 rounded flex items-center`}
          >
            <FileText size={18} className="mr-1" />
            <span className="hidden sm:inline">日報</span>
          </button>
          
          <button
            onClick={handleSave}
            onMouseEnter={() => setIsSaveHovered(true)}
            onMouseLeave={() => setIsSaveHovered(false)}
            className={`bg-gold ${isSaveHovered ? 'bg-yellow-600' : ''} transition-colors duration-200 text-blue-900 font-semibold px-3 py-2 rounded flex items-center`}
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
        style={{ pointerEvents: 'none' }} // 透明時にマウスイベントをキャプチャしないようにする
      >
        タスクが保存されました ✓
      </div>
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { FileText, Settings, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';

interface HeaderProps {
  openReportModal: () => void;
  openTemplateModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ openReportModal, openTemplateModal }) => {
  const [isReportHovered, setIsReportHovered] = useState(false);
  const [isTemplateHovered, setIsTemplateHovered] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  
  const { volumeLevel, cycleVolume, loadFromLocalStorage } = useAudioStore();

  useEffect(() => {
    // コンポーネントマウント時に音量設定をローカルストレージから読み込み
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const getVolumeIcon = () => {
    switch (volumeLevel) {
      case 'off':
        return <VolumeX size={18} />;
      case 'low':
        return <Volume1 size={18} />;
      case 'medium':
      case 'high':
        return <Volume2 size={18} />;
      default:
        return <Volume2 size={18} />;
    }
  };

  const getVolumeLabel = () => {
    switch (volumeLevel) {
      case 'off': return '無音';
      case 'low': return '小';
      case 'medium': return '中';
      case 'high': return '大';
      default: return '中';
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
            onClick={cycleVolume}
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
            className={`bg-blue-700 ${isVolumeHovered ? 'bg-blue-800' : ''} transition-colors duration-200 text-white px-3 py-2 rounded flex items-center`}
            title={`音量: ${getVolumeLabel()}`}
          >
            {getVolumeIcon()}
            <span className="hidden sm:inline ml-1">{getVolumeLabel()}</span>
          </button>
          
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
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useState } from 'react';
import { FileText, Settings } from 'lucide-react';

interface HeaderProps {
  openReportModal: () => void;
  openTemplateModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ openReportModal, openTemplateModal }) => {
  const [isReportHovered, setIsReportHovered] = useState(false);
  const [isTemplateHovered, setIsTemplateHovered] = useState(false);

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
        </div>
      </div>
    </header>
  );
};

export default Header;
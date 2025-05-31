import React, { useState, useEffect, useRef } from 'react';
import { Copy, X } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useReportStore } from '../store/useReportStore';
import { generateReport } from '../utils/reportGenerator';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  openTemplateModal: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ 
  isOpen, 
  onClose,
  openTemplateModal 
}) => {
  const { tasks, columnOrder } = useTaskStore();
  const { template } = useReportStore();
  const [report, setReport] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReport(generateReport(tasks, columnOrder, template));
    }
  }, [isOpen, tasks, columnOrder, template]);

  const handleCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      navigator.clipboard.writeText(textareaRef.current.value);
      setCopied(true);
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" 
      style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4 shadow-2xl overflow-hidden">
        <div className="bg-royal-blue text-white px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-pixel">日報ジェネレーター</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={report}
            onChange={(e) => setReport(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm resize-none"
            readOnly={false}
          />
          
          <div className="flex justify-between mt-4">
            <button
              onClick={openTemplateModal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              テンプレート編集
            </button>
            
            <button
              onClick={handleCopy}
              className={`flex items-center ${
                copied 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-royal-blue hover:bg-blue-800'
              } text-white px-4 py-2 rounded transition-colors`}
            >
              {copied ? (
                <>コピーしました ✓</>
              ) : (
                <>
                  <Copy size={18} className="mr-2" />
                  クリップボードにコピー
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
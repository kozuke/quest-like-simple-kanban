import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCcw } from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { useTaskStore } from '../store/useTaskStore';
import { generateReport } from '../utils/reportGenerator';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { 
    template, 
    setTemplate, 
    resetTemplate, 
    saveTemplate 
  } = useReportStore();
  
  const { tasks, columnOrder } = useTaskStore();
  const [editedTemplate, setEditedTemplate] = useState(template);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEditedTemplate(template);
      updatePreview(template);
    }
  }, [isOpen, template]);

  const updatePreview = (templateText: string) => {
    try {
      const previewText = generateReport(tasks, columnOrder, templateText);
      setPreview(previewText);
    } catch (error) {
      setPreview('テンプレートのプレビューエラー: ' + (error as Error).message);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTemplate = e.target.value;
    setEditedTemplate(newTemplate);
    updatePreview(newTemplate);
  };

  const handleSave = () => {
    setTemplate(editedTemplate);
    saveTemplate();
    onClose();
  };

  const handleReset = () => {
    const defaultTemplate = useReportStore.getState().getDefaultTemplate();
    setEditedTemplate(defaultTemplate);
    updatePreview(defaultTemplate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 shadow-2xl overflow-hidden">
        <div className="bg-royal-blue text-white px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-pixel">テンプレートエディタ</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">テンプレート編集</h3>
              <textarea
                value={editedTemplate}
                onChange={handleTemplateChange}
                className="w-full h-80 p-3 border border-gray-300 rounded font-mono text-sm"
              />
              
              <div className="bg-gray-100 p-3 rounded-md text-sm">
                <h4 className="font-semibold mb-1">使用可能なプレースホルダ:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>{'{{date}}'}</code> - 現在の日付</li>
                  <li><code>{'{{#backlog}}...{{/backlog}}'}</code> - バックログタスク用セクション</li>
                  <li><code>{'{{#doing}}...{{/doing}}'}</code> - 進行中タスク用セクション</li>
                  <li><code>{'{{#done}}...{{/done}}'}</code> - 完了タスク用セクション</li>
                  <li><code>{'{{^backlog}}...{{/backlog}}'}</code> - バックログが空の場合のセクション</li>
                  <li><code>{'{{title}}'}</code> - タスクのタイトル</li>
                  <li><code>{'{{#description}}...{{/description}}'}</code> - 説明がある場合</li>
                  <li><code>{'{{description}}'}</code> - タスクの説明</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">プレビュー</h3>
              <div className="w-full h-80 p-3 border border-gray-300 rounded overflow-auto bg-gray-50 whitespace-pre-wrap font-mono text-sm">
                {preview}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <button
              onClick={handleReset}
              className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              <RefreshCcw size={18} className="mr-2" />
              デフォルトにリセット
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center bg-royal-blue hover:bg-blue-800 text-white px-4 py-2 rounded"
            >
              <Save size={18} className="mr-2" />
              テンプレートを保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorModal;
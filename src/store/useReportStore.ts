import { create } from 'zustand';
import { ReportTemplate } from '../types/task';
import { 
  validateAndSanitizeTemplate, 
  checkLocalStorageQuota,
  sanitizeForXSS
} from '../utils/security';

const STORAGE_KEY = 'kanban-report-template';

const DEFAULT_TEMPLATE = `# 日報 {{date}}

## 🗺 クエスト (未着手)
{{#backlog}}
- {{title}}{{#description}} - {{description}}{{/description}}
{{/backlog}}
{{^backlog}}
- なし
{{/backlog}}

## ⚔ 冒険中 (進行中)
{{#doing}}
- {{title}}{{#description}} - {{description}}{{/description}}
{{/doing}}
{{^doing}}
- なし
{{/doing}}

## 👑 クリア (完了)
{{#done}}
- {{title}}{{#description}} - {{description}}{{/description}}
{{/done}}
{{^done}}
- なし
{{/done}}

### 明日の予定
- 
`;

export const useReportStore = create<ReportTemplate>((set, get) => ({
  template: DEFAULT_TEMPLATE,

  getDefaultTemplate: () => DEFAULT_TEMPLATE,

  setTemplate: (template) => {
    // テンプレートをサニタイズ
    const sanitizedTemplate = sanitizeForXSS(template);
    set({ template: sanitizedTemplate });
  },

  resetTemplate: () => {
    set({ template: DEFAULT_TEMPLATE });
  },

  saveTemplate: () => {
    const { template } = get();
    try {
      // テンプレートを再度サニタイズ
      const sanitizedTemplate = validateAndSanitizeTemplate(template);
      
      // ストレージ容量をチェック
      if (!checkLocalStorageQuota(STORAGE_KEY, sanitizedTemplate)) {
        console.error('LocalStorage容量が不足しています');
        return;
      }
      
      localStorage.setItem(STORAGE_KEY, sanitizedTemplate);
      console.log('テンプレートが正常に保存されました');
    } catch (error) {
      console.error('Failed to save template to localStorage:', error);
    }
  },

  loadTemplate: () => {
    try {
      const savedTemplate = localStorage.getItem(STORAGE_KEY);
      if (savedTemplate) {
        // 読み込んだテンプレートを検証とサニタイズ
        const sanitizedTemplate = validateAndSanitizeTemplate(savedTemplate);
        
        if (sanitizedTemplate) {
          set({ template: sanitizedTemplate });
          console.log('テンプレートが正常に読み込まれました');
        } else {
          console.warn('保存されたテンプレートが無効なため、デフォルトテンプレートを使用します');
          set({ template: DEFAULT_TEMPLATE });
        }
      } else {
        set({ template: DEFAULT_TEMPLATE });
        console.log('保存されたテンプレートが見つからないため、デフォルトテンプレートを使用します');
      }
    } catch (error) {
      console.error('Failed to load template from localStorage:', error);
      // エラーの場合はデフォルトテンプレートにフォールバック
      set({ template: DEFAULT_TEMPLATE });
    }
  },
}));
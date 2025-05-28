import { create } from 'zustand';
import { ReportTemplate } from '../types/task';

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
    set({ template });
  },

  resetTemplate: () => {
    set({ template: DEFAULT_TEMPLATE });
  },

  saveTemplate: () => {
    const { template } = get();
    try {
      localStorage.setItem(STORAGE_KEY, template);
    } catch (error) {
      console.error('Failed to save template to localStorage:', error);
    }
  },

  loadTemplate: () => {
    try {
      const savedTemplate = localStorage.getItem(STORAGE_KEY);
      if (savedTemplate) {
        set({ template: savedTemplate });
      } else {
        set({ template: DEFAULT_TEMPLATE });
      }
    } catch (error) {
      console.error('Failed to load template from localStorage:', error);
      set({ template: DEFAULT_TEMPLATE });
    }
  },
}));
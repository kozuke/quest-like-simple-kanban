import { Task, TaskStatus } from '../types/task';
import { escapeHtml, sanitizeText } from './security';

interface ReportContext {
  date: string;
  backlog: Task[];
  doing: Task[];
  done: Task[];
}

export function generateReport(
  tasks: Record<string, Task>,
  columnOrder: Record<TaskStatus, string[]>,
  template: string
): string {
  try {
    const today = new Date();
    const dateStr = today.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-');

    // 一度だけタスクをマップして、各カラムのタスクを効率的に取得
    const getTasksForColumn = (columnIds: string[]): Task[] => {
      return columnIds
        .map(id => tasks[id])
        .filter(Boolean)
        .map(sanitizeTaskForReport);
    };

    const context: ReportContext = {
      date: sanitizeText(dateStr),
      backlog: getTasksForColumn(columnOrder.backlog),
      doing: getTasksForColumn(columnOrder.doing),
      done: getTasksForColumn(columnOrder.done),
    };

    return renderTemplate(template, context);
  } catch (error) {
    console.error('Report generation error:', error);
    return 'レポート生成中にエラーが発生しました。';
  }
}

/**
 * レポート用にタスクデータをサニタイズ
 */
function sanitizeTaskForReport(task: Task): Task {
  return {
    ...task,
    title: sanitizeText(task.title),
    description: task.description ? sanitizeText(task.description) : '',
  };
}

function renderTemplate(template: string, context: ReportContext): string {
  // テンプレート自体をサニタイズ
  let result = sanitizeText(template);

  // Replace simple variables (エスケープ済み)
  result = result.replace(/{{date}}/g, context.date);

  // Handle sections for each status
  result = processSectionTags(result, 'backlog', context.backlog);
  result = processSectionTags(result, 'doing', context.doing);
  result = processSectionTags(result, 'done', context.done);

  return result;
}

function processSectionTags(template: string, sectionName: string, items: Task[]): string {
  let result = template;

  // Handle #section tags (for when items exist)
  const hasItemsRegex = new RegExp(`{{#${sectionName}}}([\\s\\S]*?){{/${sectionName}}}`, 'g');
  result = result.replace(hasItemsRegex, (_, content) => {
    if (items.length === 0) return '';
    
    // items.mapを最適化 - 一度のループでitemContentを生成
    const itemContents: string[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let itemContent = content;
      
      // タスクのタイトルと説明を安全に挿入（既にサニタイズ済み）
      itemContent = itemContent.replace(/{{title}}/g, item.title);
      
      // Handle optional description
      if (item.description) {
        itemContent = itemContent.replace(/{{#description}}([\s\S]*?){{\/description}}/g, '$1');
        itemContent = itemContent.replace(/{{description}}/g, item.description);
      } else {
        itemContent = itemContent.replace(/{{#description}}([\s\S]*?){{\/description}}/g, '');
      }
      
      // Ensure each item ends with a newline (except the last one)
      itemContent = itemContent.trim();
      if (i < items.length - 1) {
        itemContent += '\n';
      }
      
      itemContents.push(itemContent);
    }
    
    return itemContents.join('');
  });

  // Handle ^section tags (for when no items exist)
  const noItemsRegex = new RegExp(`{{\\^${sectionName}}}([\\s\\S]*?){{/${sectionName}}}`, 'g');
  result = result.replace(noItemsRegex, (_, content) => {
    return items.length === 0 ? content : '';
  });

  return result;
}
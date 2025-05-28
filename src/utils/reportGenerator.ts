import { Task, TaskStatus } from '../types/task';

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
  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-');

  const backlogTasks = columnOrder.backlog.map(id => tasks[id]).filter(Boolean);
  const doingTasks = columnOrder.doing.map(id => tasks[id]).filter(Boolean);
  const doneTasks = columnOrder.done.map(id => tasks[id]).filter(Boolean);

  const context: ReportContext = {
    date: dateStr,
    backlog: backlogTasks,
    doing: doingTasks,
    done: doneTasks,
  };

  return renderTemplate(template, context);
}

function renderTemplate(template: string, context: ReportContext): string {
  let result = template;

  // Replace simple variables
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
    
    return items.map(item => {
      let itemContent = content;
      itemContent = itemContent.replace(/{{title}}/g, item.title);
      
      // Handle optional description
      if (item.description) {
        itemContent = itemContent.replace(/{{#description}}([\s\S]*?){{\/description}}/g, '$1');
        itemContent = itemContent.replace(/{{description}}/g, item.description);
      } else {
        itemContent = itemContent.replace(/{{#description}}([\s\S]*?){{\/description}}/g, '');
      }
      
      return itemContent;
    }).join('');
  });

  // Handle ^section tags (for when no items exist)
  const noItemsRegex = new RegExp(`{{\\^${sectionName}}}([\\s\\S]*?){{/${sectionName}}}`, 'g');
  result = result.replace(noItemsRegex, (_, content) => {
    return items.length === 0 ? content : '';
  });

  return result;
}
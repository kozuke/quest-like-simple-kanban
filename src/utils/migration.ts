import { Task, TaskStatus } from '../types/task';

interface LegacyTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
}

interface LegacyData {
  tasks: Record<string, LegacyTask>;
  columnOrder: {
    backlog: string[];
    doing: string[];
    done: string[];
  };
}

export function migrateLegacyData(): {
  tasks: Record<string, Task>;
  columnOrder: Record<TaskStatus, string[]>;
} | null {
  try {
    // Check for legacy data
    const legacyData = localStorage.getItem('kanban-tasks');
    if (!legacyData) {
      return null;
    }

    // Parse and validate legacy data
    const parsed = JSON.parse(legacyData);
    if (!isValidLegacyData(parsed)) {
      console.warn('Invalid legacy data structure found');
      return null;
    }

    // Transform legacy tasks to new format
    const migratedTasks: Record<string, Task> = {};
    for (const [id, task] of Object.entries(parsed.tasks)) {
      migratedTasks[id] = {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        expClaimed: false
      };
    }

    // Migrate column order
    const migratedColumnOrder = {
      backlog: [...parsed.columnOrder.backlog],
      doing: [...parsed.columnOrder.doing],
      done: [...parsed.columnOrder.done]
    };

    // Remove legacy data after successful migration
    localStorage.removeItem('kanban-tasks');

    console.log('Legacy data migration completed successfully');
    return {
      tasks: migratedTasks,
      columnOrder: migratedColumnOrder
    };
  } catch (error) {
    console.error('Error during data migration:', error);
    return null;
  }
}

function isValidLegacyData(data: any): data is LegacyData {
  return (
    data &&
    typeof data === 'object' &&
    'tasks' in data &&
    'columnOrder' in data &&
    typeof data.tasks === 'object' &&
    typeof data.columnOrder === 'object' &&
    Array.isArray(data.columnOrder.backlog) &&
    Array.isArray(data.columnOrder.doing) &&
    Array.isArray(data.columnOrder.done)
  );
}
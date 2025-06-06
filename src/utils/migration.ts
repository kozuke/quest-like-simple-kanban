import { Task, TaskStatus } from '../types/task';

interface LegacyTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  expClaimed?: boolean;
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
      console.log('No legacy data found');
      return null;
    }

    console.log('Found legacy data:', legacyData);

    // Parse and validate legacy data
    const parsed = JSON.parse(legacyData);
    if (!isValidLegacyData(parsed)) {
      console.warn('Invalid legacy data structure:', parsed);
      return null;
    }

    // Transform legacy tasks to new format
    const migratedTasks: Record<string, Task> = {};
    for (const [id, task] of Object.entries(parsed.tasks)) {
      migratedTasks[id] = {
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        createdAt: task.createdAt,
        expClaimed: task.expClaimed || false
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

    console.log('Migration completed. Migrated data:', {
      tasks: migratedTasks,
      columnOrder: migratedColumnOrder
    });

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
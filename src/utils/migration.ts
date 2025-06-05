import { Task, TaskStatus } from '../types/task';

interface LegacyTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
}

interface LegacyData {
  state: {
    tasks: Record<string, LegacyTask>;
    columnOrder: {
      backlog: string[];
      doing: string[];
      done: string[];
    };
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
    for (const [id, task] of Object.entries(parsed.state.tasks)) {
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
      backlog: [...parsed.state.columnOrder.backlog],
      doing: [...parsed.state.columnOrder.doing],
      done: [...parsed.state.columnOrder.done]
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
    'state' in data &&
    typeof data.state === 'object' &&
    'tasks' in data.state &&
    'columnOrder' in data.state &&
    typeof data.state.tasks === 'object' &&
    typeof data.state.columnOrder === 'object' &&
    Array.isArray(data.state.columnOrder.backlog) &&
    Array.isArray(data.state.columnOrder.doing) &&
    Array.isArray(data.state.columnOrder.done)
  );
}
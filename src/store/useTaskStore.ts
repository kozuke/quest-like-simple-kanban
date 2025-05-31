import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Task, TaskStatus, TaskStore } from '../types/task';
import { 
  validateAndSanitizeTask, 
  validateAndSanitizeColumnOrder, 
  safeJsonParse, 
  checkLocalStorageQuota,
  sanitizeForXSS
} from '../utils/security';

const STORAGE_KEY = 'kanban-tasks';

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},
  columnOrder: {
    backlog: [],
    doing: [],
    done: [],
  },

  addTask: (title, description = '', status = 'backlog') => {
    // 入力データをサニタイズ
    const sanitizedTitle = sanitizeForXSS(title);
    const sanitizedDescription = sanitizeForXSS(description);
    
    if (!sanitizedTitle.trim()) {
      console.warn('タスクのタイトルが空です');
      return;
    }

    const id = nanoid();
    const newTask: Task = {
      id,
      title: sanitizedTitle,
      description: sanitizedDescription,
      createdAt: Date.now(),
      status,
    };

    set((state) => {
      const updatedTasks = { ...state.tasks, [id]: newTask };
      const updatedColumnOrder = {
        ...state.columnOrder,
        [status]: [...state.columnOrder[status], id],
      };

      return { tasks: updatedTasks, columnOrder: updatedColumnOrder };
    });
  },

  updateTask: (id, updates) => {
    set((state) => {
      const task = state.tasks[id];
      if (!task) return state;

      // 更新データをサニタイズ
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.title) {
        sanitizedUpdates.title = sanitizeForXSS(sanitizedUpdates.title);
      }
      if (sanitizedUpdates.description) {
        sanitizedUpdates.description = sanitizeForXSS(sanitizedUpdates.description);
      }

      const updatedTask = { ...task, ...sanitizedUpdates };
      return { tasks: { ...state.tasks, [id]: updatedTask } };
    });
  },

  removeTask: (id) => {
    set((state) => {
      const task = state.tasks[id];
      if (!task) return state;

      const { [id]: _, ...remainingTasks } = state.tasks;
      const updatedColumnOrder = {
        ...state.columnOrder,
        [task.status]: state.columnOrder[task.status].filter((taskId) => taskId !== id),
      };

      return { tasks: remainingTasks, columnOrder: updatedColumnOrder };
    });
  },

  moveTask: (taskId, destination, index) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;

      const sourceStatus = task.status;
      if (sourceStatus === destination && 
          state.columnOrder[sourceStatus].indexOf(taskId) === index) {
        return state;
      }

      // Remove from source column
      const sourceColumn = state.columnOrder[sourceStatus].filter(
        (id) => id !== taskId
      );

      // Add to destination column at specified index
      const destinationColumn = [...state.columnOrder[destination]];
      destinationColumn.splice(index, 0, taskId);

      // Update task status
      const updatedTask = { ...task, status: destination };

      return {
        tasks: { ...state.tasks, [taskId]: updatedTask },
        columnOrder: {
          ...state.columnOrder,
          [sourceStatus]: sourceColumn,
          [destination]: destinationColumn,
        },
      };
    });
  },

  reorderColumn: (status, newOrder) => {
    set((state) => ({
      columnOrder: {
        ...state.columnOrder,
        [status]: newOrder,
      },
    }));
  },

  saveToLocalStorage: () => {
    const { tasks, columnOrder } = get();
    
    try {
      const dataToSave = JSON.stringify({ tasks, columnOrder });
      
      // ストレージ容量をチェック
      if (!checkLocalStorageQuota(STORAGE_KEY, dataToSave)) {
        console.error('LocalStorage容量が不足しています');
        return;
      }
      
      localStorage.setItem(STORAGE_KEY, dataToSave);
      console.log('データが正常に保存されました');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  loadFromLocalStorage: () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) {
        console.log('保存されたデータが見つかりません');
        return;
      }

      // 安全にJSONをパース
      const parsedData = safeJsonParse(savedData);
      if (!parsedData) {
        console.error('保存されたデータが破損しています');
        return;
      }

      // データを検証とサニタイズ
      const sanitizedTasks: Record<string, Task> = {};
      if (parsedData.tasks && typeof parsedData.tasks === 'object') {
        for (const [taskId, taskData] of Object.entries(parsedData.tasks)) {
          const sanitizedTask = validateAndSanitizeTask(taskData);
          if (sanitizedTask && sanitizedTask.id) {
            sanitizedTasks[taskId] = sanitizedTask;
          }
        }
      }

      const sanitizedColumnOrder = validateAndSanitizeColumnOrder(parsedData.columnOrder);

      // サニタイズされたデータのみを設定
      set({ 
        tasks: sanitizedTasks, 
        columnOrder: sanitizedColumnOrder 
      });
      
      console.log('データが正常に読み込まれました');
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      // エラーの場合はデフォルト状態にリセット
      set({ 
        tasks: {}, 
        columnOrder: { backlog: [], doing: [], done: [] } 
      });
    }
  },
}));
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
import { playMoveSound, playFanfareSound, playAddTaskSound, playDeleteSound } from '../utils/audio';
import { useJourneyStore } from './useJourneyStore';

const STORAGE_KEY = 'kanban-tasks';

let saveTimeoutId: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 300;

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},
  columnOrder: {
    backlog: [],
    doing: [],
    done: [],
  },

  addTask: (title, description = '', status = 'backlog') => {
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
      expClaimed: false,
    };

    set((state) => {
      const updatedTasks = { ...state.tasks, [id]: newTask };
      const updatedColumnOrder = {
        ...state.columnOrder,
        [status]: [...state.columnOrder[status], id],
      };

      return { tasks: updatedTasks, columnOrder: updatedColumnOrder };
    });

    playAddTaskSound();
    get().debouncedSave();
  },

  updateTask: (id, updates) => {
    set((state) => {
      const task = state.tasks[id];
      if (!task) return state;

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

    get().debouncedSave();
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

    playDeleteSound();
    get().debouncedSave();
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

      const sourceColumn = state.columnOrder[sourceStatus].filter(
        (id) => id !== taskId
      );

      const destinationColumn = [...state.columnOrder[destination]];
      destinationColumn.splice(index, 0, taskId);

      const updatedTask = { ...task, status: destination };

      if (destination === 'done' && sourceStatus !== 'done') {
        playFanfareSound();
      } else if (sourceStatus !== destination) {
        playMoveSound();
      }

      return {
        tasks: { ...state.tasks, [taskId]: updatedTask },
        columnOrder: {
          ...state.columnOrder,
          [sourceStatus]: sourceColumn,
          [destination]: destinationColumn,
        },
      };
    });

    get().debouncedSave();
  },

  reorderColumn: (status, newOrder) => {
    set((state) => ({
      columnOrder: {
        ...state.columnOrder,
        [status]: newOrder,
      },
    }));

    playMoveSound();
    get().debouncedSave();
  },

  copyTask: (id) => {
    set((state) => {
      const originalTask = state.tasks[id];
      if (!originalTask) return state;

      const newId = nanoid();
      
      const copiedTask: Task = {
        ...originalTask,
        id: newId,
        title: sanitizeForXSS(`${originalTask.title}のコピー`),
        createdAt: Date.now(),
        expClaimed: false,
      };

      const updatedTasks = { ...state.tasks, [newId]: copiedTask };
      const currentColumn = state.columnOrder[originalTask.status];
      const originalIndex = currentColumn.indexOf(id);
      
      const newColumn = [...currentColumn];
      newColumn.splice(originalIndex + 1, 0, newId);

      const updatedColumnOrder = {
        ...state.columnOrder,
        [originalTask.status]: newColumn,
      };

      return { tasks: updatedTasks, columnOrder: updatedColumnOrder };
    });

    playAddTaskSound();
    get().debouncedSave();
  },

  claimExp: (taskId) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task || task.expClaimed) return state;

      const updatedTask = { ...task, expClaimed: true };
      return {
        tasks: { ...state.tasks, [taskId]: updatedTask }
      };
    });

    useJourneyStore.getState().addClearedTask();
    playFanfareSound();
    get().debouncedSave();
  },

  debouncedSave: () => {
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    
    saveTimeoutId = setTimeout(() => {
      get().saveToLocalStorage();
      saveTimeoutId = null;
    }, SAVE_DEBOUNCE_MS);
  },

  saveToLocalStorage: () => {
    const { tasks, columnOrder } = get();
    
    try {
      const dataToSave = JSON.stringify({ tasks, columnOrder });
      
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

      const parsedData = safeJsonParse(savedData);
      if (!parsedData) {
        console.error('保存されたデータが破損しています');
        return;
      }

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

      set({ 
        tasks: sanitizedTasks, 
        columnOrder: sanitizedColumnOrder 
      });
      
      console.log('データが正常に読み込まれました');
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      set({ 
        tasks: {}, 
        columnOrder: { backlog: [], doing: [], done: [] } 
      });
    }
  },
}));
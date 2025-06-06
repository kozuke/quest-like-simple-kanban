import { create } from 'zustand';
import { Task } from '../types/task';

interface CompletedTask {
  title: string;
  description?: string;
}

interface DailyRecord {
  count: number;
  tasks: CompletedTask[];
}

interface JourneyStore {
  clearedTasks: Record<string, DailyRecord>;
  addClearedTask: (task: Task) => void;
  resetJourney: () => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

const STORAGE_KEY = 'kanban-journey';

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  clearedTasks: {},

  addClearedTask: (task: Task) => {
    const today = new Date().toISOString().split('T')[0];
    
    set(state => {
      const currentRecord = state.clearedTasks[today] || { count: 0, tasks: [] };
      const updatedRecord = {
        count: currentRecord.count + 1,
        tasks: [...currentRecord.tasks, {
          title: task.title,
          description: task.description
        }]
      };
      
      return {
        clearedTasks: {
          ...state.clearedTasks,
          [today]: updatedRecord
        }
      };
    });

    get().saveToLocalStorage();
  },

  resetJourney: () => {
    set({ clearedTasks: {} });
    get().saveToLocalStorage();
  },

  loadFromLocalStorage: () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && typeof parsed === 'object') {
          // Handle both old and new data structure
          const convertedData: Record<string, DailyRecord> = {};
          
          for (const [date, value] of Object.entries(parsed)) {
            if (typeof value === 'number') {
              // Convert old format to new format
              convertedData[date] = {
                count: value,
                tasks: []
              };
            } else {
              // Use new format as is
              convertedData[date] = value as DailyRecord;
            }
          }
          
          set({ clearedTasks: convertedData });
        }
      }
    } catch (error) {
      console.error('Failed to load journey data:', error);
      set({ clearedTasks: {} });
    }
  },

  saveToLocalStorage: () => {
    try {
      const { clearedTasks } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clearedTasks));
    } catch (error) {
      console.error('Failed to save journey data:', error);
    }
  }
}));
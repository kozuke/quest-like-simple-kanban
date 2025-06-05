import { create } from 'zustand';

interface JourneyStore {
  clearedTasks: Record<string, number>;
  addClearedTask: () => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

const STORAGE_KEY = 'kanban-journey';

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  clearedTasks: {},

  addClearedTask: () => {
    const today = new Date().toISOString().split('T')[0];
    
    set(state => {
      const updatedClearedTasks = {
        ...state.clearedTasks,
        [today]: (state.clearedTasks[today] || 0) + 1
      };
      
      return { clearedTasks: updatedClearedTasks };
    });

    get().saveToLocalStorage();
  },

  loadFromLocalStorage: () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && typeof parsed === 'object') {
          set({ clearedTasks: parsed });
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
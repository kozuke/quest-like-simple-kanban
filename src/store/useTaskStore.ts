import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Task, TaskStatus, TaskStore } from '../types/task';

const STORAGE_KEY = 'kanban-tasks';

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},
  columnOrder: {
    backlog: [],
    doing: [],
    done: [],
  },

  addTask: (title, description = '', status = 'backlog') => {
    const id = nanoid();
    const newTask: Task = {
      id,
      title,
      description,
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

      const updatedTask = { ...task, ...updates };
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, columnOrder }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  loadFromLocalStorage: () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const { tasks, columnOrder } = JSON.parse(savedData);
        set({ tasks, columnOrder });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },
}));
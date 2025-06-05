import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Column } from '../types/task';
import { useJourneyStore } from './useJourneyStore';
import { useAudioStore } from './useAudioStore';

interface TaskStore {
  tasks: Task[];
  draggedTask: Task | null;
  setDraggedTask: (task: Task | null) => void;
  addTask: (title: string, description: string, exp: number) => void;
  deleteTask: (taskId: number) => void;
  moveTask: (taskId: number, column: Column) => void;
  updateTask: (taskId: number, title: string, description: string, exp: number) => void;
  claimAllExp: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      draggedTask: null,
      setDraggedTask: (task) => set({ draggedTask: task }),
      addTask: (title, description, exp) => {
        const { playAddTaskSound } = useAudioStore.getState();
        playAddTaskSound();
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: Date.now(),
              title,
              description,
              exp,
              column: 'todo',
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },
      deleteTask: (taskId) => {
        const { playDeleteSound } = useAudioStore.getState();
        playDeleteSound();
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
      },
      moveTask: (taskId, column) => {
        const { playMoveSound } = useAudioStore.getState();
        playMoveSound();
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, column } : task
          ),
        }));
      },
      updateTask: (taskId, title, description, exp) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, title, description, exp } : task
          ),
        }));
      },
      claimAllExp: () => {
        const { playFanfareSound } = useAudioStore.getState();
        const { addClearedTask } = useJourneyStore.getState();
        const doneTasks = get().tasks.filter((task) => task.column === 'done');
        
        // Only proceed if there are done tasks to process
        if (doneTasks.length > 0) {
          // Add validation to ensure task and title exist before processing
          doneTasks.forEach((task) => {
            if (task && typeof task.title === 'string') {
              addClearedTask(task);
            }
          });
          
          set((state) => ({
            tasks: state.tasks.filter((task) => task.column !== 'done'),
          }));
          
          playFanfareSound();
        }
      },
    }),
    {
      name: 'task-store',
    }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus, TaskStore } from '../types/task';
import { playAddTaskSound, playDeleteSound, playMoveSound, playFanfareSound } from '../utils/audio';

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: {},
      columnOrder: {
        backlog: [],
        doing: [],
        done: []
      },
      
      addTask: (title, description = '', status: TaskStatus = 'backlog') => {
        const taskId = crypto.randomUUID();
        
        playAddTaskSound();
        
        set((state) => {
          const newTask: Task = {
            id: taskId,
            title,
            description,
            status,
            createdAt: Date.now(),
          };
          
          return {
            tasks: {
              ...state.tasks,
              [taskId]: newTask
            },
            columnOrder: {
              ...state.columnOrder,
              [status]: [...state.columnOrder[status], taskId]
            }
          };
        });
      },
      
      updateTask: (id, updates) => {
        set((state) => {
          const task = state.tasks[id];
          if (!task) return state;
          
          const updatedTask = {
            ...task,
            ...updates
          };
          
          return {
            tasks: {
              ...state.tasks,
              [id]: updatedTask
            }
          };
        });
      },
      
      removeTask: (id) => {
        playDeleteSound();
        
        set((state) => {
          const task = state.tasks[id];
          if (!task) return state;
          
          const { [id]: removed, ...remainingTasks } = state.tasks;
          const newColumnOrder = {
            ...state.columnOrder,
            [task.status]: state.columnOrder[task.status].filter(taskId => taskId !== id)
          };
          
          return {
            tasks: remainingTasks,
            columnOrder: newColumnOrder
          };
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
          
          // クリアボードに移動した場合はファンファーレ、それ以外は移動音
          if (destination === 'done' && sourceStatus !== 'done') {
            playFanfareSound();
          } else {
            playMoveSound();
          }
          
          const newColumnOrder = {
            ...state.columnOrder,
            [sourceStatus]: state.columnOrder[sourceStatus].filter(id => id !== taskId),
            [destination]: [
              ...state.columnOrder[destination].slice(0, index),
              taskId,
              ...state.columnOrder[destination].slice(index)
            ]
          };
          
          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                status: destination
              }
            },
            columnOrder: newColumnOrder
          };
        });
      },
      
      reorderColumn: (status, newOrder) => {
        set((state) => ({
          columnOrder: {
            ...state.columnOrder,
            [status]: newOrder
          }
        }));
      },
      
      copyTask: (id) => {
        set((state) => {
          const task = state.tasks[id];
          if (!task) return state;
          
          const newId = crypto.randomUUID();
          const newTask: Task = {
            ...task,
            id: newId,
            createdAt: Date.now(),
            expClaimed: false
          };
          
          playAddTaskSound();
          
          return {
            tasks: {
              ...state.tasks,
              [newId]: newTask
            },
            columnOrder: {
              ...state.columnOrder,
              [task.status]: [...state.columnOrder[task.status], newId]
            }
          };
        });
      },
      
      claimExp: (taskId) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;
          
          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                expClaimed: true
              }
            }
          };
        });
      },
      
      claimAllExp: () => {
        let claimedCount = 0;
        
        set((state) => {
          const doneTasks = state.columnOrder.done
            .map(id => state.tasks[id])
            .filter(task => task && !task.expClaimed);
          
          if (doneTasks.length === 0) return state;
          
          claimedCount = doneTasks.length;
          
          playFanfareSound();
          
          // Remove claimed tasks from the board
          const newTasks = { ...state.tasks };
          doneTasks.forEach(task => {
            delete newTasks[task.id];
          });
          
          return {
            tasks: newTasks,
            columnOrder: {
              ...state.columnOrder,
              done: state.columnOrder.done.filter(id => !doneTasks.find(task => task.id === id))
            }
          };
        });
        
        return claimedCount;
      }
    }),
    {
      name: 'task-store',
      version: 1
    }
  )
);
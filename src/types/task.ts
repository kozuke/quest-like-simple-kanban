export type TaskStatus = 'backlog' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  status: TaskStatus;
  expClaimed?: boolean;
}

export interface TaskStore {
  tasks: Record<string, Task>;
  columnOrder: {
    backlog: string[];
    doing: string[];
    done: string[];
  };
  addTask: (title: string, description?: string, status?: TaskStatus) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  removeTask: (id: string) => void;
  moveTask: (taskId: string, destination: TaskStatus, index: number) => void;
  reorderColumn: (status: TaskStatus, newOrder: string[]) => void;
  copyTask: (id: string) => void;
  claimExp: (taskId: string) => void;
  claimAllExp: () => number;
}

export interface ReportTemplate {
  template: string;
  getDefaultTemplate: () => string;
  setTemplate: (template: string) => void;
  resetTemplate: () => void;
  saveTemplate: () => void;
  loadTemplate: () => void;
}
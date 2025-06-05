import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from '../../store/useTaskStore';

// 音声関数をモック
vi.mock('../../utils/audio', () => ({
  playAddTaskSound: vi.fn(),
  playMoveSound: vi.fn(),
  playFanfareSound: vi.fn(),
  playDeleteSound: vi.fn(),
}));

describe('useTaskStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    useTaskStore.setState({
      tasks: {},
      columnOrder: {
        backlog: [],
        doing: [],
        done: [],
      },
    });

    // localStorageをクリア
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('addTask', () => {
    it('should add a new task to backlog by default', () => {
      const store = useTaskStore.getState();
      
      store.addTask('新しいタスク', 'タスクの説明');
      
      const state = useTaskStore.getState();
      const taskIds = Object.keys(state.tasks);
      
      expect(taskIds).toHaveLength(1);
      expect(state.columnOrder.backlog).toHaveLength(1);
      expect(state.columnOrder.doing).toHaveLength(0);
      expect(state.columnOrder.done).toHaveLength(0);
      
      const taskId = taskIds[0];
      const task = state.tasks[taskId];
      
      expect(task.title).toBe('新しいタスク');
      expect(task.description).toBe('タスクの説明');
      expect(task.status).toBe('backlog');
      expect(task.id).toBe(taskId);
      expect(typeof task.createdAt).toBe('number');
    });

    it('should add task to specified status', () => {
      const store = useTaskStore.getState();
      
      store.addTask('進行中タスク', '説明', 'doing');
      
      const state = useTaskStore.getState();
      const taskIds = Object.keys(state.tasks);
      const task = state.tasks[taskIds[0]];
      
      expect(state.columnOrder.doing).toHaveLength(1);
      expect(state.columnOrder.backlog).toHaveLength(0);
      expect(task.status).toBe('doing');
    });

    it('should sanitize malicious input', () => {
      const store = useTaskStore.getState();
      
      store.addTask(
        '<script>alert("XSS")</script>安全なタイトル',
        'javascript:alert("XSS")安全な説明'
      );
      
      const state = useTaskStore.getState();
      const taskIds = Object.keys(state.tasks);
      const task = state.tasks[taskIds[0]];
      
      expect(task.title).not.toContain('<script>');
      expect(task.title).toContain('安全なタイトル');
      
      expect(task.description).not.toContain('javascript:');
      expect(task.description).toContain('安全な説明');
      // alertの文字列自体は残る可能性があるので、javascript:が除去されることを確認
      expect(task.description).toBe('alert("XSS")安全な説明');
    });

    it('should not add task with empty title', () => {
      const store = useTaskStore.getState();
      
      store.addTask('   '); // 空白のみ
      
      const state = useTaskStore.getState();
      expect(Object.keys(state.tasks)).toHaveLength(0);
      expect(state.columnOrder.backlog).toHaveLength(0);
    });

    it('should generate unique IDs for multiple tasks', () => {
      const store = useTaskStore.getState();
      
      store.addTask('タスク1');
      store.addTask('タスク2');
      store.addTask('タスク3');
      
      const state = useTaskStore.getState();
      const taskIds = Object.keys(state.tasks);
      
      expect(taskIds).toHaveLength(3);
      expect(new Set(taskIds).size).toBe(3); // すべてのIDがユニーク
      expect(state.columnOrder.backlog).toHaveLength(3);
    });
  });
}); 
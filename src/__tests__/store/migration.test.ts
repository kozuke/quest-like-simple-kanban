import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from '../../store/useTaskStore';

describe('Task Store Migration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should migrate legacy data correctly', () => {
    // Setup legacy data
    const legacyData = {
      tasks: {
        "task1": {
          id: "task1",
          title: "Test Task 1",
          description: "Description 1",
          createdAt: 1748873915983,
          status: "backlog"
        },
        "task2": {
          id: "task2",
          title: "Test Task 2",
          description: "",
          createdAt: 1748875119146,
          status: "doing"
        }
      },
      columnOrder: {
        backlog: ["task1"],
        doing: ["task2"],
        done: []
      }
    };

    // Set legacy data in localStorage
    localStorage.setItem('kanban-tasks', JSON.stringify(legacyData));

    // Initialize store (this should trigger migration)
    const store = useTaskStore.getState();

    // Verify migrated data
    expect(store.tasks).toEqual(legacyData.tasks);
    expect(store.columnOrder).toEqual(legacyData.columnOrder);
  });

  it('should handle empty legacy data', () => {
    // Initialize store without legacy data
    const store = useTaskStore.getState();

    // Verify default state
    expect(store.tasks).toEqual({});
    expect(store.columnOrder).toEqual({
      backlog: [],
      doing: [],
      done: []
    });
  });

  it('should handle invalid legacy data', () => {
    // Setup invalid legacy data
    const invalidData = {
      tasks: "invalid",
      columnOrder: "invalid"
    };

    localStorage.setItem('kanban-tasks', JSON.stringify(invalidData));

    // Initialize store
    const store = useTaskStore.getState();

    // Verify store initialized with default state
    expect(store.tasks).toEqual({});
    expect(store.columnOrder).toEqual({
      backlog: [],
      doing: [],
      done: []
    });
  });

  it('should migrate tasks with missing optional fields', () => {
    // Setup legacy data with minimal task data
    const legacyData = {
      tasks: {
        "task1": {
          id: "task1",
          title: "Minimal Task",
          createdAt: 1748873915983,
          status: "backlog"
        }
      },
      columnOrder: {
        backlog: ["task1"],
        doing: [],
        done: []
      }
    };

    localStorage.setItem('kanban-tasks', JSON.stringify(legacyData));

    // Initialize store
    const store = useTaskStore.getState();

    // Verify task was migrated with default values for optional fields
    expect(store.tasks.task1).toEqual({
      id: "task1",
      title: "Minimal Task",
      description: "",
      createdAt: 1748873915983,
      status: "backlog"
    });
  });

  it('should preserve task order during migration', () => {
    // Setup legacy data with specific task order
    const legacyData = {
      tasks: {
        "task1": { id: "task1", title: "First", createdAt: 1, status: "backlog" },
        "task2": { id: "task2", title: "Second", createdAt: 2, status: "backlog" },
        "task3": { id: "task3", title: "Third", createdAt: 3, status: "backlog" }
      },
      columnOrder: {
        backlog: ["task2", "task3", "task1"], // Specific order
        doing: [],
        done: []
      }
    };

    localStorage.setItem('kanban-tasks', JSON.stringify(legacyData));

    // Initialize store
    const store = useTaskStore.getState();

    // Verify order was preserved
    expect(store.columnOrder.backlog).toEqual(["task2", "task3", "task1"]);
  });
});
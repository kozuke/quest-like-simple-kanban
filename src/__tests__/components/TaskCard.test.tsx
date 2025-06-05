import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../../components/TaskCard';
import { Task } from '../../types/task';

// 音声関数をモック
vi.mock('../../utils/audio', () => ({
  playAddTaskSound: vi.fn(),
  playMoveSound: vi.fn(),
  playFanfareSound: vi.fn(),
  playDeleteSound: vi.fn(),
}));

// @dnd-kit/sortableをモック
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

const mockTask: Task = {
  id: 'test-task-1',
  title: 'テストタスク',
  description: 'これはテスト用のタスクです',
  status: 'backlog',
  createdAt: Date.now(),
};

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display task title and description', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(screen.getByText('これはテスト用のタスクです')).toBeInTheDocument();
  });

  it('should display task without description', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    render(<TaskCard task={taskWithoutDescription} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(screen.queryByText('これはテスト用のタスクです')).not.toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    // Pencilアイコンを持つボタンを特定
    const editButton = screen.getAllByRole('button')[0]; // 最初のボタン（編集ボタン）
    await user.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getAllByRole('button')[1]; // 2番目のボタン（削除ボタン）
    await user.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('should display task title properly', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const title = screen.getByText('テストタスク');
    expect(title).toHaveClass('font-pixel');
  });

  it('should handle task with empty title gracefully', () => {
    const emptyTask = { ...mockTask, title: '' };
    render(<TaskCard task={emptyTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    // エラーなしでレンダリングされることを確認（タスクカードコンテナが存在）
    const cardContainer = document.querySelector('.bg-white\\/95');
    expect(cardContainer).toBeInTheDocument();
  });
}); 
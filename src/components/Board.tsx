import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Column from './Column';
import TaskCard from './TaskCard';
import { useTaskStore } from '../store/useTaskStore';
import { Task, TaskStatus } from '../types/task';

interface BoardProps {
  openAddTaskModal: (status?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const Board: React.FC<BoardProps> = ({ openAddTaskModal, onEditTask, onDeleteTask }) => {
  const { tasks, columnOrder, moveTask, reorderColumn, copyTask } = useTaskStore();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    const task = tasks[activeId];
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // handleDragOverでは状態更新は行わず、視覚的なフィードバックのみを処理
    // 実際の状態更新はhandleDragEndで行う
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Ignore if dropping on the same task
    if (activeId === overId) return;
    
    const activeTask = tasks[activeId];
    if (!activeTask) return;
    
    // If over a task
    if (tasks[overId]) {
      const overTask = tasks[overId];
      const activeStatus = activeTask.status;
      const overStatus = overTask.status;
      
      // If tasks are in different columns
      if (activeStatus !== overStatus) {
        const overIndex = columnOrder[overStatus].indexOf(overId);
        if (overIndex !== -1) {
          moveTask(activeId, overStatus, overIndex);
        }
      } 
      // If tasks are in the same column
      else {
        const items = [...columnOrder[activeStatus]];
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newOrder = arrayMove(items, oldIndex, newIndex);
          reorderColumn(activeStatus, newOrder);
        }
      }
    } 
    // If over a column
    else if (['backlog', 'doing', 'done'].includes(overId)) {
      const overStatus = overId as TaskStatus;
      const activeStatus = activeTask.status;
      
      // Only if moving to a different column
      if (activeStatus !== overStatus) {
        const activeIndex = columnOrder[activeStatus].indexOf(activeId);
        
        if (activeIndex !== -1) {
          moveTask(activeId, overStatus, columnOrder[overStatus].length);
        }
      }
    }
  };

  // Create lists of tasks by status
  const backlogTasks = columnOrder.backlog.map(id => tasks[id]).filter(Boolean);
  const doingTasks = columnOrder.doing.map(id => tasks[id]).filter(Boolean);
  const doneTasks = columnOrder.done.map(id => tasks[id]).filter(Boolean);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Centered horizontal scrollable container */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-6 p-6 min-w-max h-full justify-center">
            <Column 
              title="クエスト" 
              emoji="🗺️" 
              status="backlog" 
              tasks={backlogTasks} 
              openAddTaskModal={openAddTaskModal}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onCopyTask={copyTask}
            />
            <Column 
              title="冒険中" 
              emoji="⚔️" 
              status="doing" 
              tasks={doingTasks} 
              openAddTaskModal={openAddTaskModal}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onCopyTask={copyTask}
            />
            <Column 
              title="クリア" 
              emoji="👑" 
              status="done" 
              tasks={doneTasks} 
              openAddTaskModal={openAddTaskModal}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onCopyTask={copyTask}
            />
          </div>
        </div>
      </div>
      
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onEdit={onEditTask} onDelete={onDeleteTask} onCopy={copyTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;
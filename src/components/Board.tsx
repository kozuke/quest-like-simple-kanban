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

const Board: React.FC = () => {
  const { tasks, columnOrder, moveTask, reorderColumn } = useTaskStore();
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
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Ignore if hovering over the same task
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
        const activeIndex = columnOrder[activeStatus].indexOf(activeId);
        const overIndex = columnOrder[overStatus].indexOf(overId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          // Remove from source column
          const newSourceColumn = [...columnOrder[activeStatus]];
          newSourceColumn.splice(activeIndex, 1);
          
          // Add to destination column
          const newDestColumn = [...columnOrder[overStatus]];
          newDestColumn.splice(overIndex, 0, activeId);
          
          // Update status of active task
          moveTask(activeId, overStatus, overIndex);
        }
      } 
      // If tasks are in the same column
      else {
        const items = [...columnOrder[activeStatus]];
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
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
          // Remove from source column
          const newSourceColumn = [...columnOrder[activeStatus]];
          newSourceColumn.splice(activeIndex, 1);
          
          // Add to end of destination column
          const newDestColumn = [...columnOrder[overStatus], activeId];
          
          moveTask(activeId, overStatus, newDestColumn.length - 1);
        }
      }
    }
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
    
    // If over a column
    if (['backlog', 'doing', 'done'].includes(overId)) {
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
      <div className="flex justify-center items-start min-h-full px-4 py-6">
        <div className="flex gap-6 max-w-7xl w-full justify-center">
          <Column 
            title="クエスト" 
            emoji="🗺️" 
            status="backlog" 
            tasks={backlogTasks} 
          />
          <Column 
            title="冒険中" 
            emoji="⚔️" 
            status="doing" 
            tasks={doingTasks} 
          />
          <Column 
            title="クリア" 
            emoji="👑" 
            status="done" 
            tasks={doneTasks} 
          />
        </div>
      </div>
      
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;
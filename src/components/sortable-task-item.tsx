
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './task-card';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface SortableTaskItemProps {
  id: string;
  task: Task;
  onSubtaskChange: (taskId: string, subtaskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskStart: (taskId: string) => void;
  onSubtaskStart: (taskId: string, subtaskId: string) => void;
  disabled?: boolean;
}

export function SortableTaskItem({ id, task, onSubtaskChange, onEdit, onTaskDelete, onTaskStart, onSubtaskStart, disabled }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <TaskCard
        task={task}
        onSubtaskChange={onSubtaskChange}
        onEdit={onEdit}
        onDelete={onTaskDelete}
        onTaskStart={onTaskStart}
        onSubtaskStart={onSubtaskStart}
        className={cn(isDragging && 'shadow-2xl opacity-80')}
        dragHandleProps={{...attributes, ...listeners}}
        isDraggable={!disabled}
      />
    </div>
  );
}

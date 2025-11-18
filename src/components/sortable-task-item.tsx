
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './task-card';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface SortableTaskItemProps {
  id: string;
  task: Task;
  onSubtaskChange: (taskId: string, subtaskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  disabled?: boolean;
}

export function SortableTaskItem({ id, task, onSubtaskChange, onEdit, disabled }: SortableTaskItemProps) {
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
        className={cn(isDragging && 'shadow-2xl opacity-80')}
      />
      {!disabled && (
        <button
            {...attributes}
            {...listeners}
            className="absolute top-4 right-14 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
        >
            <GripVertical className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

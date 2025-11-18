'use client';
import DashboardClient from '@/components/dashboard-client';
import { useDivisions } from '@/hooks/use-divisions';
import type { Task } from '@/types';

// These props are now passed from the layout
interface DashboardPageProps {
  tasks: Task[];
  onTaskCreate: (task: Omit<Task, 'id' | 'subtasks' | 'dependencies' | 'assignee' | 'priority' | 'priorityReason' | 'avatarUrl'> & { assignee: { name: string } }) => void;
  onTaskUpdate: (updatedTask: Task) => void;
  onSubtaskChange: (taskId: string, subtaskId: string, completed: boolean) => void;
}

export default function DashboardPage({ tasks, onTaskCreate, onTaskUpdate, onSubtaskChange }: DashboardPageProps) {
  const { divisions } = useDivisions();

  return (
    <DashboardClient 
      tasks={tasks} 
      divisions={divisions}
      onTaskCreate={onTaskCreate}
      onTaskUpdate={onTaskUpdate}
      onSubtaskChange={onSubtaskChange}
    />
  );
}

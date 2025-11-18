'use client';
import DashboardClient from '@/components/dashboard-client';
import { use } from 'react';
import type { Task } from '@/types';
import { useDivisions } from '@/hooks/use-divisions';

// These props are now passed from the layout
interface DivisionDashboardPageProps {
  params: { division: string };
  tasks: Task[];
  onTaskCreate: (task: Omit<Task, 'id' | 'subtasks' | 'dependencies' | 'assignee' | 'priority' | 'priorityReason' | 'avatarUrl'> & { assignee: { name: string } }) => void;
  onTaskUpdate: (updatedTask: Task) => void;
  onSubtaskChange: (taskId: string, subtaskId: string, completed: boolean) => void;
}


export default function DivisionDashboardPage({ params, tasks, onTaskCreate, onTaskUpdate, onSubtaskChange }: DivisionDashboardPageProps) {
    const { divisions } = useDivisions();
    const resolvedParams = use(Promise.resolve(params));
  
    const decodedDivision = decodeURIComponent(resolvedParams.division);
    const divisionExists = divisions.map(d => d.toLowerCase()).includes(decodedDivision);

    const getDivisionDisplayName = (slug: string) => {
        return divisions.find(d => d.toLowerCase() === slug) || slug;
    }
    
    // In a real app, you'd fetch this dynamically and could have a proper 404
    if (!divisionExists) {
        // We could show notFound(), but for a better UX with newly added divisions,
        // we'll just show an empty task list.
    }
    
    const divisionDisplayName = getDivisionDisplayName(decodedDivision);

    return (
        <DashboardClient 
            tasks={tasks}
            divisions={divisions}
            selectedDivision={divisionDisplayName}
            onTaskCreate={onTaskCreate}
            onTaskUpdate={onTaskUpdate}
            onSubtaskChange={onSubtaskChange}
        />
    );
}

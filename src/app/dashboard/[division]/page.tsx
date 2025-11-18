'use client';
import DashboardClient from '@/components/dashboard-client';
import { initialTasks } from '@/lib/data';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import type { Task } from '@/types';
import { useDivisions } from '@/hooks/use-divisions';

export default function DivisionDashboardPage({ params }: { params: { division: string } }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const { divisions } = useDivisions();
  
    const decodedDivision = decodeURIComponent(params.division);
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
            initialTasks={tasks} 
            divisions={divisions}
            selectedDivision={divisionDisplayName}
        />
    );
}

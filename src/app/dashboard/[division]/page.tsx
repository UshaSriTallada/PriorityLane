'use client';
import DashboardClient from '@/components/dashboard-client';
import { initialTasks } from '@/lib/data';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import type { Task } from '@/types';

export default function DivisionDashboardPage({ params }: { params: { division: string } }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const initialDivisions: Task['division'][] = Array.from(new Set(initialTasks.map(task => task.division)));
    const [divisions, setDivisions] = useState<Task['division'][]>(initialDivisions);
  
    const decodedDivision = decodeURIComponent(params.division);
    const divisionExists = initialDivisions.map(d => d.toLowerCase()).includes(decodedDivision);

    const getDivisionDisplayName = (slug: string) => {
        return initialDivisions.find(d => d.toLowerCase() === slug) || slug;
    }
    
    // In a real app, you'd fetch this dynamically and could have a proper 404
    if (!divisionExists) {
        // For newly added divisions, we can just show an empty task list
        // notFound(); 
    }

    const handleDivisionCreate = (name: string) => {
        if (!divisions.find(d => d.toLowerCase() === name.toLowerCase())) {
            setDivisions(prev => [...prev, name as Task['division']]);
        }
    };
    
    const divisionDisplayName = getDivisionDisplayName(decodedDivision);

    return (
        <DashboardClient 
            initialTasks={tasks} 
            divisions={divisions}
            onDivisionCreate={handleDivisionCreate}
            selectedDivision={divisionDisplayName}
        />
    );
}

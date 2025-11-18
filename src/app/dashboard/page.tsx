'use client';
import DashboardClient from '@/components/dashboard-client';
import { initialTasks } from '@/lib/data';
import { useState } from 'react';
import type { Task } from '@/types';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const initialDivisions: Task['division'][] = Array.from(new Set(initialTasks.map(task => task.division)));
  const [divisions, setDivisions] = useState<Task['division'][]>(initialDivisions);

  const handleDivisionCreate = (name: string) => {
     if (!divisions.find(d => d.toLowerCase() === name.toLowerCase())) {
        setDivisions(prev => [...prev, name as Task['division']]);
    }
  };

  return (
    <DashboardClient 
      initialTasks={tasks} 
      divisions={divisions}
      onDivisionCreate={handleDivisionCreate}
    />
  );
}

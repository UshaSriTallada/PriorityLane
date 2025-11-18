'use client';
import DashboardClient from '@/components/dashboard-client';
import { initialTasks } from '@/lib/data';
import { useState } from 'react';
import type { Task } from '@/types';
import { useDivisions } from '@/hooks/use-divisions';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { divisions } = useDivisions();

  return (
    <DashboardClient 
      initialTasks={tasks} 
      divisions={divisions}
    />
  );
}

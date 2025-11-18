import DashboardClient from '@/components/dashboard-client';
import { initialTasks } from '@/lib/data';

export default function DashboardPage() {
  // In a real app, you'd fetch this data from a database.
  const tasks = initialTasks;

  return (
    <DashboardClient initialTasks={tasks} />
  );
}

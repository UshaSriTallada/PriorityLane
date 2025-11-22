'use client';
import DashboardClient from '@/components/dashboard-client';

export default function DoneTasksPage() {
  return (
    <DashboardClient filter="completed" />
  );
}

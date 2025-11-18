'use client';
import MainNav from '@/components/main-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Factory } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { Task } from '@/types';
import { initialTasks } from '@/lib/data';

const initialDivisions = Array.from(new Set(initialTasks.map(task => task.division)));

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [divisions, setDivisions] = useState<Task['division'][]>(initialDivisions);
  
  const handleAddDivision = (name: string) => {
    // This is a simple client-side update. In a real app, this would
    // likely involve an API call to persist the new division.
    if (!divisions.find(d => d.toLowerCase() === name.toLowerCase())) {
        setDivisions(prev => [...prev, name as Task['division']]);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-16 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Factory className="h-6 w-6 text-primary" />
              <span className="group-data-[collapsible=icon]:hidden">FactoryFlow</span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <MainNav divisions={divisions} onDivisionCreate={handleAddDivision} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

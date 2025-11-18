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
import { useState, useCallback } from 'react';
import type { Task } from '@/types';
import { initialTasks } from '@/lib/data';
import { DivisionProvider } from '@/hooks/use-divisions';
import { useRouter } from 'next/navigation';

const initialDivisions = Array.from(new Set(initialTasks.map(task => task.division)));

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [divisions, setDivisions] = useState<Task['division'][]>(initialDivisions);
  const router = useRouter();
  
  const handleAddDivision = useCallback((name: string) => {
    if (!divisions.find(d => d.toLowerCase() === name.toLowerCase())) {
        setDivisions(prev => [...prev, name as Task['division']]);
    }
  }, [divisions]);

  const handleUpdateDivision = useCallback((oldName: string, newName: string) => {
    setDivisions(prev => prev.map(d => (d === oldName ? (newName as Task['division']) : d)));
    // In a real app, you'd also need to update all tasks under this division.
    // For now, we'll redirect to the new division page.
    router.push(`/dashboard/${newName.toLowerCase()}`);
  }, [router]);

  const handleDeleteDivision = useCallback((name: string) => {
    setDivisions(prev => prev.filter(d => d !== name));
     // In a real app, you might want to reassign or delete tasks under this division.
    router.push('/dashboard');
  }, [router]);

  return (
    <DivisionProvider 
      divisions={divisions} 
      onDivisionCreate={handleAddDivision}
      onDivisionUpdate={handleUpdateDivision}
      onDivisionDelete={handleDeleteDivision}
    >
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
            <MainNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DivisionProvider>
  );
}

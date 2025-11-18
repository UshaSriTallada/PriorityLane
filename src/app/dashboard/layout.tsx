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
import { useState, useCallback, ReactNode, cloneElement, Children } from 'react';
import type { Task } from '@/types';
import { initialTasks } from '@/lib/data';
import { DivisionProvider, useDivisions } from '@/hooks/use-divisions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React from 'react';


const initialDivisions = Array.from(new Set(initialTasks.map(task => task.division)));

interface StateManagerProps {
    children: ReactNode;
}

// This component will manage the state and pass it down
function StateManager({ children }: StateManagerProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [divisions, setDivisions] = useState<Task['division'][]>(initialDivisions);
    const router = useRouter();
    const { toast } = useToast();

    const handleAddTask = (newTask: Task) => {
        setTasks(prev => [newTask, ...prev]);
        toast({
            title: "Task Created",
            description: `"${newTask.name}" has been added to your list.`,
        });
    };

    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        toast({
            title: "Task Updated",
            description: `"${updatedTask.name}" has been successfully updated.`,
        });
    };

    const handleSubtaskChange = (taskId: string, subtaskId: string, completed: boolean) => {
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    subtasks: task.subtasks.map(sub => 
                        sub.id === subtaskId ? { ...sub, completed } : sub
                    )
                };
            }
            return task;
        }));
    };
    
    const handleAddDivision = useCallback((name: string) => {
        if (!divisions.find(d => d.toLowerCase() === name.toLowerCase())) {
            setDivisions(prev => [...prev, name as Task['division']]);
        }
    }, [divisions]);

    const handleUpdateDivision = useCallback((oldName: string, newName: string) => {
        setDivisions(prev => prev.map(d => (d === oldName ? (newName as Task['division']) : d)));
        
        setTasks(prevTasks => prevTasks.map(task => {
            if (task.division === oldName) {
                return { ...task, division: newName as Task['division'] };
            }
            return task;
        }));
        
        router.push(`/dashboard/${newName.toLowerCase()}`);
    }, [router]);

    const handleDeleteDivision = useCallback((name: string) => {
        setDivisions(prev => prev.filter(d => d !== name));
        router.push('/dashboard');
    }, [router]);

    const childrenWithProps = Children.map(children, child => {
        if (React.isValidElement(child) && (child.type.name === 'DashboardPage' || child.type.name === 'DivisionDashboardPage')) {
            return cloneElement(child, { 
                tasks,
                onTaskCreate: handleAddTask,
                onTaskUpdate: handleUpdateTask,
                onSubtaskChange: handleSubtaskChange
             } as any);
        }
        return child;
    });

    return (
        <DivisionProvider 
            divisions={divisions} 
            onDivisionCreate={handleAddDivision}
            onDivisionUpdate={handleUpdateDivision}
            onDivisionDelete={handleDeleteDivision}
        >
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
                {childrenWithProps}
            </SidebarInset>
        </DivisionProvider>
    );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <StateManager>
                {children}
            </StateManager>
        </SidebarProvider>
    );
}

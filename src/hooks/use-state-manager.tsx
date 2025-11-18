'use client';
import { createContext, useContext, ReactNode, useState, useCallback } from "react";
import type { Task } from "@/types";
import { initialTasks } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { arrayMove } from "@dnd-kit/sortable";

const initialDivisions = Array.from(new Set(initialTasks.map(task => task.division)));

interface StateContextType {
    tasks: Task[];
    divisions: Task['division'][];
    onTaskCreate: (newTask: Task) => void;
    onTaskUpdate: (updatedTask: Task) => void;
    onSubtaskChange: (taskId: string, subtaskId: string, completed: boolean) => void;
    onDivisionCreate: (name: string) => void;
    onDivisionUpdate: (oldName: string, newName: string) => void;
    onDivisionDelete: (name: string) => void;
    onTasksReorder: (activeId: string, overId: string) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
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
        setTasks(prevTasks => prevTasks.filter(task => task.division !== name));
        router.push('/dashboard');
    }, [router]);

    const handleTasksReorder = (activeId: string, overId: string) => {
        setTasks((items) => {
          const oldIndex = items.findIndex((item) => item.id === activeId);
          const newIndex = items.findIndex((item) => item.id === overId);
          return arrayMove(items, oldIndex, newIndex);
        });
      };

    const value = {
        tasks,
        divisions,
        onTaskCreate: handleAddTask,
        onTaskUpdate: handleUpdateTask,
        onSubtaskChange: handleSubtaskChange,
        onDivisionCreate: handleAddDivision,
        onDivisionUpdate: handleUpdateDivision,
        onDivisionDelete: handleDeleteDivision,
        onTasksReorder: handleTasksReorder
    };

    return (
        <StateContext.Provider value={value}>
            {children}
        </StateContext.Provider>
    );
}

export function useStateManager() {
    const context = useContext(StateContext);
    if (context === undefined) {
        throw new Error('useStateManager must be used within a StateProvider');
    }
    return context;
}


'use client';
import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from "react";
import type { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { arrayMove } from "@dnd-kit/sortable";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useUser } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, doc, writeBatch, where, query, deleteField, FieldValue, Query, DocumentData } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useMemoFirebase } from "./use-memo-firebase";


interface StateContextType {
    tasks: Task[];
    divisions: Task['division'][];
    onTaskCreate: (newTask: Omit<Task, 'id' | 'subtasks' | 'dependencies' | 'owner' | 'priority' | 'priorityReason' | 'startedAt' | 'createdAt' | 'userId'>) => void;
    onTaskUpdate: (updatedTask: Task) => void;
    onTaskDelete: (taskId: string) => void;
    onSubtaskChange: (taskId: string, subtaskId: string, completed: boolean) => void;
    onTaskStart: (taskId: string) => void;
    onSubtaskStart: (taskId: string, subtaskId: string) => void;
    onDivisionCreate: (name: string) => void;
    onDivisionUpdate: (oldName: string, newName: string) => void;
    onDivisionDelete: (name: string) => void;
    onTasksReorder: (activeId: string, overId: string) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

// Recursively clean an object to remove 'undefined' fields, replacing them with deleteField() for Firestore.
function cleanForFirestore(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(item => cleanForFirestore(item));
    }
    if (obj !== null && typeof obj === 'object') {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (value === undefined) {
                    newObj[key] = deleteField();
                } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    newObj[key] = cleanForFirestore(value);
                }
                else {
                    newObj[key] = value;
                }
            }
        }
        return newObj;
    }
    return obj;
}

export function StateProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    // Firestore data hooks
    const tasksPath = 'tasks';
    const tasksQuery = useMemoFirebase(() => 
        user ? query(collection(firestore, tasksPath), where('userId', '==', user.uid)) as Query<Task> : null,
        [user, firestore]
    );

    const { data: tasks = [], loading: tasksLoading, add: addTask, update: updateTask, remove: removeTask, reorder: reorderTasks } = useCollection<Task>(
      user ? tasksPath : null,
      tasksQuery, 
      {
        orderBy: 'order',
        listen: true,
      }
    );
    
    type DivisionDoc = { name: string; id: string };
    const divisionsPath = user ? `users/${user.uid}/divisions` : null;
    const divisionsQuery = useMemoFirebase(() => 
        divisionsPath ? query(collection(firestore, divisionsPath)) as Query<DivisionDoc> : null,
        [divisionsPath, firestore]
    );

    const { data: divisionsData = [], add: addDivisionDoc, remove: removeDivisionDoc } = useCollection<DivisionDoc>(
        divisionsPath,
        divisionsQuery
    );
    
    const divisions = divisionsData.map(d => d.name as Task['division']);

    const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'subtasks' | 'dependencies' | 'owner' | 'priority' | 'priorityReason'| 'startedAt' | 'createdAt' | 'userId'>) => {
        if (!user) return;
        const newOwner = {
            name: user.displayName || user.email || 'Anonymous',
            avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/32/32`,
        };
        const newTask: Omit<Task, 'id'> = {
            ...newTaskData,
            userId: user.uid,
            subtasks: [],
            dependencies: [],
            owner: newOwner,
            createdAt: new Date().toISOString(),
            order: tasks.length
        };
        await addTask(newTask);
        toast({
            title: "Task Created",
            description: `"${newTask.name}" has been added to your list.`,
        });
    };

    const handleUpdateTask = async (updatedTask: Task) => {
        // Deep clean the object for Firestore, removing 'undefined' values recursively
        const updateData = cleanForFirestore({ ...updatedTask });
        
        // Remove id from the update data as it's the document key
        delete updateData.id;

        await updateTask(updatedTask.id, updateData);
        toast({
            title: "Task Updated",
            description: `"${updatedTask.name}" has been successfully updated.`,
        });
    };

    const handleTaskDelete = async (taskId: string) => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        if (taskToDelete) {
            await removeTask(taskId);
            toast({
                title: "Task Deleted",
                description: `"${taskToDelete.name}" has been removed.`,
            });
        }
    };

    const handleSubtaskChange = async (taskId: string, subtaskId: string, completed: boolean) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedSubtasks = task.subtasks.map(sub => {
            if (sub.id === subtaskId) {
                return { 
                    ...sub, 
                    completed,
                    completedAt: completed ? new Date().toISOString() : undefined,
                 };
            }
            return sub;
        });

        const allSubtasksCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
        
        const updateData: {subtasks: any[], doneAt?: any} = { subtasks: updatedSubtasks };

        if (allSubtasksCompleted && !task.doneAt) {
            updateData.doneAt = new Date().toISOString();
             toast({
                title: "Task Completed!",
                description: `"${task.name}" is now finished.`,
            });
        } else if (!allSubtasksCompleted && task.doneAt) {
            updateData.doneAt = deleteField();
        }

        await updateTask(taskId, cleanForFirestore(updateData));
    };
    
    const handleTaskStart = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && !task.startedAt) {
            await updateTask(taskId, { startedAt: new Date().toISOString() });
            toast({
                title: "Task Started",
                description: `"${task.name}" has been marked as started.`,
            });
        }
    };

    const handleSubtaskStart = async (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const updatedSubtasks = task.subtasks.map(sub => {
            if (sub.id === subtaskId && !sub.startedAt) {
                toast({
                    title: "Subtask Started",
                    description: `Subtask "${sub.name}" has been started.`,
                });
                return { ...sub, startedAt: new Date().toISOString() };
            }
            return sub;
        });
        await updateTask(taskId, { subtasks: updatedSubtasks });
    };
    
    const handleAddDivision = useCallback(async (name: string) => {
        if (!user) return;
        if (!divisions.find(d => d.toLowerCase() === name.toLowerCase())) {
            await addDivisionDoc({ name } as DivisionDoc);
        }
    }, [user, divisions, addDivisionDoc]);

    const handleUpdateDivision = useCallback(async (oldName: string, newName: string) => {
        if (!user) return;
        const batch = writeBatch(firestore);
        
        // Update division document
        const divisionDoc = divisionsData.find(d => d.name === oldName);
        if (divisionDoc) {
            const divisionRef = doc(firestore, 'users', user.uid, 'divisions', divisionDoc.id);
            batch.update(divisionRef, { name: newName });
        }

        // Update tasks with the old division name
        tasks.forEach(task => {
            if (task.division === oldName) {
                const taskRef = doc(firestore, 'tasks', task.id);
                batch.update(taskRef, { division: newName });
            }
        });
        
        batch.commit()
            .then(() => {
                router.push(`/dashboard/${newName.toLowerCase()}`);
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: `users/${user.uid}/divisions` ,
                    operation: 'update',
                    requestResourceData: { info: "Batch update for division rename" }
                }, serverError);
                errorEmitter.emit('permission-error', permissionError);
            });
    }, [user, firestore, divisionsData, tasks, router]);


    const handleDeleteDivision = useCallback(async (name: string) => {
        if (!user) return;
        const batch = writeBatch(firestore);

        // Delete tasks in that division
        const tasksToDelete = tasks.filter(task => task.division === name);
        tasksToDelete.forEach(task => {
            const taskRef = doc(firestore, 'tasks', task.id);
            batch.delete(taskRef);
        });

        // Delete the division document
        const divisionDoc = divisionsData.find(d => d.name === name);
        if (divisionDoc) {
            const divisionRef = doc(firestore, 'users', user.uid, 'divisions', divisionDoc.id);
            batch.delete(divisionRef);
        }

        batch.commit()
            .then(() => {
                 router.push('/dashboard');
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: `users/${user.uid}/divisions`,
                    operation: 'delete',
                    requestResourceData: { info: "Batch delete for division" }
                }, serverError);
                errorEmitter.emit('permission-error', permissionError);
            });
    }, [user, firestore, tasks, divisionsData, router]);

    const handleTasksReorder = async (activeId: string, overId: string) => {
        const oldIndex = tasks.findIndex((item) => item.id === activeId);
        const newIndex = tasks.findIndex((item) => item.id === overId);
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        
        // Update order property
        const tasksToUpdate = newTasks.map((task, index) => ({ ...task, order: index }));

        await reorderTasks(tasksToUpdate);
    };

    const value = {
        tasks,
        divisions,
        onTaskCreate: handleAddTask,
        onTaskUpdate: handleUpdateTask,
        onTaskDelete: handleTaskDelete,
        onSubtaskChange: handleSubtaskChange,
        onTaskStart: handleTaskStart,
        onSubtaskStart: handleSubtaskStart,
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

    
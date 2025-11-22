
"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NewTaskDialog } from "@/components/new-task-dialog";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { getTaskPriorities } from "@/app/actions";
import type { Task } from "@/types";
import { useStateManager } from "@/hooks/use-state-manager";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTaskItem } from './sortable-task-item';
import { Separator } from "./ui/separator";
import { useUser } from "@/firebase";

interface DashboardClientProps {
  selectedDivision?: string;
  filter?: 'all' | 'active' | 'completed';
}

export default function DashboardClient({ selectedDivision, filter = 'active' }: DashboardClientProps) {
  const { tasks, onTaskCreate, onTaskUpdate, onSubtaskChange, onTasksReorder, onTaskStart, onSubtaskStart } = useStateManager();
  const { user } = useUser();
  const [currentTasks, setCurrentTasks] = useState<Task[]>(tasks);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Keep the state in sync with context
  useEffect(() => {
    setCurrentTasks(tasks);
  }, [tasks]);

  const { visibleTasks, pageTitle, pageDescription } = useMemo(() => {
    // 1. Filter by division if one is selected
    let tasksByDivision = selectedDivision
      ? currentTasks.filter(task => task.division === selectedDivision)
      : currentTasks;

    // 2. Apply AI prioritization if available
    const priorityMap = new Map(currentTasks.map(t => [t.id, { p: t.priority, pr: t.priorityReason }]));
    tasksByDivision = tasksByDivision.map(t => {
      const p = priorityMap.get(t.id);
      return { ...t, priority: p?.p, priorityReason: p?.pr };
    }).sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity));

    // 3. Filter by status (active/completed/all)
    let visibleTasks: Task[];
    let pageTitle = "";
    let pageDescription = "";

    switch (filter) {
      case 'completed':
        visibleTasks = tasksByDivision.filter(t => !!t.doneAt);
        pageTitle = selectedDivision ? `${selectedDivision} Completed Tasks` : "Completed Tasks";
        pageDescription = `All completed tasks${selectedDivision ? ` for the ${selectedDivision} division` : ''}.`;
        break;
      case 'all':
        visibleTasks = tasksByDivision;
        pageTitle = selectedDivision ? `${selectedDivision} Tasks` : "All Tasks";
        pageDescription = `All active and completed tasks${selectedDivision ? ` for the ${selectedDivision} division` : ''}.`;
        break;
      case 'active':
      default:
        visibleTasks = tasksByDivision.filter(t => !t.doneAt);
        pageTitle = selectedDivision ? `${selectedDivision} Active Tasks` : "Active Tasks";
        pageDescription = `All active tasks${selectedDivision ? ` for the ${selectedDivision} division` : ''}.`;
        break;
    }
    
    return { visibleTasks, pageTitle, pageDescription };

  }, [selectedDivision, currentTasks, filter]);

  const handlePrioritize = () => {
    if (!tasks) return;
    startTransition(async () => {
      // Prioritize only active tasks
      const activeTasks = tasks.filter(t => !t.doneAt);
      const result = await getTaskPriorities(activeTasks);

      if (result.success && result.data) {
        const priorityMap = new Map(result.data.map(p => [p.taskId, { priority: p.priority, reason: p.reason }]));
        
        const updatedTasks = tasks.map(task => {
          const priorityInfo = priorityMap.get(task.id);
          // Only apply priority to active tasks that were part of the AI call
          return (priorityInfo && !task.doneAt) ? { ...task, priority: priorityInfo.priority, priorityReason: priorityInfo.reason } : { ...task, priority: undefined, priorityReason: undefined };
        });

        // The sort is now handled in the useMemo hook
        setCurrentTasks(updatedTasks);

        toast({
          title: "Tasks Prioritized!",
          description: "AI has re-ordered your active tasks based on urgency and impact.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Prioritization Failed",
          description: result.error || "An unknown error occurred.",
        });
      }
    });
  };

  const handleTaskCreate = (newTaskData: Omit<Task, 'id' | 'subtasks' | 'dependencies' | 'priority' | 'priorityReason'| 'owner' | 'startedAt' | 'createdAt'>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a task.' });
      return;
    }

    const newOwner = {
        name: user.displayName || user.email || 'Anonymous',
        avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/32/32`,
    };

    const newTask: Task = {
        ...newTaskData,
        id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
        subtasks: [],
        dependencies: [],
        owner: newOwner,
        createdAt: new Date().toISOString()
    };
    onTaskCreate(newTask);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    onTaskUpdate(updatedTask);
    setEditingTask(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      onTasksReorder(active.id as string, over.id as string);
    }
  }
  
  // Disable drag-and-drop if a division is selected or showing completed tasks
  const isDndDisabled = !!selectedDivision || filter === 'completed';

  return (
    <>
      <main className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
              <p className="text-muted-foreground">{pageDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrioritize} disabled={isPending || filter === 'completed'}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 text-accent" />
              )}
              Prioritize with AI
            </Button>
            <NewTaskDialog onTaskCreate={handleTaskCreate} />
          </div>
        </div>

        {visibleTasks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            disabled={isDndDisabled}
          >
            <SortableContext items={visibleTasks} strategy={verticalListSortingStrategy}>
               <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {visibleTasks.map((task) => (
                      <SortableTaskItem key={task.id} id={task.id} task={task} onSubtaskChange={onSubtaskChange} onEdit={() => setEditingTask(task)} onTaskStart={onTaskStart} onSubtaskStart={onSubtaskStart} disabled={isDndDisabled} />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
              <h3 className="text-xl font-semibold">No tasks found</h3>
              <p className="text-muted-foreground mt-2">There are no tasks that match the current filters.</p>
          </div>
        )}
      </main>
      {editingTask && (
        <EditTaskDialog
            task={editingTask}
            onTaskUpdate={handleTaskUpdate}
            onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </>
  );
}

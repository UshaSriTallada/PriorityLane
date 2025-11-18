
"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { NewTaskDialog } from "@/components/new-task-dialog";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { getTaskPriorities } from "@/app/actions";
import type { Task } from "@/types";
import { isPast } from 'date-fns';
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

interface DashboardClientProps {
  selectedDivision?: string;
}

export default function DashboardClient({ selectedDivision }: DashboardClientProps) {
  const { tasks, onTaskCreate, onTaskUpdate, onSubtaskChange, onTasksReorder } = useStateManager();
  const [currentTasks, setCurrentTasks] = useState<Task[]>(tasks);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Keep the state in sync with context
  useEffect(() => {
    setCurrentTasks(tasks);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const tasksToFilter = selectedDivision
      ? currentTasks.filter(task => task.division === selectedDivision)
      : currentTasks;
    
    // Create a stable priority map
    const priorityMap = new Map(currentTasks.map(t => [t.id, { p: t.priority, pr: t.priorityReason }]));
    
    return tasksToFilter.map(t => {
      const p = priorityMap.get(t.id);
      return { ...t, priority: p?.p, priorityReason: p?.pr };
    }).sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity));
    
  }, [selectedDivision, currentTasks]);

  const overdueCount = useMemo(() => {
    return filteredTasks.reduce((count, task) => {
        const isTaskOverdue = !task.subtasks.every(st => st.completed) && isPast(new Date(task.deadline));
        if (isTaskOverdue) {
            return count + 1;
        }
        return count;
    }, 0);
  }, [filteredTasks]);

  const handlePrioritize = () => {
    if (!tasks) return;
    startTransition(async () => {
      const result = await getTaskPriorities(tasks);
      if (result.success && result.data) {
        const priorityMap = new Map(result.data.map(p => [p.taskId, { priority: p.priority, reason: p.reason }]));
        
        const updatedTasks = tasks.map(task => {
          const priorityInfo = priorityMap.get(task.id);
          return priorityInfo ? { ...task, priority: priorityInfo.priority, priorityReason: priorityInfo.reason } : { ...task, priority: undefined, priorityReason: undefined };
        });

        updatedTasks.sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity));
        
        setCurrentTasks(updatedTasks);

        toast({
          title: "Tasks Prioritized!",
          description: "AI has re-ordered your tasks based on urgency and impact.",
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

  const handleTaskCreate = (newTaskData: Omit<Task, 'id' | 'subtasks' | 'dependencies' | 'priority' | 'priorityReason'>) => {
    const newTask: Task = {
        ...newTaskData,
        id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
        subtasks: [],
        dependencies: [],
        owner: {
            ...newTaskData.owner,
            avatarUrl: `https://picsum.photos/seed/${Math.random()}/32/32`,
        }
    };
    onTaskCreate(newTask);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    onTaskUpdate(updatedTask);
    setEditingTask(null);
  };

  const pageTitle = selectedDivision ? `${selectedDivision} Tasks` : "Task Dashboard";
  const pageDescription = selectedDivision ? `Tasks for the ${selectedDivision} division.` : "Manage and prioritize your factory's workload.";

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
  
  // Disable drag-and-drop if a division is selected
  const isDndDisabled = !!selectedDivision;


  return (
    <>
      <div className="flex h-screen flex-col">
        <Header overdueCount={overdueCount} />
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
                  <p className="text-muted-foreground">{pageDescription}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handlePrioritize} disabled={isPending}>
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

            {filteredTasks.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                disabled={isDndDisabled}
              >
                <SortableContext items={filteredTasks} strategy={verticalListSortingStrategy}>
                   <div className="grid items-start gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {filteredTasks.map((task) => (
                          <SortableTaskItem key={task.id} id={task.id} task={task} onSubtaskChange={onSubtaskChange} onEdit={() => setEditingTask(task)} disabled={isDndDisabled} />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                  <h3 className="text-xl font-semibold">No tasks yet</h3>
                  <p className="text-muted-foreground mt-2">{selectedDivision ? `No tasks found for the ${selectedDivision} division.` : "Create your first task to get started."}</p>
              </div>
            )}
          </main>
        </div>
      </div>
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

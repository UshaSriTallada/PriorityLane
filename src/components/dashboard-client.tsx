"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { TaskCard } from "@/components/task-card";
import { NewTaskDialog } from "@/components/new-task-dialog";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { getTaskPriorities } from "@/app/actions";
import type { Task, Subtask } from "@/types";
import { isPast } from 'date-fns';

interface DashboardClientProps {
  initialTasks: Task[];
  divisions: Task['division'][];
  selectedDivision?: string;
}

export default function DashboardClient({ initialTasks, divisions, selectedDivision }: DashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    if (!selectedDivision) return tasks;
    return tasks.filter(task => task.division === selectedDivision);
  }, [tasks, selectedDivision]);

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
    startTransition(async () => {
      const result = await getTaskPriorities(tasks);
      if (result.success && result.data) {
        const priorityMap = new Map(result.data.map(p => [p.taskId, { priority: p.priority, reason: p.reason }]));
        
        const updatedTasks = tasks.map(task => {
          const priorityInfo = priorityMap.get(task.id);
          return priorityInfo ? { ...task, priority: priorityInfo.priority, priorityReason: priorityInfo.reason } : { ...task, priority: undefined, priorityReason: undefined };
        });

        updatedTasks.sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity));
        
        setTasks(updatedTasks);

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

  const handleTaskCreate = (newTaskData: Omit<Task, 'id' | 'subtasks' | 'dependencies' | 'assignee' | 'priority' | 'priorityReason' | 'avatarUrl'> & { assignee: { name: string } }) => {
    const newTask: Task = {
        ...newTaskData,
        id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
        subtasks: [],
        dependencies: [],
        assignee: {
            ...newTaskData.assignee,
            avatarUrl: `https://picsum.photos/seed/${Math.random()}/32/32`,
        }
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    toast({
        title: "Task Created",
        description: `"${newTask.name}" has been added to your list.`,
    });
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setEditingTask(null);
    toast({
        title: "Task Updated",
        description: `"${updatedTask.name}" has been successfully updated.`,
    });
  };

  const handleSubtaskChange = (taskId: string, subtaskId: string, completed: boolean) => {
    setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                subtasks: task.subtasks.map(subtask => 
                    subtask.id === subtaskId ? { ...subtask, completed } : subtask
                )
            };
        }
        return task;
    }));
  };

  const pageTitle = selectedDivision ? `${selectedDivision} Tasks` : "Task Dashboard";
  const pageDescription = selectedDivision ? `Tasks for the ${selectedDivision} division.` : "Manage and prioritize your factory's workload.";

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
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onSubtaskChange={handleSubtaskChange} onEdit={() => setEditingTask(task)} />
                  ))}
              </div>
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

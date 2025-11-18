
'use server';

import { prioritizeTasks, PrioritizeTasksInput } from '@/ai/flows/prioritize-tasks';
import { Task } from '@/types';
import { z } from 'zod';

// Define a schema for the action's output to ensure type safety
const PrioritizationResultSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    taskId: z.string(),
    priority: z.number(),
    reason: z.string(),
  })).optional(),
  error: z.string().optional(),
});

type PrioritizationResult = z.infer<typeof PrioritizationResultSchema>;

export async function getTaskPriorities(tasks: Task[]): Promise<PrioritizationResult> {
  // Map the Task[] to the PrioritizeTasksInput schema
  const aiInput: PrioritizeTasksInput = {
    tasks: tasks.map(task => ({
      taskId: task.id,
      name: task.name,
      description: task.description,
      deadline: task.deadline,
      dependencies: task.dependencies,
      division: task.division,
      impact: task.impact,
      subtasks: task.subtasks.map(subtask => ({
        subtaskId: subtask.id,
        name: subtask.name,
        description: subtask.description,
        deadline: subtask.deadline,
      })),
    })),
  };

  try {
    const prioritizedTasks = await prioritizeTasks(aiInput);
    
    // Sort results to ensure a consistent order if the AI doesn't
    prioritizedTasks.sort((a, b) => a.priority - b.priority);

    return { success: true, data: prioritizedTasks };
  } catch (error) {
    console.error("AI prioritization failed:", error);
    return { success: false, error: "Failed to get prioritization from AI. Please try again." };
  }
}

'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligent task prioritization.
 *
 * The flow analyzes tasks and subtasks, recommending a prioritization based on deadlines,
 * dependencies, and impact on factory operations.
 *
 * @module src/ai/flows/prioritize-tasks
 *
 * @interface PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * @interface PrioritizeTasksOutput - The output type for the prioritizeTasks function.
 * @function prioritizeTasks - The function that orchestrates the task prioritization process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      taskId: z.string().describe('Unique identifier for the task.'),
      name: z.string().describe('Name of the task.'),
      description: z.string().describe('Detailed description of the task.'),
      deadline: z.string().datetime().describe('The deadline for the task (ISO format).'),
      dependencies: z.array(z.string()).describe('List of task IDs that this task depends on.'),
      division: z
        .string()
        .describe(
          'The division responsible for the task (e.g., Operations, Processing, Production).'        ),
      impact: z
        .string()
        .describe(
          'The impact level of the task on factory operations (e.g., High, Medium, Low).'        ),
      subtasks: z.array(
        z.object({
          subtaskId: z.string().describe('Unique identifier for the subtask.'),
          name: z.string().describe('Name of the subtask.'),
          description: z.string().describe('Detailed description of the subtask.'),
          deadline: z
            .string()
            .datetime()
            .describe('The deadline for the subtask (ISO format).'),
        })
      ),
    })
  ).describe('A list of tasks to prioritize.'),
});

export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(
  z.object({
    taskId: z.string().describe('The ID of the task.'),
    priority: z
      .number()
      .describe(
        'The recommended priority of the task (1 being the highest, higher numbers being lower priority).'      ),
    reason: z.string().describe('The reasoning behind the assigned priority.'),
  })
);

export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI assistant helping a CTO prioritize tasks in a factory setting.

Analyze the following tasks and their subtasks. Consider deadlines, dependencies, division, and impact on factory operations to recommend a priority for each task. Tasks with earlier deadlines, critical dependencies, and higher impact should be prioritized higher (lower number = higher priority).

Tasks:
{{#each tasks}}
  Task ID: {{taskId}}
  Name: {{name}}
  Description: {{description}}
  Deadline: {{deadline}}
  Dependencies: {{dependencies}}
  Division: {{division}}
  Impact: {{impact}}
  Subtasks:
  {{#each subtasks}}
    Subtask ID: {{subtaskId}}
    Name: {{name}}
    Description: {{description}}
    Deadline: {{deadline}}
  {{/each}}
{{/each}}

Prioritize the tasks and provide a brief reason for each assigned priority.  Respond with a valid JSON array.

Prioritized Tasks: `,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);

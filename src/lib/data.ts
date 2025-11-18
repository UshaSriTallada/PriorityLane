import type { Task, Assignee } from '@/types';

const now = new Date();

const johnDoe: Assignee = { name: 'John Doe', avatarUrl: 'https://picsum.photos/seed/2/32/32' };
const janeSmith: Assignee = { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/3/32/32' };
const mikeJohnson: Assignee = { name: 'Mike Johnson', avatarUrl: 'https://picsum.photos/seed/4/32/32' };
const sarahChen: Assignee = { name: 'Sarah Chen', avatarUrl: 'https://picsum.photos/seed/5/32/32' };


export const initialTasks: Task[] = [
  {
    id: 'TASK-8782',
    name: 'Quarterly Maintenance on Conveyor Belt C-3',
    description: 'Perform scheduled quarterly maintenance on the main conveyor belt in the processing division to prevent breakdowns.',
    deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    dependencies: [],
    division: 'Maintenance',
    owner: johnDoe,
    impact: 'High',
    subtasks: [
      { id: 'SUB-001', name: 'Inspect motor and gears', description: 'Check for wear and tear, and listen for any unusual noises.', deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), completed: true, assignee: johnDoe },
      { id: 'SUB-002', name: 'Lubricate all moving parts', description: 'Use approved food-grade lubricant for all joints and bearings.', deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), completed: false, assignee: johnDoe },
      { id: 'SUB-003', name: 'Replace worn-out rollers', description: 'Identify and replace any rollers showing signs of significant wear.', deadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), completed: false, assignee: mikeJohnson },
    ],
  },
  {
    id: 'TASK-5510',
    name: 'Deploy New Sorting Algorithm',
    description: 'Update the sorting machine software with the new AI-powered algorithm to improve package sorting efficiency by 15%.',
    deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    dependencies: ['TASK-1234'],
    division: 'Processing',
    owner: janeSmith,
    impact: 'Medium',
    subtasks: [
        { id: 'SUB-004', name: 'Backup current system configuration', description: 'Create a full system state backup before deploying the new algorithm.', deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), completed: false, assignee: janeSmith },
        { id: 'SUB-005', name: 'Deploy new algorithm to staging environment', description: 'Run tests for at least 4 hours on the staging server to ensure stability.', deadline: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString(), completed: false, assignee: janeSmith },
    ],
  },
  {
    id: 'TASK-1234',
    name: 'Calibrate Packaging Sensors',
    description: 'The weight sensors on packaging line 2 are showing a 5% variance. Needs immediate recalibration to ensure compliance.',
    deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
    dependencies: [],
    division: 'Production',
    owner: mikeJohnson,
    impact: 'High',
    subtasks: [
        { id: 'SUB-006', name: 'Run sensor diagnostics tool', description: 'Use the manufacturer\'s diagnostic tool to identify drift values.', deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), completed: false, assignee: mikeJohnson },
    ],
  },
  {
    id: 'TASK-3456',
    name: 'Review Q3 Logistics Performance',
    description: 'Analyze Q3 shipping data and prepare a report for the upcoming quarterly review meeting.',
    deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    dependencies: [],
    division: 'Logistics',
    owner: sarahChen,
    impact: 'Low',
    subtasks: [],
  }
];

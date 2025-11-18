export type Subtask = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  completed: boolean;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  dependencies: string[];
  division: 'Operations' | 'Processing' | 'Production' | 'Maintenance' | 'Logistics';
  assignee: {
    name: string;
    avatarUrl: string;
  };
  impact: 'High' | 'Medium' | 'Low';
  subtasks: Subtask[];
  priority?: number;
  priorityReason?: string;
};

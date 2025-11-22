
export type Assignee = {
  name: string;
  avatarUrl: string;
};

export type Subtask = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  completed: boolean;
  assignee?: Assignee;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  createdAt: string;
  startedAt?: string;
  doneAt?: string;
  dependencies: string[];
  division: 'Operations' | 'Processing' | 'Production' | 'Maintenance' | 'Logistics';
  owner: Assignee;
  impact: 'High' | 'Medium' | 'Low';
  subtasks: Subtask[];
  priority?: number;
  priorityReason?: string;
};



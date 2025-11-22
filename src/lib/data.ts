import type { Task, Assignee } from '@/types';

// This file now only contains mock data types and can be removed or repurposed.
// The initialTasks array has been removed as data is now fetched from Firestore.

const now = new Date();

const johnDoe: Assignee = { name: 'John Doe', avatarUrl: 'https://picsum.photos/seed/2/32/32' };
const janeSmith: Assignee = { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/3/32/32' };
const mikeJohnson: Assignee = { name: 'Mike Johnson', avatarUrl: 'https://picsum.photos/seed/4/32/32' };
const sarahChen: Assignee = { name: 'Sarah Chen', avatarUrl: 'https://picsum.photos/seed/5/32/32' };


export const initialTasks: Task[] = [
  // Data is now fetched from Firestore. This array is no longer used.
];

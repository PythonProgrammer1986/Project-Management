export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId?: string;
  dueDate?: string; // ISO date string
  startDate?: string; // ISO date string
  subtasks?: { id: string; title: string; completed: boolean }[];
  dependencies?: string[]; // array of task IDs
  notes?: string;
  createdAt: string;
}

export interface BudgetLineItem {
  id: string;
  srNo: string;
  point: string;
  capitalInvestment: string;
  taskCompleted: string;
  percentCompletion: number;
  estimatedKINR: number;
  actualKINR: number;
  remarks: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  budget?: {
    total: number;
    spent: number;
    currency: string;
    lineItems?: BudgetLineItem[];
    conversionRate?: number;
  }
}


export interface MeetingNote {
  id: string;
  projectId?: string;
  title: string;
  content: string;
  authorId: string;
  taggedUserIds: string[];
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  projects: Project[];
  tasks: Task[];
  users: User[];
  notes: MeetingNote[];
  notifications: any[];
  currentUser: User;
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workspace, Task, Project, User, Status, Priority, MeetingNote } from './types';

// Simple ID generator
export const generateId = () => Math.random().toString(36).substring(2, 9);

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Smith', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Bob Johnson', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Charlie Davis', email: 'charlie@example.com', avatar: 'https://i.pravatar.cc/150?u=u3' },
];

const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Website Redesign', description: 'Overhaul the marketing site', icon: 'Laptop', color: '#3b82f6', budget: { total: 15000, spent: 4500, currency: '$' } },
  { id: 'p2', name: 'Mobile App Launch', description: 'V1 launch for iOS and Android', icon: 'Smartphone', color: '#10b981', budget: { total: 30000, spent: 28000, currency: '$' } },
];

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Create wireframes for homepage',
    description: 'Use Figma to design the hero section and value props.',
    status: 'Done',
    priority: 'High',
    assigneeId: 'u1',
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Write copy for about page',
    description: 'We need to highlight our team and mission.',
    status: 'In Progress',
    priority: 'Medium',
    assigneeId: 'u2',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub actions for automatic deployment to Vercel.',
    status: 'To Do',
    priority: 'High',
    assigneeId: 'u3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't4',
    projectId: 'p2',
    title: 'Design app icon',
    description: 'Create a flat design app icon following HIG guidelines.',
    status: 'In Review',
    priority: 'Low',
    assigneeId: 'u1',
    createdAt: new Date().toISOString(),
  },
];

export interface WorkspaceContextType {
  workspace: Workspace;
  setWorkspace: React.Dispatch<React.SetStateAction<Workspace>>;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  activeView: 'project' | 'my-tasks' | 'home' | 'settings' | 'followup' | 'notes' | 'inbox' | 'budget';
  setActiveView: (view: 'project' | 'my-tasks' | 'home' | 'settings' | 'followup' | 'notes' | 'inbox' | 'budget') => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addNote: (note: Omit<MeetingNote, 'id' | 'createdAt'>) => void;
  updateNote: (id: string, updates: Partial<MeetingNote>) => void;
  deleteNote: (id: string) => void;
  markNotificationRead: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(() => {
    const saved = localStorage.getItem('taskflow_workspace');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse workspace', e);
      }
    }
    return {
      id: 'w1',
      name: 'Acme Corp',
      projects: MOCK_PROJECTS,
      tasks: MOCK_TASKS,
      users: MOCK_USERS,
      notes: [],
      notifications: [
        { id: 'n1', title: 'Alice mentioned you in a note', description: '"Let\'s sync about the new mobile navigation @Bob"', createdAt: new Date().toISOString(), read: false },
        { id: 'n2', title: 'Task "Design app icon" marked as Done', description: 'Charlie Davis completed a task.', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true }
      ],
      currentUser: MOCK_USERS[0],
    };
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(workspace.projects[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<WorkspaceContextType['activeView']>('project');

  useEffect(() => {
    localStorage.setItem('taskflow_workspace', JSON.stringify(workspace));
  }, [workspace]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setWorkspace(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setWorkspace(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const deleteTask = (id: string) => {
    setWorkspace(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  };

  const addNote = (noteData: Omit<MeetingNote, 'id' | 'createdAt'>) => {
    const newNote: MeetingNote = {
      ...noteData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setWorkspace(prev => ({
      ...prev,
      notes: [...(prev.notes || []), newNote],
    }));
  };

  const updateNote = (id: string, updates: Partial<MeetingNote>) => {
    setWorkspace(prev => ({
      ...prev,
      notes: (prev.notes || []).map(n => n.id === id ? { ...n, ...updates } : n),
    }));
  };

  const deleteNote = (id: string) => {
    setWorkspace(prev => ({
      ...prev,
      notes: (prev.notes || []).filter(n => n.id !== id),
    }));
  };

  const markNotificationRead = (id: string) => {
    setWorkspace(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  };

  return (
    <WorkspaceContext.Provider value={{
      workspace,
      setWorkspace,
      activeProjectId,
      setActiveProjectId,
      selectedTaskId,
      setSelectedTaskId,
      activeView,
      setActiveView,
      addTask,
      updateTask,
      deleteTask,
      addNote,
      updateNote,
      deleteNote,
      markNotificationRead
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

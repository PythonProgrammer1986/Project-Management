import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workspace, Task, Project, User, MeetingNote } from './types';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from './components/FirebaseProvider';

// Simple ID generator
export const generateId = () => Math.random().toString(36).substring(2, 9);

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
  updateCurrentUser: (updates: Partial<User>) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user: fbUser } = useFirebase();

  const [workspace, setWorkspace] = useState<Workspace>({
    id: 'w1',
    name: 'Epiroc Workspace',
    projects: [],
    tasks: [],
    users: [],
    notes: [],
    notifications: [],
    currentUser: { id: '', name: '', email: '', avatar: '' }
  });

  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<WorkspaceContextType['activeView']>('project');

  useEffect(() => {
    if (!fbUser) return;

    // Listen to Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: User[] = snapshot.docs.map(d => d.data() as User);
      setWorkspace(prev => ({
        ...prev,
        users: usersData,
        currentUser: usersData.find(u => u.id === fbUser.uid) || prev.currentUser
      }));
    });

    // Listen to Projects
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projectsData: Project[] = snapshot.docs.map(d => d.data() as Project);
      if (projectsData.length === 0) {
        // Create initial project if none
        const defaultProject = { id: 'p1', name: 'Default Project', description: '', icon: 'Laptop', color: '#f1c40f', budget: { total: 0, spent: 0, currency: '$' } };
        setDoc(doc(db, 'projects', 'p1'), defaultProject);
      }
      setActiveProjectId(prev => prev ? prev : (projectsData[0]?.id || 'p1'));
      setWorkspace(prev => ({ ...prev, projects: projectsData }));
    });

    // Listen to Tasks
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData: Task[] = snapshot.docs.map(d => d.data() as Task);
      setWorkspace(prev => ({ ...prev, tasks: tasksData }));
    });

    // Listen to Notes
    const unsubNotes = onSnapshot(collection(db, 'notes'), (snapshot) => {
      const notesData: MeetingNote[] = snapshot.docs.map(d => d.data() as MeetingNote);
      setWorkspace(prev => ({ ...prev, notes: notesData }));
    });

    return () => {
      unsubUsers();
      unsubProjects();
      unsubTasks();
      unsubNotes();
    };
  }, [fbUser]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newTask: Task = {
      ...taskData,
      id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'tasks', id), newTask);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await setDoc(doc(db, 'tasks', id), updates, { merge: true });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const addNote = async (noteData: Omit<MeetingNote, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newNote: MeetingNote = {
      ...noteData,
      id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'notes', id), newNote);
  };

  const updateNote = async (id: string, updates: Partial<MeetingNote>) => {
    await setDoc(doc(db, 'notes', id), updates, { merge: true });
  };

  const deleteNote = async (id: string) => {
    await deleteDoc(doc(db, 'notes', id));
  };

  const markNotificationRead = (id: string) => {
    setWorkspace(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    if (fbUser) {
      await setDoc(doc(db, 'users', fbUser.uid), updates, { merge: true });
    }
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
      markNotificationRead,
      updateCurrentUser
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


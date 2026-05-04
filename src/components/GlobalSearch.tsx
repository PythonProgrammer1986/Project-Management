import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../store';
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator 
} from './ui/command';
import { Button } from './ui/button';
import { Search, Calendar, User, Flag, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '../types';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const { workspace, setSelectedTaskId, setActiveProjectId, activeView, setActiveView } = useWorkspace();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelectTask = (task: Task) => {
    setOpen(false);
    if (task.projectId !== workspace.projects.find(p => p.id === workspace.activeProjectId)?.id) {
       setActiveProjectId(task.projectId);
    }
    if (activeView === 'Settings' || activeView === 'MyTasks') {
       setActiveView('Board'); // Switch to a project view to see the task sheet context
    }
    setSelectedTaskId(task.id);
  };

  const statusIcons: Record<string, React.ReactNode> = {
    "To Do": <div className="w-2 h-2 rounded-full bg-slate-400 mr-2" />,
    "In Progress": <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />,
    "In Review": <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />,
    "Done": <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-2" />
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full md:w-64 justify-start text-muted-foreground shadow-none bg-muted/50 border-none"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search tasks...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search by title, description, status..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tasks">
            {workspace.tasks.map((task) => {
               const project = workspace.projects.find(p => p.id === task.projectId);
               const assignee = workspace.users.find(u => u.id === task.assigneeId);
               
               // Create a searchable text representation of the task
               const searchTerms = [
                 task.title,
                 task.description,
                 task.status,
                 task.priority,
                 assignee?.name,
                 project?.name
               ].filter(Boolean).join(" ");

               return (
                <CommandItem 
                  key={task.id} 
                  value={searchTerms}
                  onSelect={() => handleSelectTask(task)}
                  className="flex flex-col items-start py-2"
                >
                  <div className="flex items-center w-full">
                     {statusIcons[task.status]}
                     <span className="font-medium truncate">{task.title}</span>
                     {task.priority === 'High' && <span className="ml-2 text-xs">🔥</span>}
                     {project && <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{project.name}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground w-full">
                     {assignee && (
                       <div className="flex items-center gap-1"><User className="w-3 h-3" /> {assignee.name}</div>
                     )}
                     {task.dueDate && (
                       <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(task.dueDate), 'MMM d, yyyy')}</div>
                     )}
                     <div className="flex items-center gap-1"><Flag className="w-3 h-3" /> {task.priority}</div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

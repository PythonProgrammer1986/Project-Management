import React from 'react';
import { useWorkspace } from '../store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import { Priority, Status } from '../types';

export function ListView({ 
  showCompleted = true,
  filterAssignee = 'all',
  filterPriority = 'all',
  sortBy = 'none' 
}: { 
  showCompleted?: boolean;
  filterAssignee?: string;
  filterPriority?: string;
  sortBy?: string;
}) {
  const { workspace, activeProjectId, updateTask, setSelectedTaskId } = useWorkspace();
  let tasks = workspace.tasks.filter((t) => t.projectId === activeProjectId);

  if (!showCompleted) {
    tasks = tasks.filter(t => t.status !== 'Done');
  }

  if (filterAssignee !== 'all') {
    if (filterAssignee === 'unassigned') {
      tasks = tasks.filter(t => !t.assigneeId);
    } else {
      tasks = tasks.filter(t => t.assigneeId === filterAssignee);
    }
  }

  if (filterPriority !== 'all') {
    tasks = tasks.filter(t => t.priority === filterPriority);
  }

  if (sortBy !== 'none') {
    tasks = [...tasks].sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'assignee') {
        const u1 = workspace.users.find(u => u.id === a.assigneeId)?.name || 'z';
        const u2 = workspace.users.find(u => u.id === b.assigneeId)?.name || 'z';
        return u1.localeCompare(u2);
      }
      return 0;
    });
  }

  const priorityColors: Record<Priority, string> = {
    Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    High: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  const statusColors: Record<Status, string> = {
    "To Do": "text-slate-500",
    "In Progress": "text-amber-500",
    "In Review": "text-purple-500",
    "Done": "text-emerald-500"
  };

  return (
    <div className="p-4">
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Task Name</TableHead>
              <TableHead className="w-[300px]">Description</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const assignee = workspace.users.find(u => u.id === task.assigneeId);
              
              return (
                <TableRow 
                  key={task.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                      <div className={cn("w-1.5 h-1.5 rounded-full", statusColors[task.status].replace('text', 'bg'))} />
                      {task.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground truncate max-w-[280px]" title={task.description}>
                      {task.description || <span className="italic">No description</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="text-[10px] bg-[#FFCC00] text-[#4D4D4D] font-medium">{assignee.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.startDate ? (
                      <span className="text-xs">{format(new Date(task.startDate), 'MMM d, yyyy')}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <span className="text-xs">{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-[10px] uppercase font-semibold border-none px-1.5 py-0 rounded", priorityColors[task.priority])} variant="outline">
                      {task.priority === 'High' && <span className="mr-1">🔥</span>}
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <span className={cn("text-xs font-medium", statusColors[task.status])}>
                       {task.status}
                     </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No tasks found in this project.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

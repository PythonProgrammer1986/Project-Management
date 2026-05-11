import React from 'react';
import { useWorkspace } from '../store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { Priority, Status } from '../types';

export function MyTasksView() {
  const { workspace, setSelectedTaskId } = useWorkspace();
  const tasks = workspace.tasks.filter((t) => t.assigneeId === workspace.currentUser.id);

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
    <div className="p-4 h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">My Tasks</h2>
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Task Name</TableHead>
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const project = workspace.projects.find(p => p.id === task.projectId);
                  
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
                        {project ? (
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: project.color }} />
                             <span className="text-xs text-muted-foreground">{project.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">-</span>
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
                      You have no assigned tasks.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

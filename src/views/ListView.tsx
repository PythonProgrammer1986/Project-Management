import React, { useState } from 'react';
import { useWorkspace } from '../store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import { Priority, Status } from '../types';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Link2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleBulkUpdate = (field: 'status' | 'priority' | 'assigneeId', value: any) => {
    let updatedCount = 0;
    
    selectedTasks.forEach(taskId => {
      if (field === 'status' && value === 'Done') {
        const task = workspace.tasks.find(t => t.id === taskId);
        const unmetDependencies = task?.dependencies?.filter(depId => workspace.tasks.find(t => t.id === depId && t.status !== 'Done'));
        if (unmetDependencies && unmetDependencies.length > 0) {
          toast.error(`Could not complete "${task?.title}" due to unmet dependencies.`);
          return;
        }
      }
      updateTask(taskId, { [field]: value });
      updatedCount++;
    });
    
    setSelectedTasks([]);
    if (updatedCount > 0) {
      toast.success(`Updated ${updatedCount} task(s)`);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {selectedTasks.length > 0 && (
        <div className="bg-muted/50 p-2 border rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium px-2">{selectedTasks.length} tasks selected</span>
          <div className="flex items-center gap-2">
            <Select onValueChange={(val) => handleBulkUpdate('status', val as Status)}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(val) => handleBulkUpdate('priority', val as Priority)}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                <SelectValue placeholder="Change Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(val) => handleBulkUpdate('assigneeId', val === 'unassigned' ? undefined : val)}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                <SelectValue placeholder="Change Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {workspace.users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] px-4">
                <Checkbox 
                  checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
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
              const unmetDependencies = task.dependencies?.filter(depId => workspace.tasks.find(t => t.id === depId && t.status !== 'Done')) || [];
              
              return (
                <TableRow 
                  key={task.id} 
                  className={cn("cursor-pointer group", selectedTasks.includes(task.id) && "bg-muted/50")}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={(checked) => handleSelectTask(task.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                      <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusColors[task.status].replace('text', 'bg'))} />
                      <span className="truncate">{task.title}</span>
                      {task.dependencies && task.dependencies.length > 0 && (
                        <Badge variant="outline" className={cn("ml-2 flex flex-shrink-0 items-center gap-1 font-normal text-[10px] px-1.5 py-0 rounded", unmetDependencies.length > 0 ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-500/10" : "text-muted-foreground border-muted-foreground/30")}>
                          <Link2 className="w-3 h-3" />
                          {unmetDependencies.length > 0 ? `${unmetDependencies.length} blocked` : `${task.dependencies.length} deps`}
                        </Badge>
                      )}
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

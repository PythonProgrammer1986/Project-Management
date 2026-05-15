import React from 'react';
import { useWorkspace } from '../store';
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { Card } from '../components/ui/card';
import { Status, Task } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { CalendarIcon, MessageSquare, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const COLUMNS: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

export function BoardView({ 
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
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

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

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveTask(tasks.find((t) => t.id === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as Status;
      
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        if (newStatus === 'Done') {
          const unmetDependencies = task.dependencies?.filter(depId => workspace.tasks.find(t => t.id === depId && t.status !== 'Done'));
          if (unmetDependencies && unmetDependencies.length > 0) {
            import('sonner').then(({ toast }) => toast.error('Cannot complete task due to unmet dependencies!'));
            return;
          }
        }
        updateTask(taskId, { status: newStatus });
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 p-4 overflow-x-auto items-start">
        {COLUMNS.map((col) => (
          <BoardColumn 
            key={col} 
            status={col} 
            tasks={tasks.filter((t) => t.status === col)} 
            users={workspace.users}
            onTaskClick={(id) => setSelectedTaskId(id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} users={workspace.users} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function BoardColumn({ status, tasks, users, onTaskClick }: { key?: string | number; status: Status; tasks: Task[]; users: any[], onTaskClick: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div 
      className="flex flex-col w-[300px] flex-shrink-0 bg-muted/40 rounded-lg max-h-full border border-border/50"
    >
      <div className="p-3 font-medium text-sm text-foreground/80 flex items-center justify-between">
        <span>{status}</span>
        <Badge variant="secondary" className="rounded-full text-xs font-normal px-2 bg-muted-foreground/10 text-muted-foreground">
          {tasks.length}
        </Badge>
      </div>
      <div 
        ref={setNodeRef} 
        className={cn(
          "p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px] rounded-b-lg transition-colors",
          isOver ? "bg-muted-foreground/10" : ""
        )}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} users={users} onClick={() => onTaskClick(task.id)} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, users, onClick }: { key?: string | number; task: Task; users: any[], onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });
  const { workspace } = useWorkspace();

  const assignee = users.find(u => u.id === task.assigneeId);
  const unmetDependencies = task.dependencies?.filter(depId => workspace.tasks.find(t => t.id === depId && t.status !== 'Done')) || [];

  const priorityColors = {
    Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    High: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div {...attributes} {...listeners} ref={setNodeRef}>
      <Card
        onClick={(e) => {
          // If not dragging, count as click
          if (!isDragging) {
             onClick();
          }
        }}
        className={cn(
          "p-3 cursor-grab hover:cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all shadow-sm border",
          isDragging && "opacity-50 border-primary",
          task.priority === 'High' && "border-l-4 border-l-red-500 bg-white"
        )}
      >
        <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge className={cn("text-[10px] uppercase font-semibold border-none px-1.5 py-0 rounded", priorityColors[task.priority])} variant="outline">
          {task.priority === 'High' && <span className="mr-1">🔥</span>}
          {task.priority}
        </Badge>
        {task.dependencies && task.dependencies.length > 0 && (
          <Badge variant="outline" className={cn("flex items-center gap-1 font-normal text-[10px] px-1.5 py-0 rounded", unmetDependencies.length > 0 ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-500/10" : "text-muted-foreground border-muted-foreground/30")}>
            <Link2 className="w-3 h-3" />
            {unmetDependencies.length > 0 ? `${unmetDependencies.length} blocked` : `${task.dependencies.length} deps`}
          </Badge>
        )}
      </div>
      <h4 className="text-sm font-medium leading-tight mb-3 text-foreground line-clamp-2">
        {task.title}
      </h4>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
             <MessageSquare className="w-3 h-3" />
             <span>0</span>
          </div>
        </div>
        {assignee && (
          <Avatar className="w-6 h-6 border">
            <AvatarImage src={assignee.avatar} />
            <AvatarFallback className="text-[10px]">{assignee.name[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </Card>
    </div>
  );
}

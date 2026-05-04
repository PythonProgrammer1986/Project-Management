import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../store';
import { format, addDays, differenceInDays, addWeeks, addMonths, startOfWeek, startOfMonth, differenceInWeeks, differenceInMonths } from 'date-fns';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Link2 } from 'lucide-react';

export function TimelineView() {
  const { workspace, activeProjectId, setSelectedTaskId } = useWorkspace();
  const tasks = workspace.tasks.filter((t) => t.projectId === activeProjectId);
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Day');

  // Generate simple timeline (e.g., spanning next 30 days or based on project tasks)
  const today = new Date();
  
  // Find min and max dates
  let minDate = new Date();
  let maxDate = addDays(new Date(), 30); // Default to at least 30 days
  
  tasks.forEach(task => {
    if (task.startDate) {
      const d = new Date(task.startDate);
      if (d < minDate) minDate = d;
    } else if (task.createdAt) {
      const d = new Date(task.createdAt);
      if (d < minDate) minDate = d;
    }
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (d > maxDate) maxDate = d;
    }
  });

  // Calculate dependency graph to find critical path
  const criticalPathIds = useMemo(() => {
    const path = new Set<string>();
    tasks.forEach(t => {
      if (t.priority === 'High' && t.status !== 'Done') {
        path.add(t.id);
      }
      if (t.dependencies && t.dependencies.length > 0) {
        path.add(t.id);
        t.dependencies.forEach(d => path.add(d));
      }
    });
    return path;
  }, [tasks]);

  const timeUnits = useMemo(() => {
    if (viewMode === 'Week') {
      const start = startOfWeek(addDays(minDate, -7));
      const totalUnits = differenceInWeeks(maxDate, start) + 4;
      return Array.from({ length: totalUnits }).map((_, i) => addWeeks(start, i));
    } else if (viewMode === 'Month') {
      const start = startOfMonth(addMonths(minDate, -1));
      const totalUnits = differenceInMonths(maxDate, start) + 3;
      return Array.from({ length: totalUnits }).map((_, i) => addMonths(start, i));
    } else {
      const start = addDays(minDate, -2);
      const totalUnits = differenceInDays(maxDate, start) + 7;
      return Array.from({ length: totalUnits }).map((_, i) => addDays(start, i));
    }
  }, [minDate, maxDate, viewMode]);

  const colWidth = viewMode === 'Day' ? 48 : viewMode === 'Week' ? 100 : 150;

  return (
    <div className="p-4 h-full flex flex-col overflow-hidden bg-white space-y-4">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-semibold">Timeline</h2>
         <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View Mode:</span>
            <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
               <SelectTrigger className="w-[120px]">
                  <SelectValue />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="Day">Daily</SelectItem>
                  <SelectItem value="Week">Weekly</SelectItem>
                  <SelectItem value="Month">Monthly</SelectItem>
               </SelectContent>
            </Select>
         </div>
      </div>
      <div className="flex-1 overflow-auto border rounded-xl shadow-sm bg-card relative">
        <div className="min-w-max">
          {/* Header */}
          <div className="sticky top-0 z-20 flex border-b bg-muted/30">
            <div className="w-[300px] shrink-0 border-r bg-background font-semibold p-3 text-sm flex items-center justify-between sticky left-0 z-20 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
              <span>Task</span>
              <span className="text-xs text-muted-foreground mr-2 font-normal">Critical Path Highlight</span>
            </div>
            <div className="flex relative bg-background/50">
              {timeUnits.map((unit, i) => (
                <div key={i} style={{ width: colWidth }} className={cn("shrink-0 border-r p-2 text-center flex flex-col items-center justify-center", 
                  viewMode === 'Day' && format(unit, 'MM-dd') === format(today, 'MM-dd') ? 'bg-primary/5 text-primary' : ''
                )}>
                  {viewMode === 'Day' && (
                    <>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{format(unit, 'E')}</div>
                      <div className={cn("text-xs mt-0.5", format(unit, 'MM-dd') === format(today, 'MM-dd') ? 'font-bold' : '')}>{format(unit, 'd')}</div>
                    </>
                  )}
                  {viewMode === 'Week' && (
                    <>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Wk {format(unit, 'w')}</div>
                      <div className="text-xs mt-0.5">{format(unit, 'MMM d')}</div>
                    </>
                  )}
                  {viewMode === 'Month' && (
                    <>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{format(unit, 'yyyy')}</div>
                      <div className="text-xs font-medium mt-0.5">{format(unit, 'MMMM')}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Body */}
          <div className="relative">
            {tasks.map(task => {
              const u = workspace.users.find(u => u.id === task.assigneeId);
              const isCritical = criticalPathIds.has(task.id);
              
              const startDt = task.startDate ? new Date(task.startDate) : (task.createdAt ? new Date(task.createdAt) : minDate);
              const endDt = task.dueDate ? new Date(task.dueDate) : addDays(startDt, 3);
              
              let leftPos = 0;
              let widthPos = 0;
              
              if (viewMode === 'Day') {
                 const startDiff = differenceInDays(startDt, timeUnits[0]);
                 const duration = Math.max(1, differenceInDays(endDt, startDt) + 1);
                 leftPos = startDiff * colWidth;
                 widthPos = duration * colWidth;
              } else if (viewMode === 'Week') {
                 const startDiff = differenceInDays(startDt, timeUnits[0]) / 7;
                 const durationDays = Math.max(1, differenceInDays(endDt, startDt) + 1);
                 leftPos = startDiff * colWidth;
                 widthPos = (durationDays / 7) * colWidth;
              } else if (viewMode === 'Month') {
                 const startDiff = differenceInDays(startDt, timeUnits[0]) / 30;
                 const durationDays = Math.max(1, differenceInDays(endDt, startDt) + 1);
                 leftPos = startDiff * colWidth;
                 widthPos = (durationDays / 30) * colWidth;
              }

              return (
                <div key={task.id} className="flex border-b group hover:bg-muted/10 relative">
                  {/* Task details fixed left */}
                  <div className="w-[300px] shrink-0 border-r p-3 bg-background flex flex-col justify-center sticky left-0 z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)] cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                    <div className="flex items-center justify-between gap-2">
                       <span className={cn("truncate font-medium text-sm", isCritical && "text-red-600 font-semibold")}>
                          {task.priority === 'High' && <span className="mr-1 inline-block" title="High Priority">🔥</span>}
                          {task.title}
                       </span>
                       {task.dependencies && task.dependencies.length > 0 && (
                          <Link2 className="w-3 h-3 text-muted-foreground shrink-0" title="Has dependencies" />
                       )}
                    </div>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground gap-2">
                       {u && (
                         <div className="flex items-center gap-1.5">
                           <Avatar className="w-4 h-4"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                           <span>{u.name}</span>
                         </div>
                       )}
                       {!u && <span>Unassigned</span>}
                       <span>&bull;</span>
                       <span className={cn(task.status === 'Done' ? 'text-emerald-500' : '')}>{task.status}</span>
                    </div>
                  </div>

                  {/* Timeline bar row */}
                  <div className="flex relative items-center py-2" style={{ width: timeUnits.length * colWidth }}>
                     {/* Render grid lines */}
                     <div className="absolute inset-0 flex pointer-events-none">
                       {timeUnits.map((unit, i) => (
                          <div key={i} style={{ width: colWidth }} className={cn("h-full border-r shrink-0", viewMode === 'Day' && format(unit, 'MM-dd') === format(today, 'MM-dd') ? 'bg-primary/5' : '')} />
                       ))}
                     </div>

                     {/* The bar */}
                     <div 
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 h-8 rounded-md px-2 flex items-center shadow-sm cursor-pointer transition-colors overflow-hidden border",
                          task.status === 'Done' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 
                            (isCritical ? 'bg-red-100 border-red-300 text-red-800' : 'bg-primary/10 border-primary/20 text-primary-foreground')
                        )}
                        style={{ left: leftPos, width: Math.max(widthPos, 4) }}
                        onClick={() => setSelectedTaskId(task.id)}
                     >
                        <div className={cn("truncate text-xs font-semibold px-1", !isCritical && 'text-primary')}>
                          {task.title}
                        </div>
                     </div>
                  </div>
                </div>
              );
            })}
            
            {tasks.length === 0 && (
               <div className="p-8 text-center text-muted-foreground">
                 No tasks found to build a timeline.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useWorkspace } from '../store';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format, isToday, isPast } from 'date-fns';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';

export function DailyFollowupView() {
  const { workspace, setSelectedTaskId } = useWorkspace();
  
  // Group tasks by Assignee, then filter for active/due tasks
  const assignees = workspace.users.map(user => {
    const userTasks = workspace.tasks.filter(t => t.assigneeId === user.id && t.status !== 'Done');
    
    // Sort tasks logically: Past due/Today first, then High priority, then others
    userTasks.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateA - dateB;
    });

    return {
      user,
      tasks: userTasks
    };
  }).filter(group => group.tasks.length > 0);

  return (
    <div className="p-4 h-full overflow-auto bg-slate-50/50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Daily Followup</h2>
          <p className="text-muted-foreground mb-6">Review active tasks by team members to discuss in daily standups.</p>
          
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
             {assignees.map(group => (
               <Card key={group.user.id} className="overflow-hidden flex flex-col max-h-[500px]">
                 <div className="p-4 border-b bg-muted/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border shadow-sm">
                        <AvatarImage src={group.user.avatar} />
                        <AvatarFallback>{group.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold leading-none mb-1">{group.user.name}</div>
                        <div className="text-xs text-muted-foreground">{group.tasks.length} active tasks</div>
                      </div>
                    </div>
                 </div>
                 
                 <div className="p-0 overflow-auto flex-1">
                    <div className="divide-y">
                      {group.tasks.map(task => {
                        const project = workspace.projects.find(p => p.id === task.projectId);
                        const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
                        const dueToday = task.dueDate && isToday(new Date(task.dueDate));

                        return (
                          <div 
                            key={task.id} 
                            className="p-3 hover:bg-muted/30 transition-colors cursor-pointer group"
                            onClick={() => setSelectedTaskId(task.id)}
                          >
                            <div className="flex justify-between items-start gap-4 mb-2">
                               <h4 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">{task.title}</h4>
                               {task.priority === 'High' && (
                                 <Badge variant="destructive" className="text-[10px] uppercase shrink-0 px-1 py-0 h-4">High</Badge>
                               )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                               {project ? (
                                 <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded-full">
                                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: project.color }} />
                                    <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[120px]">{project.name}</span>
                                 </div>
                               ) : <div />}

                               <div className="flex items-center gap-2">
                                 <span className={cn(
                                   "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                   isOverdue ? "bg-red-100 text-red-700" : (dueToday ? "bg-amber-100 text-amber-700" : "text-muted-foreground")
                                 )}>
                                   {task.dueDate ? (isOverdue ? 'Overdue' : (dueToday ? 'Today' : format(new Date(task.dueDate), 'MMM d'))) : 'No date'}
                                 </span>
                               </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                 </div>
               </Card>
             ))}

             {assignees.length === 0 && (
               <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                  <div className="text-lg font-medium mb-1">All caught up!</div>
                  <p>There are no active tasks for any team members.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

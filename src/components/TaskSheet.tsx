import React from 'react';
import { useWorkspace } from '../store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Priority, Status } from '../types';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, UserIcon, Trash2, CheckIcon, AlertTriangle, Clock } from 'lucide-react';
import { format, isBefore, isToday, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export function TaskSheet() {
  const { workspace, selectedTaskId, setSelectedTaskId, updateTask, deleteTask } = useWorkspace();
  
  const task = workspace.tasks.find(t => t.id === selectedTaskId);
  
  if (!task) {
    return (
      <Sheet open={!!selectedTaskId} onOpenChange={(val) => !val && setSelectedTaskId(null)}>
        <SheetContent className="sm:max-w-[600px] w-full p-4">&nbsp;</SheetContent>
      </Sheet>
    );
  }

  const handleDelete = () => {
    deleteTask(task.id);
    setSelectedTaskId(null);
    toast.success('Task deleted');
  };

  const isOverdue = task.dueDate ? isBefore(new Date(task.dueDate), startOfDay(new Date())) && task.status !== 'Done' : false;
  const isDueToday = task.dueDate ? isToday(new Date(task.dueDate)) && task.status !== 'Done' : false;

  return (
    <Sheet open={!!selectedTaskId} onOpenChange={(val) => !val && setSelectedTaskId(null)}>
      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full overflow-hidden border-l border-border shadow-2xl">
        <div className="flex flex-col border-b">
          <div className="flex items-center justify-between p-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-8 text-xs font-semibold uppercase tracking-wide px-3",
                task.status === 'Done' ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700" : "text-muted-foreground bg-muted/50"
              )}
              onClick={() => {
                if (task.status !== 'Done') {
                  const unmetDependencies = task.dependencies?.filter(depId => {
                    const depTask = workspace.tasks.find(t => t.id === depId);
                    return depTask && depTask.status !== 'Done';
                  });
                  if (unmetDependencies && unmetDependencies.length > 0) {
                    toast.error('Cannot complete task due to unmet dependencies!');
                    return;
                  }
                  updateTask(task.id, { status: 'Done' });
                } else {
                  updateTask(task.id, { status: 'To Do' });
                }
              }}
            >
              {task.status === 'Done' ? 'Completed' : 'Mark Complete'}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {(isOverdue || isDueToday) && (
            <div className={cn(
              "px-4 py-2 text-xs font-medium flex items-center gap-2",
              isOverdue ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
            )}>
              {isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {isOverdue ? 'This task is overdue!' : 'This task is due today!'}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <Input 
            value={task.title} 
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            className="text-2xl font-semibold border-none px-0 h-auto rounded-none focus-visible:ring-0 outline-none w-full"
            placeholder="Task Title"
          />

          <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
            <span className="text-sm text-muted-foreground">Assignee</span>
            <Select 
              value={task.assigneeId || "unassigned"} 
              onValueChange={(val) => updateTask(task.id, { assigneeId: val === "unassigned" ? undefined : val })}
            >
              <SelectTrigger className="w-[200px] border-none shadow-none hover:bg-muted/50 rounded-md">
                 {task.assigneeId ? (() => {
                     const u = workspace.users.find(u => u.id === task.assigneeId);
                     return u ? (
                        <div className="flex items-center gap-2">
                           <Avatar className="w-5 h-5"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                           <span>{u.name}</span>
                        </div>
                     ) : "Unassigned"
                 })() : (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border border-dashed flex items-center justify-center">
                         <UserIcon className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground">Unassigned</span>
                    </div>
                 )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {workspace.users.map((u) => (
                   <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground">Start Date</span>
            <Popover>
              <PopoverTrigger render={
                <Button variant={"ghost"} className="w-[200px] justify-start text-left font-normal border-none shadow-none hover:bg-muted/50 h-9 px-3">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.startDate ? format(new Date(task.startDate), "PPP") : <span className="text-muted-foreground">No start date</span>}
                </Button>
              } />
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={task.startDate ? new Date(task.startDate) : undefined}
                  onSelect={(d) => updateTask(task.id, { startDate: d ? d.toISOString() : undefined })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-sm text-muted-foreground">Due Date</span>
            <Popover>
              <PopoverTrigger render={
                <Button variant={"ghost"} className="w-[200px] justify-start text-left font-normal border-none shadow-none hover:bg-muted/50 h-9 px-3">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.dueDate ? format(new Date(task.dueDate), "PPP") : <span className="text-muted-foreground">No due date</span>}
                </Button>
              } />
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={task.dueDate ? new Date(task.dueDate) : undefined}
                  onSelect={(d) => updateTask(task.id, { dueDate: d ? d.toISOString() : undefined })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-sm text-muted-foreground">Project</span>
            <div className="flex items-center gap-2 px-3 h-9">
               {(() => {
                 const p = workspace.projects.find(p => p.id === task.projectId);
                 return p ? (
                   <>
                     <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                     <span className="text-sm">{p.name}</span>
                   </>
                 ) : "-";
               })()}
            </div>

             <span className="text-sm text-muted-foreground">Priority</span>
             <Select value={task.priority} onValueChange={(val) => updateTask(task.id, { priority: val as Priority })}>
               <SelectTrigger className="w-[200px] border-none shadow-none hover:bg-muted/50 h-9 px-3">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
               </SelectContent>
             </Select>

             <span className="text-sm text-muted-foreground">Status</span>
             <Select value={task.status} onValueChange={(val) => updateTask(task.id, { status: val as Status })}>
               <SelectTrigger className="w-[200px] border-none shadow-none hover:bg-muted/50 h-9 px-3">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
               </SelectContent>
             </Select>
          </div>

          <Accordion type="multiple" defaultValue={["details", "subtasks", "dependencies", "notes"]} className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm font-medium">Details</AccordionTrigger>
              <AccordionContent>
                <Textarea 
                  value={task.description}
                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                  placeholder="What is this task about?"
                  className="border-none focus-visible:ring-0 shadow-none resize-none px-0 text-foreground min-h-[100px]"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="subtasks">
              <AccordionTrigger className="text-sm font-medium">Subtasks ({task.subtasks?.filter(s => s.completed).length || 0}/{task.subtasks?.length || 0})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 mt-2">
                   {task.subtasks?.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3">
                         <div
                            className={cn(
                               "w-4 h-4 rounded border flex items-center justify-center cursor-pointer flex-shrink-0",
                               subtask.completed ? "bg-primary border-primary text-primary-foreground" : "border-input"
                            )}
                            onClick={() => {
                               const newSubtasks = task.subtasks?.map(s => s.id === subtask.id ? { ...s, completed: !s.completed } : s);
                               updateTask(task.id, { subtasks: newSubtasks });
                            }}
                         >
                            {subtask.completed && <CheckIcon className="w-3 h-3" />}
                         </div>
                         <Input 
                            value={subtask.title}
                            onChange={(e) => {
                               const newSubtasks = task.subtasks?.map(s => s.id === subtask.id ? { ...s, title: e.target.value } : s);
                               updateTask(task.id, { subtasks: newSubtasks });
                            }}
                            className={cn("h-8 border-none px-1 shadow-none focus-visible:ring-1", subtask.completed && "line-through text-muted-foreground")}
                         />
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-50 hover:opacity-100 flex-shrink-0" onClick={() => {
                            updateTask(task.id, { subtasks: task.subtasks?.filter(s => s.id !== subtask.id) });
                         }}>
                            <Trash2 className="w-3 h-3" />
                         </Button>
                      </div>
                   ))}
                </div>
                <Button variant="outline" size="sm" className="w-full border-dashed mt-4" onClick={() => {
                   const newSubtasks = [...(task.subtasks || []), { id: `st${Date.now()}`, title: '', completed: false }];
                   updateTask(task.id, { subtasks: newSubtasks });
                }}>
                   Add Subtask
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dependencies">
              <AccordionTrigger className="text-sm font-medium">Dependencies</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="flex flex-col gap-2">
                    {task.dependencies?.map((depId) => {
                      const depTask = workspace.tasks.find(t => t.id === depId);
                      if (!depTask) return null;
                      return (
                        <div key={depId} className="flex flex-col gap-1 text-sm bg-muted/30 p-2 rounded-md group">
                           <div className="flex items-center justify-between">
                              <span className={cn("font-medium", depTask.status === 'Done' && "line-through text-muted-foreground")}>{depTask.title}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                 const newDeps = task.dependencies?.filter(id => id !== depId);
                                 updateTask(task.id, { dependencies: newDeps });
                              }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                           </div>
                           <span className="text-xs text-muted-foreground text-left">{depTask.status}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  <Select onValueChange={(val) => {
                     if (val && !task.dependencies?.includes(val)) {
                        updateTask(task.id, { dependencies: [...(task.dependencies || []), val] });
                     }
                  }}>
                    <SelectTrigger className="w-full text-sm h-8 border-dashed bg-transparent hover:bg-muted/50">
                       <SelectValue placeholder="Add dependency (blocked by)" />
                    </SelectTrigger>
                    <SelectContent>
                       {workspace.tasks.filter(t => t.id !== task.id && t.projectId === task.projectId).map(t => (
                         <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="notes">
              <AccordionTrigger className="text-sm font-medium">Private Task Notes</AccordionTrigger>
              <AccordionContent>
                <Textarea 
                  value={task.notes || ''}
                  onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                  placeholder="Add private notes here..."
                  className="border-none focus-visible:ring-0 shadow-none resize-none px-0 text-foreground min-h-[80px]"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}

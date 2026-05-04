import React, { useState } from 'react';
import { useWorkspace } from '../store';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Priority, Status } from '../types';
import { toast } from 'sonner';

export function CreateTaskDialog({ children }: { children: React.ReactNode }) {
  const { workspace, activeProjectId, addTask } = useWorkspace();
  const [open, setOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<Status>('To Do');
  const [assigneeId, setAssigneeId] = useState<string>('unassigned');
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      projectId: activeProjectId,
      title,
      description,
      priority,
      status,
      assigneeId: assigneeId === 'unassigned' ? undefined : assigneeId,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
    });
    
    toast.success('Task created successfully');
    setOpen(false);
    
    // Reset
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setStatus('To Do');
    setAssigneeId('unassigned');
    setStartDate('');
    setDueDate('');
  };

  const project = workspace.projects.find(p => p.id === activeProjectId);

  if (!project) return <>{children}</>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && React.isValidElement(children) ? (
        <DialogTrigger render={children} />
      ) : (
        <DialogTrigger>{children}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Add a new task to {project.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Name</Label>
              <Input id="title" placeholder="e.g. Design homepage hero" value={title} onChange={e => setTitle(e.target.value)} autoFocus required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {workspace.users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Add context or details..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={4} 
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!title.trim()}>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

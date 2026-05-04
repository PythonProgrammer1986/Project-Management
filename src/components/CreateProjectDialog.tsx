import React, { useState } from 'react';
import { useWorkspace } from '../store';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { generateId } from '../store';

export function CreateProjectDialog({ children }: { children: React.ReactNode }) {
  const { workspace, setWorkspace, setActiveProjectId } = useWorkspace();
  const [open, setOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = generateId();
    const newProject = {
      id: newId,
      name,
      description,
      icon: 'Folder',
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') // Random hex color
    };

    setWorkspace(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
    setActiveProjectId(newId);
    
    toast.success('Project created successfully');
    setOpen(false);
    
    // Reset
    setName('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && React.isValidElement(children) ? (
        <DialogTrigger render={children} />
      ) : (
        <DialogTrigger>{children}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Add a new project to your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" placeholder="e.g. Q4 Marketing Campaign" value={name} onChange={e => setName(e.target.value)} autoFocus required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="What is this project about?" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim()}>Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from 'react';
import { useWorkspace } from '../store';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

export function UserProfileDialog({ children }: { children: React.ReactNode }) {
  const { workspace, setWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  
  const [name, setName] = useState(workspace.currentUser.name);
  const [email, setEmail] = useState(workspace.currentUser.email);
  const [avatar, setAvatar] = useState(workspace.currentUser.avatar);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setWorkspace(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser, name, email, avatar },
      users: prev.users.map(u => 
        u.id === prev.currentUser.id ? { ...u, name, email, avatar } : u
      )
    }));

    toast.success('Profile updated');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && React.isValidElement(children) ? (
        <DialogTrigger render={children as any} />
      ) : (
        <DialogTrigger render={<span onClick={() => setOpen(true)} />}>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Your Profile</DialogTitle>
            <DialogDescription>
              Update your personal information and avatar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center mb-4">
              <Avatar className="w-20 h-20 border-2">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-xl">{name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" value={avatar} onChange={e => setAvatar(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

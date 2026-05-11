import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../store';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

export function UserProfileDialog({ children }: { children: React.ReactNode }) {
  const { workspace, updateCurrentUser } = useWorkspace();
  const [open, setOpen] = useState(false);
  
  const [name, setName] = useState(workspace.currentUser?.name || '');
  const [email, setEmail] = useState(workspace.currentUser?.email || '');
  const [avatar, setAvatar] = useState(workspace.currentUser?.avatar || '');

  useEffect(() => {
    if (open) {
      setName(workspace.currentUser?.name || '');
      setEmail(workspace.currentUser?.email || '');
      setAvatar(workspace.currentUser?.avatar || '');
    }
  }, [open, workspace.currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (updateCurrentUser) {
        await updateCurrentUser({ name, email, avatar });
      }
      toast.success('Profile updated');
      setOpen(false);
    } catch (err) {
      toast.error('Failed to update profile');
    }
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
              Update your personal information and avatar in the Epiroc Workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center mb-4">
              <Avatar className="w-20 h-20 border-2">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-xl bg-[#FFCC00] text-[#4D4D4D]">{name ? name[0] : 'U'}</AvatarFallback>
              </Avatar>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled />
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

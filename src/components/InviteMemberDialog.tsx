import React, { useState } from 'react';
import { useWorkspace } from '../store';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function InviteMemberDialog({ children }: { children: React.ReactNode }) {
  const { addUser } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    
    try {
      await addUser({
        name: name.trim(),
        email: email.trim() || undefined,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=random`
      });

      toast.success(email ? `Invitation sent to ${email}` : `Member ${name} added`);
      setOpen(false);
      setName('');
      setEmail('');
    } catch (err) {
      toast.error('Failed to add member');
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
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to collaborate in this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email address (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{email.trim() ? "Send Invite" : "Add Member"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

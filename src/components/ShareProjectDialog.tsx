import React, { useState } from 'react';
import { useWorkspace } from '../store';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Share, Copy, Check } from 'lucide-react';

export function ShareProjectDialog({ children }: { children: React.ReactNode }) {
  const { workspace, activeProjectId } = useWorkspace();
  const project = workspace.projects.find(p => p.id === activeProjectId);
  const [copied, setCopied] = useState(false);

  if (!project) return <>{children}</>;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://taskflow.example.com/projects/${project.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      {children && React.isValidElement(children) ? (
        <DialogTrigger render={children as any} />
      ) : (
        <DialogTrigger render={<span />}>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Anyone with this link will be able to view this project.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={`https://taskflow.example.com/projects/${project.id}`}
              readOnly
            />
          </div>
          <Button size="icon" onClick={copyLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <DialogFooter className="sm:justify-start mt-4">
          <Button type="button" variant="secondary" className="w-full">
            <Share className="mr-2 h-4 w-4" /> Send Email Invites
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

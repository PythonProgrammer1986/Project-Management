import React, { useState } from 'react';
import { useWorkspace } from '../store';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CheckCircle2, Home, Inbox, LayoutGrid, Plus, Bell, Settings } from 'lucide-react';
import { CreateProjectDialog } from './CreateProjectDialog';
import { UserProfileDialog } from './UserProfileDialog';
import { toast } from 'sonner';

export function Sidebar() {
  const { workspace, activeProjectId, setActiveProjectId, activeView, setActiveView } = useWorkspace();

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      <div className="p-4 flex items-center space-x-3">
        <Avatar className="h-8 w-8 rounded-md bg-primary text-primary-foreground">
          <AvatarFallback className="rounded-md font-semibold">TF</AvatarFallback>
        </Avatar>
        <span className="font-semibold">{workspace.name}</span>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          <Button 
            variant={activeView === 'home' ? "secondary" : "ghost"} 
            className="w-full justify-start text-muted-foreground"
            onClick={() => setActiveView('home')}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button 
            variant={activeView === 'my-tasks' ? "secondary" : "ghost"} 
            className="w-full justify-start text-muted-foreground"
            onClick={() => setActiveView('my-tasks')}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            My Tasks
          </Button>
          <Button 
            variant={activeView === 'inbox' ? "secondary" : "ghost"} 
            className="w-full justify-start text-muted-foreground"
            onClick={() => setActiveView('inbox')}
          >
            <div className="relative">
              <Inbox className="mr-2 h-4 w-4" />
              {workspace.notifications?.filter(n => !n.read).length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            Inbox
          </Button>
          <Button 
            variant={activeView === 'followup' ? "secondary" : "ghost"} 
            className="w-full justify-start text-muted-foreground"
            onClick={() => setActiveView('followup')}
          >
            <Bell className="mr-2 h-4 w-4" />
            Daily Followup
          </Button>
          <Button 
            variant={activeView === 'settings' ? "secondary" : "ghost"} 
            className="w-full justify-start text-muted-foreground"
            onClick={() => setActiveView('settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <div className="px-2 py-1 flex items-center justify-between text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            <span>Projects</span>
            <CreateProjectDialog>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <Plus className="h-3 w-3" />
              </Button>
            </CreateProjectDialog>
          </div>
          {workspace.projects.map((project) => (
            <Button
              key={project.id}
              variant={activeView === 'project' && activeProjectId === project.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveProjectId(project.id);
                setActiveView('project');
              }}
            >
              <div 
                className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" 
                style={{ backgroundColor: project.color }} 
              />
              <span className="truncate">{project.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <UserProfileDialog>
          <Button variant="ghost" className="w-full justify-start">
            <Avatar className="h-6 w-6 mr-2 border">
              <AvatarImage src={workspace.currentUser.avatar} />
              <AvatarFallback>{workspace.currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <span className="truncate">{workspace.currentUser.name}</span>
          </Button>
        </UserProfileDialog>
      </div>
    </div>
  );
}

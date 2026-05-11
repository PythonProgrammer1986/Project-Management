import React from 'react';
import { useWorkspace } from '../store';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Share, Star, Plus, MoreHorizontal, ArrowUpDown, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { ShareProjectDialog } from './ShareProjectDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { GlobalSearch } from './GlobalSearch';

export function Header() {
  const { workspace, activeProjectId, activeView } = useWorkspace();
  
  if (activeView === 'home') {
    return (
      <div className="h-14 border-b flex items-center justify-between px-6 bg-background">
        <h1 className="font-semibold text-lg">Home</h1>
        <div className="flex items-center flex-1 justify-center max-w-md mx-auto hidden md:flex">
           <GlobalSearch />
        </div>
        <div className="w-10"></div>
      </div>
    );
  }

  if (activeView === 'my-tasks') {
    return (
      <div className="h-14 border-b flex items-center justify-between px-6 bg-background">
        <div className="flex items-center space-x-4 w-[250px]">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-semibold text-xs border border-orange-200 rounded-full w-full h-full flex items-center justify-center">MY</span>
          </div>
          <h1 className="font-semibold text-lg">My Tasks</h1>
        </div>
        <div className="flex items-center flex-1 justify-center max-w-md mx-auto hidden md:flex">
           <GlobalSearch />
        </div>
        <div className="flex items-center space-x-3 w-[250px] justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><ArrowUpDown className="w-4 h-4 mr-2"/> Sort by Priority</DropdownMenuItem>
              <DropdownMenuItem><ArrowUpDown className="w-4 h-4 mr-2"/> Sort by Due Date</DropdownMenuItem>
              <DropdownMenuItem><Filter className="w-4 h-4 mr-2"/> Filter active</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  if (activeView === 'followup') {
    return (
      <div className="h-14 border-b flex items-center justify-between px-6 bg-background">
        <div className="flex items-center space-x-4 w-[250px]">
          <h1 className="font-semibold text-lg">Daily Followup</h1>
        </div>
        <div className="flex items-center flex-1 justify-center max-w-md mx-auto hidden md:flex">
           <GlobalSearch />
        </div>
        <div className="w-[250px]"></div>
      </div>
    );
  }

  if (activeView === 'settings') {
    return (
      <div className="h-14 border-b flex items-center justify-between px-6 bg-background">
        <div className="flex items-center space-x-4 w-[250px]">
          <h1 className="font-semibold text-lg">Master Settings</h1>
        </div>
        <div className="flex items-center flex-1 justify-center max-w-md mx-auto hidden md:flex">
           <GlobalSearch />
        </div>
        <div className="w-[250px]"></div>
      </div>
    );
  }

  const project = workspace.projects.find(p => p.id === activeProjectId);

  if (!project) return null;

  return (
    <div className="h-14 border-b flex items-center justify-between px-6 bg-background">
      <div className="flex items-center space-x-4 w-[250px]">
        <div 
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" 
          style={{ backgroundColor: project.color }}
        >
          {/* using standard box since we don't map lucide string easily without a map */}
          <div className="w-3 h-3 bg-white rounded-sm opacity-80" />
        </div>
        <h1 className="font-semibold text-lg truncate max-w-[150px]">{project.name}</h1>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => toast.success('Added to favorites')}>
          <Star className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center flex-1 justify-center max-w-md mx-auto hidden lg:flex">
         <GlobalSearch />
      </div>
      
      <div className="flex items-center space-x-3 w-[250px] justify-end">
        <div className="flex space-x-2 text-xs text-muted-foreground mr-2 font-medium">
          {workspace.users.map((user) => (
            <span key={user.id} className="px-2 py-1 bg-slate-100 rounded-md whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" title={user.name}>
              {user.name.split(' ')[0]}
            </span>
          ))}
        </div>
        <ShareProjectDialog>
          <Button variant="outline" size="sm" className="hidden border-dashed md:flex">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </ShareProjectDialog>
      </div>
    </div>
  );
}

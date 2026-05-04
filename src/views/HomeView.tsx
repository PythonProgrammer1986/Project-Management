import React from 'react';
import { useWorkspace } from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';

export function HomeView() {
  const workspaceContext = useWorkspace();
  const { workspace } = workspaceContext;
  const myTasks = workspace.tasks.filter((t) => t.assigneeId === workspace.currentUser.id);
  const tasksDueSoon = myTasks.filter((t) => t.dueDate && new Date(t.dueDate) > new Date() && t.status !== 'Done');

  return (
    <div className="p-8 h-full overflow-auto space-y-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Good morning, {workspace.currentUser.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM do')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>My Priorities</CardTitle>
              <CardDescription>Tasks assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex divide-x border rounded-lg overflow-hidden text-center justify-center">
                <div className="flex-1 py-4 bg-muted/30">
                  <div className="text-2xl font-semibold">{myTasks.filter(t => t.status !== 'Done').length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Upcoming</div>
                </div>
                <div className="flex-1 py-4 bg-emerald-500/10">
                  <div className="text-2xl font-semibold text-emerald-600">{myTasks.filter(t => t.status === 'Done').length}</div>
                  <div className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mt-1">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Recent projects you contributed to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workspace.projects.slice(0, 3).map(p => (
                  <Button 
                    key={p.id} 
                    variant="ghost" 
                    className="w-full flex items-center justify-start gap-3 h-auto py-2 px-3"
                    onClick={() => {
                      workspaceContext.setActiveProjectId(p.id);
                      workspaceContext.setActiveView('project');
                    }}
                  >
                    <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: p.color }}>
                      <div className="w-4 h-4 bg-white rounded-sm opacity-80" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">{workspace.tasks.filter(t => t.projectId === p.id).length} tasks</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

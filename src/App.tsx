import React, { useState } from 'react';
import { WorkspaceProvider, useWorkspace } from './store';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BoardView } from './views/BoardView';
import { ListView } from './views/ListView';
import { MyTasksView } from './views/MyTasksView';
import { HomeView } from './views/HomeView';
import { TimelineView } from './views/TimelineView';
import { DailyFollowupView } from './views/DailyFollowupView';
import { SettingsView } from './views/SettingsView';
import { NotesView } from './views/NotesView';
import { InboxView } from './views/InboxView';
import { BudgetView } from './views/BudgetView';
import { CreateTaskDialog } from './components/CreateTaskDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from './components/ui/dropdown-menu';
import { Filter, Users } from 'lucide-react';
import { Toaster, toast } from 'sonner';

import { TaskSheet } from './components/TaskSheet';

function Dashboard() {
  const [activeTab, setActiveTab] = useState("board");
  const [showCompleted, setShowCompleted] = useState(true);
  const { activeView } = useWorkspace();

  return (
    <div className="flex h-screen bg-background overflow-hidden text-sm">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0 bg-white">
        <Header />
        
        {activeView === 'home' && (
          <div className="flex-1 overflow-hidden">
            <HomeView />
          </div>
        )}

        {activeView === 'my-tasks' && (
          <div className="flex-1 overflow-hidden">
            <MyTasksView />
          </div>
        )}

        {activeView === 'followup' && (
          <div className="flex-1 overflow-hidden">
            <DailyFollowupView />
          </div>
        )}

        {activeView === 'settings' && (
          <div className="flex-1 overflow-hidden">
            <SettingsView />
          </div>
        )}

        {activeView === 'inbox' && (
          <div className="flex-1 overflow-hidden">
            <InboxView />
          </div>
        )}

        {activeView === 'project' && (
          <div className="flex flex-col h-[calc(100vh-56px)]">
            <div className="px-6 pt-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <div className="flex items-center justify-between w-full">
                    <TabsList className="bg-transparent p-0 h-auto gap-4">
                      <TabsTrigger 
                        value="list" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 focus-visible:ring-0"
                      >
                        List
                      </TabsTrigger>
                      <TabsTrigger 
                        value="board" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 focus-visible:ring-0"
                      >
                        Board
                      </TabsTrigger>
                      <TabsTrigger 
                        value="timeline" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 focus-visible:ring-0"
                      >
                        Timeline
                      </TabsTrigger>
                      <TabsTrigger 
                        value="notes" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 focus-visible:ring-0"
                      >
                        Notes
                      </TabsTrigger>
                      <TabsTrigger 
                        value="budget" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 focus-visible:ring-0"
                      >
                        Budget
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
                
               <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="hidden border-dashed md:flex h-8" />}>
                      <Filter className="mr-2 h-3.5 w-3.5" />
                      Filter
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked={showCompleted} onCheckedChange={setShowCompleted}>
                        Show Completed Tasks
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="h-4 w-px bg-border mx-2" />
                  <CreateTaskDialog>
                    <Button size="sm" className="h-8">Add Task</Button>
                  </CreateTaskDialog>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-slate-50/50">
              {activeTab === 'board' && <BoardView showCompleted={showCompleted} />}
              {activeTab === 'list' && <ListView showCompleted={showCompleted} />}
              {activeTab === 'timeline' && <TimelineView />}
              {activeTab === 'notes' && <NotesView />}
              {activeTab === 'budget' && <BudgetView />}
            </div>
          </div>
        )}
      </div>
      <TaskSheet />
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <Dashboard />
      <Toaster />
    </WorkspaceProvider>
  );
}


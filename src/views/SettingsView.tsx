import React, { useState } from 'react';
import { useWorkspace } from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { InviteMemberDialog } from '../components/InviteMemberDialog';
import { Trash2, Key } from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';

export function SettingsView() {
  const { workspace, setWorkspace, activeProjectId, setActiveProjectId } = useWorkspace();
  const { changePassword } = useFirebase();
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = () => {
    setWorkspace(prev => ({ ...prev, name: workspaceName }));
    toast.success('Settings saved successfully');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      await changePassword(newPassword);
      toast.success('Password changed successfully');
      setNewPassword('');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to change password. You may need to log out and log back in.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRemoveMember = (id: string) => {
    setWorkspace(prev => ({
       ...prev,
       users: prev.users.filter(u => u.id !== id)
    }));
    toast.success('Member removed');
  }

  const handleDeleteProject = (projectId: string) => {
    if (workspace.projects.length <= 1) {
       toast.error('Cannot delete the last project.');
       return;
    }
    
    setWorkspace(prev => ({
       ...prev,
       projects: prev.projects.filter(p => p.id !== projectId),
       tasks: prev.tasks.filter(t => t.projectId !== projectId),
       notes: prev.notes.filter(n => n.projectId !== projectId)
    }));

    if (activeProjectId === projectId) {
       const remainingProjects = workspace.projects.filter(p => p.id !== projectId);
       if (remainingProjects.length > 0) {
          setActiveProjectId(remainingProjects[0].id);
       }
    }

    toast.success('Project deleted');
  }

  return (
    <div className="p-4 h-full overflow-auto bg-slate-50/50">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Master Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Workspace Profile</CardTitle>
              <CardDescription>Update your workspace details and branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace Name</Label>
                <Input 
                  id="ws-name" 
                  value={workspaceName} 
                  onChange={(e) => setWorkspaceName(e.target.value)} 
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Update your account password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword || !newPassword}>
                    <Key className="w-4 h-4 mr-2" />
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

           <div className="mt-6">
             <Card>
                <CardHeader>
                  <CardTitle>Manage Projects</CardTitle>
                  <CardDescription>View and manage all projects in the workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                     {workspace.projects.map(p => (
                        <div key={p.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                           <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                              <div>
                                 <div className="font-medium text-sm">{p.name} {p.id === activeProjectId && <span className="text-xs text-muted-foreground ml-2">(Active)</span>}</div>
                                 <div className="text-xs text-muted-foreground">{p.description}</div>
                              </div>
                           </div>
                           <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(p.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     ))}
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="mt-6">
             <Card>
                <CardHeader>
                  <CardTitle>Manage Team</CardTitle>
                  <CardDescription>Invite or remove members from your workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                     {workspace.users.map(u => (
                        <div key={u.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                           <div className="flex items-center gap-3">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-medium">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                 <div className="font-medium text-sm">{u.name} {u.id === workspace.currentUser.id && <span className="text-xs text-muted-foreground ml-2">(You)</span>}</div>
                                 <div className="text-xs text-muted-foreground">{u.email}</div>
                              </div>
                           </div>
                           {u.id !== workspace.currentUser.id && (
                             <Button variant="outline" size="sm" onClick={() => handleRemoveMember(u.id)} className="text-destructive hover:bg-destructive/10">Remove</Button>
                           )}
                           {u.id === workspace.currentUser.id && (
                              <Button variant="secondary" size="sm" disabled>Owner</Button>
                           )}
                        </div>
                     ))}
                     <InviteMemberDialog>
                       <Button className="w-full mt-4" variant="secondary">Add Member</Button>
                     </InviteMemberDialog>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useWorkspace } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import { FileText, Trash2 } from 'lucide-react';

export function NotesView() {
  const { workspace, activeProjectId, addNote, deleteNote } = useWorkspace();
  const notes = (workspace.notes || []).filter(n => n.projectId === activeProjectId);

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // Simulate basic tagging (finding @Names)
    const taggedUserIds: string[] = [];
    workspace.users.forEach(u => {
      const tag = `@${u.name.split(' ')[0]}`; // check against first name
      if (content.includes(tag)) {
        taggedUserIds.push(u.id);
      }
    });

    addNote({
      title,
      content,
      projectId: activeProjectId,
      authorId: workspace.currentUser.id,
      taggedUserIds
    });

    toast.success('Note added successfully');
    setTitle('');
    setContent('');
    setIsCreating(false);
  };

  return (
    <div className="p-4 h-full overflow-auto bg-slate-50/50">
      <div className="max-w-4xl mx-auto space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
             <div>
                <h2 className="text-2xl font-semibold mb-1">Project Notes & Minutes</h2>
                <p className="text-muted-foreground text-sm">Capture meeting minutes and daily discussions. Tag people using @FirstName.</p>
             </div>
          </div>

          <Card className="border-primary bg-primary/5 shadow-sm">
            <form onSubmit={handleCreate}>
               <CardContent className="pt-6 space-y-4">
                  <Input 
                    placeholder="Meeting Title / Topic" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="bg-background text-lg font-semibold border-none shadow-none h-12 focus-visible:ring-1"
                  />
                  <Textarea 
                    placeholder="Write minutes or discussion notes... (Use @Name to tag someone)" 
                    value={content} 
                    onChange={e => setContent(e.target.value)}
                    rows={4}
                    className="bg-background border-none shadow-none focus-visible:ring-1 resize-y min-h-[100px]"
                  />
                  <div className="flex justify-end pt-2 border-t mt-4 border-border/50">
                     <Button type="submit" disabled={!title.trim() || !content.trim()} className="px-6 relative top-2">Save Note</Button>
                  </div>
               </CardContent>
            </form>
          </Card>

          <div className="space-y-4 pb-20 mt-8">
             {notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(note => {
               const author = workspace.users.find(u => u.id === note.authorId);
               return (
                 <Card key={note.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 py-3 px-4 border-b">
                      <div className="flex items-center justify-between">
                         <CardTitle className="text-base">{note.title}</CardTitle>
                         <div className="flex items-center gap-2">
                           <div className="text-xs text-muted-foreground mr-2">{format(new Date(note.createdAt), 'MMM d, h:mm a')}</div>
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0" onClick={() => {
                              if(window.confirm('Delete this note?')) {
                                deleteNote(note.id);
                                toast.success('Note deleted');
                              }
                           }}>
                              <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="prose prose-sm max-w-none mb-4 whitespace-pre-wrap text-foreground/90">
                         {note.content}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                         <div className="flex items-center gap-2">
                            {author && (
                               <>
                                 <Avatar className="w-5 h-5"><AvatarImage src={author.avatar} /><AvatarFallback>{author.name[0]}</AvatarFallback></Avatar>
                                 <span className="text-xs text-muted-foreground">Added by {author.name}</span>
                               </>
                            )}
                         </div>

                         {note.taggedUserIds.length > 0 && (
                            <div className="flex items-center gap-2">
                               <span className="text-xs font-medium text-muted-foreground">Tagged:</span>
                               <div className="flex -space-x-2">
                                  {note.taggedUserIds.map(tId => {
                                      const u = workspace.users.find(u => u.id === tId);
                                      if (!u) return null;
                                      return (
                                        <Avatar key={u.id} className="w-6 h-6 border-2 border-background" title={u.name}>
                                          <AvatarImage src={u.avatar} />
                                          <AvatarFallback>{u.name[0]}</AvatarFallback>
                                        </Avatar>
                                      );
                                  })}
                               </div>
                            </div>
                         )}
                      </div>
                    </CardContent>
                 </Card>
               );
             })}

             {notes.length === 0 && !isCreating && (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                   <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                   <p className="font-medium">No notes yet</p>
                   <p className="text-sm">Start the first discussion or add meeting minutes.</p>
                </div>
             )}
          </div>
      </div>
    </div>
  );
}

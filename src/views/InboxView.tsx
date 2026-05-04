import React from 'react';
import { useWorkspace } from '../store';
import { Card, CardContent } from '../components/ui/card';
import { format } from 'date-fns';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export function InboxView() {
  const { workspace, markNotificationRead } = useWorkspace();
  const notifications = workspace.notifications || [];

  return (
    <div className="p-8 h-full overflow-auto space-y-8 bg-slate-50/50">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Inbox</h1>
          <Button variant="outline" size="sm" onClick={() => notifications.forEach(n => markNotificationRead(n.id))}>
            Mark all as read
          </Button>
        </div>
        
        <div className="space-y-4">
          {notifications.map(n => (
            <Card key={n.id} className={!n.read ? 'border-primary/50 bg-primary/5' : 'opacity-70'}>
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0">
                  <Bell className={`h-5 w-5 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base">{n.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-1">{n.description}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="icon" onClick={() => markNotificationRead(n.id)} className="shrink-0 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground hover:text-emerald-500" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
              <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="font-medium">You're all caught up!</p>
              <p className="text-sm">No new notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

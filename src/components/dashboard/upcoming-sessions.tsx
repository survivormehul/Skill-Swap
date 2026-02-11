import { sessions } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

export function UpcomingSessions() {
  const upcoming = sessions.filter(s => s.status === 'upcoming').slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
        <CardDescription>Your next scheduled skill-sharing sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcoming.map(session => (
            <div key={session.id} className="flex items-center gap-4 rounded-lg border p-3">
              <Avatar>
                <AvatarImage src={session.withUser.avatar} alt={session.withUser.name} />
                <AvatarFallback>{session.withUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="font-semibold">{session.skill}</p>
                <p className="text-sm text-muted-foreground">with {session.withUser.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(session.date, "EEE, MMM d 'at' h:mm a")}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
           {upcoming.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No upcoming sessions.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

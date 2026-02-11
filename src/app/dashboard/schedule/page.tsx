import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sessions } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock } from "lucide-react";

export default function SchedulePage() {
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  return (
    <div className="grid gap-8 md:grid-cols-3 w-full">
      <div className="md:col-span-2">
        <Card>
            <CardContent className="p-0">
                <Calendar
                    mode="single"
                    selected={new Date()}
                    className="w-full"
                />
            </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>My Schedule</CardTitle>
            <CardDescription>
              {format(new Date(), "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions.length > 0 ? upcomingSessions.map(session => (
              <div key={session.id} className="flex items-start gap-4 rounded-lg border p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.withUser.avatar} alt={session.withUser.name} />
                  <AvatarFallback>{session.withUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold">{session.skill}</p>
                  <p className="text-sm text-muted-foreground">with {session.withUser.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {format(session.date, "h:mm a")} - {format(new Date(session.date.getTime() + session.duration * 60000), "h:mm a")}
                  </p>
                </div>
                <Badge variant={session.status === 'upcoming' ? 'default' : 'secondary'} className="capitalize bg-primary/10 text-primary">
                  {session.status}
                </Badge>
              </div>
            )) : (
              <div className="text-center text-muted-foreground py-12">
                No upcoming sessions.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

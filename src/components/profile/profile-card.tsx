
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ProfileCardProps {
  fullName?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  sessions: number;
  teachingCount: number;
  learningCount: number;
  skillsToShare: string[];
  skillsToLearn: string[];
}

export function ProfileCard({
  fullName,
  location,
  avatarUrl,
  sessions,
  teachingCount,
  learningCount,
}: ProfileCardProps) {
    const fallbackInitial = fullName ? fullName.charAt(0).toUpperCase() : 'U';
  return (
    <Card>
      <CardContent className="p-8 flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24 text-3xl">
          <AvatarImage src={avatarUrl || ''} alt={fullName || 'User'} />
          <AvatarFallback>{fallbackInitial}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold font-headline">{fullName}</h2>
          <p className="text-muted-foreground">{location || 'Location not set'}</p>
        </div>
        <div className="flex justify-around w-full pt-2 border-t border-border">
            <div className="text-center">
                <p className="font-bold text-xl font-headline">{teachingCount}</p>
                <p className="text-sm text-muted-foreground">Teaching</p>
            </div>
             <div className="text-center">
                <p className="font-bold text-xl font-headline">{sessions}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center">
                <p className="font-bold text-xl font-headline">{learningCount}</p>
                <p className="text-sm text-muted-foreground">Learning</p>
            </div>
        </div>
        <Separator className="my-4" />
        {/* Detailed skill lists removed as per user request to show counts instead */}
      </CardContent>
    </Card>
  );
}

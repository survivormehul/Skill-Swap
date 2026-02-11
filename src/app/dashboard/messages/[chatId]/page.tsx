
'use client';

import { useUser } from '@/firebase';
import { ChatClient } from '@/components/messages/chat-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent className="flex-grow space-y-4 p-4 overflow-y-auto">
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-48 rounded-lg" />
            </div>
            <div className="flex items-center gap-2 justify-end">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </CardContent>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>Please log in to view messages.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <ChatClient chatId={chatId} currentUserId={user.uid} />
  );
}

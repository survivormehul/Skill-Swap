'use client';

import { useUser } from '@/firebase';
import { ConversationsList } from '@/components/messages/conversations-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesPage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-6 w-6" />
                        Conversations
                    </CardTitle>
                    <CardDescription>
                        Loading your recent conversations...
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-2">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }
    
    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Authentication Required</CardTitle>
                    <CardDescription>Please log in to view your messages.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" />
                    My Conversations
                </CardTitle>
                <CardDescription>
                    Select a conversation to start messaging.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ConversationsList currentUserId={user.uid} />
            </CardContent>
        </Card>
    );
}

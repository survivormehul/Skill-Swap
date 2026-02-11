'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

type Conversation = {
    id: string;
    participants: string[];
    participantDetails: {
        [key: string]: {
            name: string;
            avatar: string;
        }
    };
    lastMessage: string | null;
    lastMessageTimestamp: any;
}

export function ConversationsList({ currentUserId }: { currentUserId: string }) {
    const firestore = useFirestore();

    const conversationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'chats'),
            where('participants', 'array-contains', currentUserId)
        );
    }, [firestore, currentUserId]);

    const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-2">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (!conversations || conversations.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p>No conversations yet.</p>
                <p>Find a match and send a message to start a conversation!</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {conversations.map(convo => {
                const otherParticipantId = convo.participants.find(p => p !== currentUserId);
                if (!otherParticipantId) return null; // Should not happen in a valid chat

                const otherParticipantDetails = convo.participantDetails[otherParticipantId];

                return (
                    <Link href={`/dashboard/messages/${convo.id}`} key={convo.id}>
                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={otherParticipantDetails?.avatar} />
                                <AvatarFallback>{otherParticipantDetails?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-semibold">{otherParticipantDetails?.name || 'Unknown User'}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {convo.lastMessage || "No messages yet"}
                                </p>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    );
}


'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, getDocs, documentId } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users } from 'lucide-react';
import { ConnectionCard } from './connection-card';
import { useEffect, useState } from 'react';

type UserData = {
    id: string;
    fullName: string;
    avatar?: string;
    bio?: string;
}

type Connection = {
    id: string;
    chatId: string;
    name: string;
    avatar: string;
    bio?: string;
};

export function ConnectionsClient() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentUserDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: currentUserData, isLoading: isCurrentUserDataLoading } = useDoc<{ connections: string[] }>(currentUserDocRef);

    useEffect(() => {
        const fetchConnections = async () => {
            if (isUserLoading || isCurrentUserDataLoading || !currentUserData || !firestore || !user) {
                if(!isUserLoading && !isCurrentUserDataLoading) {
                    setIsLoading(false);
                }
                return;
            }

            const connectionIds = currentUserData.connections || [];

            if (connectionIds.length === 0) {
                setConnections([]);
                setIsLoading(false);
                return;
            }
            
            // 1. Fetch user data for all connections
            const usersQuery = query(collection(firestore, 'users'), where(documentId(), 'in', connectionIds));
            const usersSnapshot = await getDocs(usersQuery);
            const connectionUsers = usersSnapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = { id: doc.id, ...doc.data() } as UserData;
                return acc;
            }, {} as Record<string, UserData>);

            // 2. Fetch all chats for the current user to find chatIds
            const chatsQuery = query(collection(firestore, 'chats'), where('participants', 'array-contains', user.uid));
            const chatsSnapshot = await getDocs(chatsQuery);
            const userChats = chatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 3. Map connections to their chatIds
            const finalConnections: Connection[] = connectionIds.map(id => {
                const connUser = connectionUsers[id];
                if (!connUser) return null;

                const chat = userChats.find(c => c.participants.includes(id));
                
                return {
                    id,
                    chatId: chat?.id || '',
                    name: connUser.fullName || 'Unnamed User',
                    avatar: connUser.avatar || '',
                    bio: connUser.bio || "This user hasn't added a bio yet."
                };
            }).filter((c): c is Connection => Boolean(c) && Boolean(c.chatId));

            setConnections(finalConnections);
            setIsLoading(false);
        };

        fetchConnections();

    }, [currentUserData, isCurrentUserDataLoading, firestore, user, isUserLoading]);


    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-5/6 mt-2" />
                        </CardContent>
                        <CardContent>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    My Connections
                </CardTitle>
                <CardDescription>
                    Here are the people you have started a conversation with.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {connections && connections.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {connections.map(conn => (
                            <ConnectionCard key={conn.id} connection={conn} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                        <Users className="h-12 w-12 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Connections Yet</h3>
                        <p>Find a match and send a message to make your first connection.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, addDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

type Message = {
    id: string;
    text: string;
    senderId: string;
    timestamp: any;
};

type ChatClientProps = {
    chatId: string;
    currentUserId: string;
};

export function ChatClient({ chatId, currentUserId }: ChatClientProps) {
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'chats', chatId) : null, [firestore, chatId]);
    const { data: chatData, isLoading: isChatLoading } = useDoc(chatDocRef);

    const messagesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    }, [firestore, chatId]);

    const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
    
    const otherParticipantId = chatData?.participants.find((p: string) => p !== currentUserId);
    const otherParticipantDetails = chatData?.participantDetails?.[otherParticipantId];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !firestore) return;

        const messagesColRef = collection(firestore, 'chats', chatId, 'messages');
        const messageText = newMessage;
        setNewMessage('');

        // 1. Add the new message to the messages sub-collection
        await addDoc(messagesColRef, {
            text: messageText,
            senderId: currentUserId,
            timestamp: serverTimestamp(),
        });
        
        // 2. Update the last message on the parent chat document
        if (chatDocRef) {
            await updateDoc(chatDocRef, {
                lastMessage: messageText,
                lastMessageTimestamp: serverTimestamp()
            });
        }
    };

    const isLoading = isChatLoading || areMessagesLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col h-[calc(100vh-10rem)] w-full">
              <Card className="flex flex-col flex-grow">
                <CardHeader className="flex flex-row items-center gap-4 border-b p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4 p-4 overflow-y-auto">
                  <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-10 w-48 rounded-lg" />
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                      <Skeleton className="h-10 w-48 rounded-lg" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                   <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-16 w-64 rounded-lg" />
                  </div>
                </CardContent>
                <CardContent className="p-4 border-t">
                  <div className="flex gap-2">
                      <Skeleton className="h-10 flex-grow" />
                      <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] w-full">
            <Card className="flex flex-col flex-grow">
                <CardHeader className="flex flex-row items-center gap-4 border-b p-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipantDetails?.avatar} />
                        <AvatarFallback>{otherParticipantDetails?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-bold font-headline">{otherParticipantDetails?.name || 'Chat'}</h2>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow p-4 overflow-y-auto bg-muted/20">
                    <div className="space-y-4">
                        {messages?.map(msg => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex items-end gap-3 max-w-md",
                                    msg.senderId === currentUserId ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                )}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={msg.senderId === currentUserId ? undefined : otherParticipantDetails?.avatar} />
                                    <AvatarFallback>{(msg.senderId === currentUserId ? 'You' : otherParticipantDetails?.name?.charAt(0)) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div
                                    className={cn(
                                        "rounded-lg px-4 py-2",
                                        msg.senderId === currentUserId
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-card border'
                                    )}
                                >
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardContent className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

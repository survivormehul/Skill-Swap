'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { User as AppUser } from "@/lib/types";
import { Lightbulb, MessageSquare, Sparkles, MapPin } from "lucide-react";
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, serverTimestamp, addDoc, getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type MatchCardProps = {
  user: AppUser & { matchedSkills: string[] };
};

export function MatchCard({ user: matchedUser }: MatchCardProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!currentUser || !firestore) {
        toast({ variant: 'destructive', title: 'You must be logged in to send a message.' });
        return;
    }
    setIsConnecting(true);

    const chatsRef = collection(firestore, 'chats');
    const participants = [currentUser.uid, matchedUser.id].sort(); // Sort UIDs to create a consistent chat ID

    const q = query(chatsRef, where('participants', '==', participants));

    try {
        const querySnapshot = await getDocs(q);
        let chatId: string;

        const currentUserDocRef = doc(firestore, 'users', currentUser.uid);

        if (querySnapshot.empty) {
            // No existing chat, create a new one

            // Get current user's full name
            const currentUserDocSnap = await getDoc(currentUserDocRef);
            const currentUserFullName = currentUserDocSnap.exists() ? currentUserDocSnap.data().fullName : (currentUser.displayName || currentUser.email);


            const newChatRef = await addDoc(chatsRef, {
                participants: participants,
                participantDetails: {
                    [currentUser.uid]: {
                        name: currentUserFullName,
                        avatar: currentUser.photoURL || ''
                    },
                    [matchedUser.id]: {
                        name: matchedUser.name,
                        avatar: matchedUser.avatar || '',
                        bio: matchedUser.bio || ''
                    }
                },
                lastMessage: `You are now connected with ${matchedUser.name}. Say hello!`,
                lastMessageTimestamp: serverTimestamp(),
            });
            chatId = newChatRef.id;
        } else {
            // Chat already exists
            chatId = querySnapshot.docs[0].id;
        }

        // Add the matched user to the current user's connections list
        await updateDoc(currentUserDocRef, {
          connections: arrayUnion(matchedUser.id)
        });
        
        toast({
            title: "Connection Successful!",
            description: `You are connected with ${matchedUser.name}. You can now access their learning materials and start a conversation.`,
        });

        router.push(`/dashboard/learning-materials`);

    } catch (error) {
        console.error("Error creating or finding chat:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start a conversation. Please try again.' });
    } finally {
        setIsConnecting(false);
    }
  };


  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={matchedUser.avatar} alt={matchedUser.name} />
          <AvatarFallback>{matchedUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="font-headline text-xl">{matchedUser.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{matchedUser.location || 'Not specified'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">{matchedUser.bio || 'No bio available.'}</p>
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary"/> Matched On</h4>
          <div className="flex flex-wrap gap-2">
            {matchedUser.matchedSkills.map(skill => (
              <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{skill}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500"/> Also Teaches</h4>
          <div className="flex flex-wrap gap-2">
            {matchedUser.skills.filter(s => !matchedUser.matchedSkills.includes(s)).slice(0, 4).map(skill => (
              <Badge key={skill} variant="outline">{skill}</Badge>
            ))}
             {matchedUser.skills.filter(s => !matchedUser.matchedSkills.includes(s)).length === 0 && (
                <p className='text-xs text-muted-foreground'>No other skills to show.</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button className="w-full" onClick={handleConnect} disabled={isConnecting}>
            <MessageSquare className='mr-2 h-4 w-4'/>
            {isConnecting ? 'Connecting...' : 'Connect & Message'}
        </Button>
      </CardFooter>
    </Card>
  );
}

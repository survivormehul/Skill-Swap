
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore } from '@/firebase';
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { MessageSquare } from "lucide-react";

type Connection = {
    id: string;
    chatId: string;
    name: string;
    avatar: string;
    bio?: string;
};

type ConnectionCardProps = {
  connection: Connection;
};

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const router = useRouter();

  const handleMessage = () => {
    if (connection.chatId) {
        router.push(`/dashboard/messages/${connection.chatId}`);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={connection.avatar} alt={connection.name} />
          <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <CardTitle className="font-headline text-xl truncate">{connection.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
            {connection.bio}
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleMessage} disabled={!connection.chatId}>
            <MessageSquare className='mr-2 h-4 w-4' />
            Message
        </Button>
      </CardFooter>
    </Card>
  );
}

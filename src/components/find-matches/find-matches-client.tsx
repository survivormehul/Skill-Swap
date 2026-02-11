
'use client';

import { useState, useTransition } from 'react';
import { WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { MatchCard } from './match-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, errorEmitter } from '@/firebase';
import { collection, doc, getDoc, getDocs, query, FirestoreError, DocumentData } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';

type MatchedUser = User & { matchedSkills: string[] };

const getCoreSkill = (skill: string) => {
  const match = skill.match(/(.*) \((.*)\)/);
  return match ? match[1].trim().toLowerCase() : skill.trim().toLowerCase();
};

export function FindMatchesClient() {
  const [isPending, startTransition] = useTransition();
  const [matches, setMatches] = useState<MatchedUser[] | null>(null);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const handleFindMatches = () => {
    if (isUserLoading || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to find matches.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const currentUserProfileRef = doc(firestore, `users/${user.uid}/profile`, 'main');
        const currentUserProfileSnap = await getDoc(currentUserProfileRef);

        if (!currentUserProfileSnap.exists()) {
          toast({
            variant: 'destructive',
            title: 'Profile Not Found',
            description: 'Please complete your profile before finding matches.',
          });
          return;
        }
        const currentUserLearnSkills = currentUserProfileSnap.data()?.skillsToLearn || [];

        if (currentUserLearnSkills.length === 0) {
          setMatches([]);
          toast({
            title: "No skills to learn!",
            description: "Add some skills you want to learn in your profile to find matches.",
          });
          return;
        }

        const usersQuery = query(collection(firestore, 'users'));
        const usersSnapshot = await getDocs(usersQuery);

        const allUsers = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as DocumentData))
          .filter(u => u.id !== user.uid);

        const profilePromises = allUsers.map(otherUser => 
          getDoc(doc(firestore, `users/${otherUser.id}/profile`, 'main'))
        );

        const profileSnapshots = await Promise.all(profilePromises);

        const foundMatches: MatchedUser[] = [];
        allUsers.forEach((otherUser, index) => {
            const otherUserProfileSnap = profileSnapshots[index];

            if (otherUserProfileSnap && otherUserProfileSnap.exists()) {
                const otherUserTeachSkills = otherUserProfileSnap.data()?.skillsToShare || [];
                
                const matchedSkills = currentUserLearnSkills.filter((learnSkill: string) => {
                  const coreLearnSkill = getCoreSkill(learnSkill);
                  return otherUserTeachSkills.some((teachSkill: string) => 
                    getCoreSkill(teachSkill) === coreLearnSkill
                  );
                });

                if (matchedSkills.length > 0) {
                  foundMatches.push({
                    id: otherUser.id,
                    name: otherUser.fullName || 'Unnamed User',
                    avatar: otherUser.avatar || '',
                    bio: otherUser.bio || 'No bio available.',
                    location: otherUser.location || 'Unknown location',
                    skills: otherUserTeachSkills,
                    interests: otherUserProfileSnap.data()?.skillsToLearn || [],
                    experience: [],
                    reviewsReceived: [],
                    matchedSkills: matchedSkills,
                  });
                }
            }
        });

        setMatches(foundMatches);
        toast({
          title: "We found your matches!",
          description: `We've found ${foundMatches.length} potential skill-sharing partners for you.`,
        });

      } catch (error) {
        console.error('An error occurred while finding matches:', error);
        if (error instanceof FirestoreError) {
           errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'users or users/{id}/profile',
            operation: 'list',
          }));
        } else {
            toast({
              variant: 'destructive',
              title: 'Oh no! Something went wrong.',
              description: "Failed to fetch matches. Please check the developer console for more details.",
            });
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      {matches === null && !isPending && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card text-center p-12 min-h-[400px]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <WandSparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-headline text-2xl font-semibold mb-2">Discover Your Perfect Skill Swap</h2>
          <p className="mb-6 max-w-md text-muted-foreground">Click the button to scan the community and find users who are teaching the skills you want to learn.</p>
          <Button size="lg" onClick={handleFindMatches} disabled={isPending || isUserLoading}>
            <WandSparkles className="mr-2 h-4 w-4" />
            Find My Matches
          </Button>
        </div>
      )}

      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="space-y-2 pt-4">
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {matches && matches.length > 0 && (
        <div className='flex flex-col gap-4'>
            <Button size="lg" onClick={handleFindMatches} disabled={isPending || isUserLoading} className='self-center'>
              <WandSparkles className="mr-2 h-4 w-4" />
              Refresh Matches
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map(user => (
                <MatchCard key={user.id} user={user} />
              ))}
            </div>
        </div>
      )}

      {matches && matches.length === 0 && !isPending && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card text-center p-12 min-h-[400px]">
          <h2 className="font-headline text-2xl font-semibold mb-2">No Matches Found</h2>
          <p className="mb-6 max-w-md text-muted-foreground">We couldn't find any suitable matches right now. Try adding more skills to your learning list or check back later!</p>
          <Button size="lg" onClick={handleFindMatches} disabled={isPending}>
            <WandSparkles className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

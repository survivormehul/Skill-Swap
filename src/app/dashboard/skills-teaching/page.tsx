
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SkillsTeachingPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const profileDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, `users/${authUser.uid}/profile`, 'main');
  }, [firestore, authUser]);

  const { data: profileData, isLoading: isProfileDataLoading } = useDoc(profileDocRef);

  const isLoading = isUserLoading || isProfileDataLoading;
  const skillsToShare = profileData?.skillsToShare || [];

  const handleRemoveSkill = async (skill: string) => {
    if (isLoading || !profileDocRef || !profileData || !firestore || !authUser) {
      if (!profileData) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Profile data not loaded yet. Please try again in a moment.',
        });
      }
      return;
    }

    try {
      // 1. Find and delete associated learning materials
      const materialsRef = collection(firestore, 'materials');
      const q = query(materialsRef, where('skill', '==', skill), where('uploadedBy', '==', authUser.uid));
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        deleteDocumentNonBlocking(doc.ref);
      });
      
      // 2. Remove the skill from the user's profile
      const updatedSkills = (profileData['skillsToShare'] || []).filter((s: string) => s !== skill);

      setDocumentNonBlocking(profileDocRef, {
        skillsToShare: updatedSkills,
      }, { merge: true });

      toast({
        title: 'Skill Removed',
        description: `"${skill}" and its associated materials have been removed.`,
      });

    } catch (error) {
        console.error("Error removing skill and materials: ", error);
        toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: 'Could not remove the skill and its materials. Please try again.',
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-cyan-400" />
          Skills You Can Teach
        </CardTitle>
        <CardDescription>
          Here is the list of all the skills you are offering to teach others on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-7 w-24 rounded-full" />
            ))}
          </div>
        ) : skillsToShare.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skillsToShare.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="text-base py-1 pl-3 pr-1 bg-primary/10 text-primary border-primary/20">
                {skill}
                <button onClick={() => handleRemoveSkill(skill)} className="ml-2 rounded-full hover:bg-primary/20 p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>No Skills to Teach Yet!</AlertTitle>
            <AlertDescription>
              You haven't added any skills to your teaching list. Go to the 'Skills' page to add some!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

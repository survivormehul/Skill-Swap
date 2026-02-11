
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SkillsLearningPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const profileDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, `users/${authUser.uid}/profile`, 'main');
  }, [firestore, authUser]);

  const { data: profileData, isLoading: isProfileDataLoading } = useDoc(profileDocRef);

  const isLoading = isUserLoading || isProfileDataLoading;
  const skillsToLearn = profileData?.skillsToLearn || [];

  const handleRemoveSkill = async (skill: string) => {
    if (isLoading || !profileDocRef || !profileData) {
      if (!profileData) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Profile data not loaded yet. Please try again in a moment.',
        });
      }
      return;
    }

    const updatedSkills = (profileData['skillsToLearn'] || []).filter((s: string) => s !== skill);

    setDocumentNonBlocking(profileDocRef, {
      skillsToLearn: updatedSkills,
    }, { merge: true });

    toast({
      title: 'Skill Removed',
      description: `"${skill}" has been removed from your list.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-lime-400" />
          Skills You Want to Learn
        </CardTitle>
        <CardDescription>
          Here is the list of all the skills you are interested in learning from others on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-7 w-24 rounded-full" />
            ))}
          </div>
        ) : skillsToLearn.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skillsToLearn.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="text-base py-1 pl-3 pr-1 bg-lime-400/10 text-lime-400 border-lime-400/20">
                {skill}
                <button onClick={() => handleRemoveSkill(skill)} className="ml-2 rounded-full hover:bg-lime-400/20 p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>No Skills to Learn Yet!</AlertTitle>
            <AlertDescription>
              You haven't added any skills to your learning list. Go to the 'Skills' page to add some!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

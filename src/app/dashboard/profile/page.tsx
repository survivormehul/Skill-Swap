
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ProfileCard } from '@/components/profile/profile-card';
import { ProfileEditor } from '@/components/profile/profile-editor';
import { PasswordChangeForm } from '@/components/profile/password-change-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser?.uid) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser?.uid]);

  const profileDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, `users/${authUser.uid}/profile`, 'main');
  }, [firestore, authUser]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  const { data: profileData, isLoading: isProfileDataLoading } = useDoc(profileDocRef);

  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.push('/login');
    }
  }, [isUserLoading, authUser, router]);

  const isLoading = isUserLoading || isUserDataLoading || isProfileDataLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
        <div className="lg:col-span-1 space-y-8">
          <Card className="p-6">
            <CardContent className="flex flex-col items-center space-y-4 p-0">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="text-center space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="w-full border-t border-border pt-4">
                <Skeleton className="h-5 w-48 mx-auto" />
              </div>
              <div className="flex justify-around w-full pt-2">
                  <div className="text-center"><Skeleton className="h-6 w-8 mx-auto"/><Skeleton className="h-4 w-16 mt-1"/></div>
                  <div className="text-center"><Skeleton className="h-6 w-8 mx-auto"/><Skeleton className="h-4 w-16 mt-1"/></div>
              </div>
              <div className="w-full border-t border-border pt-4 space-y-4">
                 {/* Skeletons for detailed lists removed */}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardContent className="p-8">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-8" />
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Not Authenticated</AlertTitle>
          <AlertDescription>Redirecting to login...</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const skillsToShare = profileData?.skillsToShare || [];
  const skillsToLearn = profileData?.skillsToLearn || [];
  const teachingCount = skillsToShare.length;
  const learningCount = skillsToLearn.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
      <div className="lg:col-span-1 space-y-8">
        <ProfileCard
          fullName={userData?.fullName || authUser.email}
          location={userData?.location}
          avatarUrl={authUser.photoURL}
          sessions={userData?.sessions || 0}
          teachingCount={teachingCount}
          learningCount={learningCount}
          skillsToShare={skillsToShare}
          skillsToLearn={skillsToLearn}
        />
      </div>
      <div className="lg:col-span-2 space-y-8">
        <ProfileEditor 
            userDocRef={userDocRef} 
            currentData={{
                fullName: userData?.fullName || '',
                location: userData?.location || '',
                bio: userData?.bio || '',
            }}
        />
        <PasswordChangeForm />
      </div>
    </div>
  );
}


'use client';

import { BookOpen, Calendar, Star, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';

export default function DashboardPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  const profileDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, `users/${authUser.uid}/profile`, 'main');
  }, [firestore, authUser]);

  const { data: profileData, isLoading: isProfileDataLoading } = useDoc(profileDocRef);

  const skillsToShareCount = profileData?.skillsToShare?.length || 0;
  const skillsToLearnCount = profileData?.skillsToLearn?.length || 0;
  
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/skills-teaching" prefetch={true}>
          <StatCard 
            title="Skills Offered"
            value={isProfileDataLoading ? '...' : String(skillsToShareCount)}
            icon={BookOpen}
            description="Total skills you can teach"
            color="text-cyan-400"
          />
        </Link>
        <Link href="/dashboard/skills-learning" prefetch={true}>
          <StatCard 
            title="Skills Learning"
            value={isProfileDataLoading ? '...' : String(skillsToLearnCount)}
            icon={TrendingUp}
            description="Total skills you are learning"
            color="text-lime-400"
          />
        </Link>
        <StatCard 
          title="Upcoming Sessions"
          value="0"
          icon={Calendar}
          description="Sessions scheduled this month"
          color="text-fuchsia-500"
        />
        <StatCard 
          title="Overall Rating"
          value="N/A"
          icon={Star}
          description="Based on 0 reviews"
          color="text-amber-400"
        />
      </div>
    </div>
  );
}

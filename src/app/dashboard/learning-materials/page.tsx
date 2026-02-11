'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpenCheck, FileText, Link as LinkIcon, Download } from 'lucide-react';
import type { LearningMaterial } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useMemo } from 'react';

type UserDoc = {
  connections?: string[];
};

type ProfileDoc = {
  skillsToLearn?: string[];
};

export default function LearningMaterialsPage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: userData, isLoading: isUserLoading } = useDoc<UserDoc>(userDocRef);
  const connections = userData?.connections;

  const profileDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, `users/${authUser.uid}/profile`, 'main');
  }, [firestore, authUser]);
  const { data: profileData, isLoading: isProfileLoading } = useDoc<ProfileDoc>(profileDocRef);
  const skillsToLearn = profileData?.skillsToLearn;

  const materialsQuery = useMemoFirebase(() => {
    if (!firestore || !connections || connections.length === 0) return null;
    return query(collection(firestore, 'materials'), where('uploadedBy', 'in', connections));
  }, [firestore, connections]);

  const { data: materials, isLoading: areMaterialsLoading } = useCollection<LearningMaterial>(materialsQuery);

  const filteredAndGroupedMaterials = useMemo(() => {
    if (!materials || !skillsToLearn) return {};

    const lowercasedSkillsToLearn = skillsToLearn.map(s => s.toLowerCase());

    const filtered = materials.filter(material => 
      material.skill && lowercasedSkillsToLearn.includes(material.skill.toLowerCase())
    );
    
    return filtered.reduce((acc, material) => {
      // Find the original skill name with its casing from the user's learn list to use as the group key.
      const originalSkill = skillsToLearn.find(s => s.toLowerCase() === material.skill.toLowerCase()) || material.skill;
      if (!acc[originalSkill]) {
        acc[originalSkill] = [];
      }
      acc[originalSkill].push(material);
      return acc;
    }, {} as Record<string, LearningMaterial[]>);
  }, [materials, skillsToLearn]);

  const isLoading = isAuthLoading || isUserLoading || isProfileLoading || areMaterialsLoading;
  
  const renderMaterialContent = (material: LearningMaterial) => {
    switch (material.type) {
      case 'link':
        return (
          <Button asChild variant="outline" size="sm">
            <a href={material.url} target="_blank" rel="noopener noreferrer">
              <LinkIcon className="mr-2 h-4 w-4" />
              Open Link
            </a>
          </Button>
        );
      case 'pdf':
        return (
          <Button asChild variant="outline" size="sm">
            <a href={material.fileData} download={material.url}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
        );
      case 'text':
        return (
            <p className="text-sm text-muted-foreground pt-2 border-t mt-2">{material.description}</p>
        );
      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Materials</CardTitle>
        <CardDescription>
          Here are the materials provided by your connections for the skills you want to learn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredAndGroupedMaterials && Object.keys(filteredAndGroupedMaterials).length > 0 ? (
          <Accordion type="single" collapsible className="w-full" defaultValue={Object.keys(filteredAndGroupedMaterials)[0]}>
            {Object.entries(filteredAndGroupedMaterials).map(([skill, skillMaterials]) => (
              <AccordionItem value={skill} key={skill}>
                <AccordionTrigger className="font-semibold text-lg">{skill}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 pt-4 md:grid-cols-2">
                    {skillMaterials.map(material => (
                      <Card key={material.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                {material.type === 'text' && <FileText className="h-4 w-4" />}
                                {material.type === 'pdf' && <Download className="h-4 w-4" />}
                                {material.type === 'link' && <LinkIcon className="h-4 w-4" />}
                                {material.title}
                            </CardTitle>
                          <CardDescription className="line-clamp-2">{material.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderMaterialContent(material)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <BookOpenCheck className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Materials Available</h3>
            <p>Once you connect with a teacher for a skill you want to learn,</p>
            <p>their materials will appear here.</p>
             <Button asChild variant="default" className="mt-4">
                <Link href="/dashboard/find-matches">Find Matches</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

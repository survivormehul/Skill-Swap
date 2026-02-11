
'use client';
import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Lightbulb, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { exploreSkills } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const skillCategories = [...new Set(exploreSkills.map(skill => skill.category))];

type MaterialType = 'pdf' | 'text' | 'link';

export default function SkillsPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [newSkillToTeach, setNewSkillToTeach] = useState('');
  
  const [isLearnSkillDialogOpen, setIsLearnSkillDialogOpen] = useState(false);
  const [newLearnSkillName, setNewLearnSkillName] = useState('');
  const [newLearnSkillCategory, setNewLearnSkillCategory] = useState('');

  const [materialDetails, setMaterialDetails] = useState({ title: '', description: '', type: 'link' as MaterialType, url: '', fileData: '' });
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [teachCategory, setTeachCategory] = useState('');


  const profileDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, `users/${authUser.uid}/profile`, 'main');
  }, [firestore, authUser]);

  const { data: profileData, isLoading: isProfileDataLoading } = useDoc(profileDocRef);

  const isLoading = isUserLoading || isProfileDataLoading;

  const handleOpenMaterialDialog = () => {
    if (!newSkillToTeach.trim()) {
      toast({
        variant: 'destructive',
        title: 'Skill Name Required',
        description: 'Please enter a skill you want to teach before proceeding.',
      });
      return;
    }
    setMaterialDetails({ title: '', description: '', type: 'link', url: '', fileData: '' });
    setTeachCategory(''); // Reset category when opening dialog
    setIsMaterialDialogOpen(true);
  };
  
  const handleAddSkillAndMaterial = async () => {
    if (isLoading || !newSkillToTeach.trim() || !teachCategory || !profileDocRef) {
      if (!newSkillToTeach.trim()) {
        toast({ variant: 'destructive', title: 'Skill Name Required', description: 'Please enter a skill name in the dialog.' });
      } else if (!teachCategory) {
        toast({ variant: 'destructive', title: 'Category Required', description: 'Please select a category in the dialog.' });
      } else if (!profileData) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Profile data not loaded yet. Please try again in a moment.',
        });
      }
      return;
    }

    const fullSkill = `${newSkillToTeach.trim()} (${teachCategory})`;
    
    // Check if skill already exists
    if (profileData?.skillsToShare?.includes(fullSkill)) {
      toast({
        variant: 'destructive',
        title: 'Skill Already Exists',
        description: `You've already added "${fullSkill}" to this list.`,
      });
      return;
    }

    // 1. Add skill to user's profile
    const updatedSkills = [...(profileData?.skillsToShare || []), fullSkill];
    setDocumentNonBlocking(profileDocRef, {
      skillsToShare: updatedSkills,
    }, { merge: true });

    // 2. Add learning material to 'materials' collection
    const hasContent = materialDetails.title && (materialDetails.url || materialDetails.fileData);
    if (hasContent && firestore && authUser) {
        const materialsCollectionRef = collection(firestore, 'materials');
        const newMaterial = {
            title: materialDetails.title,
            description: materialDetails.description,
            skill: fullSkill,
            type: materialDetails.type,
            url: materialDetails.url,
            fileData: materialDetails.type === 'pdf' ? materialDetails.fileData : '',
            uploadedBy: authUser.uid,
            uploadedAt: serverTimestamp(),
        };
        addDocumentNonBlocking(materialsCollectionRef, newMaterial);
    }
    
    toast({
      title: 'Skill Added',
      description: `"${fullSkill}" and its learning material have been added.`,
    });

    setNewSkillToTeach('');
    setTeachCategory('');
    setIsMaterialDialogOpen(false);
  };

  const handleOpenLearnSkillDialog = () => {
    if (!newLearnSkillName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Skill Name Required',
        description: 'Please enter a skill you want to learn.',
      });
      return;
    }
    setNewLearnSkillCategory('');
    setIsLearnSkillDialogOpen(true);
  };

  const handleAddSkillToLearn = async () => {
    if (isLoading || !newLearnSkillName.trim() || !newLearnSkillCategory || !profileDocRef) {
        if (!newLearnSkillName.trim()) {
            toast({ variant: 'destructive', title: 'Skill Required', description: 'Please enter a skill.' });
        } else if (!newLearnSkillCategory) {
            toast({ variant: 'destructive', title: 'Category Required', description: 'Please select a category.' });
        }
      return;
    }
    
    const fullSkill = `${newLearnSkillName.trim()} (${newLearnSkillCategory})`;
    
    // Check if skill already exists
    const currentSkills = profileData?.skillsToLearn || [];
    if (currentSkills.includes(fullSkill)) {
      toast({
        variant: 'destructive',
        title: 'Skill Already Exists',
        description: `You've already added "${fullSkill}" to this list.`,
      });
      return;
    }

    const updatedSkills = [...currentSkills, fullSkill];

    setDocumentNonBlocking(profileDocRef, {
      skillsToLearn: updatedSkills,
    }, { merge: true });

    toast({
      title: 'Skill Added',
      description: `"${fullSkill}" has been added to your list.`,
    });

    setNewLearnSkillName('');
    setNewLearnSkillCategory('');
    setIsLearnSkillDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setMaterialDetails(prev => ({ ...prev, fileData: base64String, url: file.name }));
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Skills You Can Teach</CardTitle>
              <CardDescription>Add the skills you're proficient in and willing to share with others.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  value={newSkillToTeach}
                  onChange={(e) => setNewSkillToTeach(e.target.value)}
                  placeholder="e.g., Python Programming"
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenMaterialDialog()}
                  disabled={isLoading}
                  className="flex-grow"
                />
                <Button onClick={handleOpenMaterialDialog} disabled={isLoading || !newSkillToTeach} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4"/> Add</Button>
              </div>
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertTitle>View Your Teaching Skills</AlertTitle>
                <AlertDescription>
                  To view or remove the skills you are teaching, please visit the <Link href="/dashboard/skills-teaching" className="underline font-semibold">Skills Teaching page</Link>.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-lime-400"/> Skills You Want to Learn</CardTitle>
              <CardDescription>List the skills you're eager to learn from others on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  value={newLearnSkillName}
                  onChange={(e) => setNewLearnSkillName(e.target.value)}
                  placeholder="e.g., Public Speaking"
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenLearnSkillDialog()}
                  disabled={isLoading}
                  className="flex-grow"
                />
                <Button onClick={handleOpenLearnSkillDialog} disabled={isLoading || !newLearnSkillName} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4"/> Add</Button>
              </div>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>View Your Learning Skills</AlertTitle>
                <AlertDescription>
                  To view or remove the skills you want to learn, please visit the <Link href="/dashboard/skills-learning" className="underline font-semibold">Skills Learning page</Link>.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

         <Card>
          <CardHeader>
            <CardTitle>Explore New Skills</CardTitle>
            <CardDescription>Get inspired by these introductory videos to popular skills.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exploreSkills.map((item) => (
              <div key={item.title} className="space-y-3">
                <div className="overflow-hidden rounded-lg">
                  <iframe
                      src={`https://www.youtube.com/embed/${item.youtubeId}`}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video w-full"
                  ></iframe>
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Add Skill and Learning Material</DialogTitle>
            <DialogDescription>
                Provide a category for your skill and content for learners. This will be shared with users you match with.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skill-name" className="text-right">
                Skill
                </Label>
                <Input
                id="skill-name"
                value={newSkillToTeach}
                onChange={(e) => setNewSkillToTeach(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Python Programming"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skill-category" className="text-right">
                Category
                </Label>
                <Select value={teachCategory} onValueChange={setTeachCategory}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {skillCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="material-title" className="text-right">
                Material Title
                </Label>
                <Input
                id="material-title"
                value={materialDetails.title}
                onChange={(e) => setMaterialDetails(prev => ({...prev, title: e.target.value}))}
                className="col-span-3"
                placeholder="e.g., Intro to Python"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="material-desc" className="text-right">
                Description
                </Label>
                <Textarea
                id="material-desc"
                value={materialDetails.description}
                onChange={(e) => setMaterialDetails(prev => ({...prev, description: e.target.value}))}
                className="col-span-3"
                placeholder="A brief overview of the material."
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="material-type" className="text-right">
                Type
                </Label>
                <Select
                    value={materialDetails.type}
                    onValueChange={(value) => setMaterialDetails(prev => ({ ...prev, type: value as MaterialType, url: '', fileData: '' }))}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="material-url" className="text-right">
                {materialDetails.type === 'pdf' ? 'File' : 'URL'}
                </Label>
                {materialDetails.type === 'pdf' ? (
                    <Input
                    id="material-file"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="col-span-3"
                    />
                ) : (
                    <Input
                    id="material-url"
                    value={materialDetails.url || ''}
                    onChange={(e) => setMaterialDetails(prev => ({...prev, url: e.target.value}))}
                    className="col-span-3"
                    placeholder="https://example.com/..."
                    />
                )}
            </div>
            </div>
            <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">
                Cancel
                </Button>
            </DialogClose>
            <Button type="button" onClick={handleAddSkillAndMaterial}>Save Skill & Material</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isLearnSkillDialogOpen} onOpenChange={setIsLearnSkillDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Skill to Learn</DialogTitle>
            <DialogDescription>
              Tell us what you want to learn. Select a name and a category for the new skill.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="learn-skill-name" className="text-right">
                Skill
              </Label>
              <Input
                id="learn-skill-name"
                value={newLearnSkillName}
                onChange={(e) => setNewLearnSkillName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Public Speaking"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="learn-skill-category" className="text-right">
                Category
              </Label>
              <Select value={newLearnSkillCategory} onValueChange={setNewLearnSkillCategory}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                      {skillCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleAddSkillToLearn}>Add Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    
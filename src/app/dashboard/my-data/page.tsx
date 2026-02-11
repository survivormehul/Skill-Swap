
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { LearningMaterial } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookUp, Trash2, Edit, DatabaseZap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { MaterialEditorDialog } from '@/components/my-data/material-editor-dialog';

export default function MyDataPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);

  const materialsQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(collection(firestore, 'materials'), where('uploadedBy', '==', authUser.uid));
  }, [firestore, authUser]);

  const { data: materials, isLoading: areMaterialsLoading } = useCollection<LearningMaterial>(materialsQuery);

  const handleDelete = (materialId: string) => {
    if (!firestore) return;
    const materialRef = doc(firestore, 'materials', materialId);
    deleteDocumentNonBlocking(materialRef);
    toast({
      title: 'Material Deleted',
      description: 'The learning material has been successfully removed.',
    });
  };

  const isLoading = isUserLoading || areMaterialsLoading;

  return (
    <>
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseZap className="h-6 w-6" />
              My Data
            </CardTitle>
            <CardDescription>
              Review, edit, or delete the learning materials you have uploaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                    <CardContent className="flex justify-end gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : materials && materials.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {materials.map(material => (
                  <Card key={material.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{material.title}</CardTitle>
                      <CardDescription>Skill: {material.skill}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">{material.description}</p>
                    </CardContent>
                    <CardContent className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingMaterial(material)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the learning material
                              &quot;{material.title}&quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(material.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <BookUp className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Materials Uploaded</h3>
                <p>You haven&apos;t added any learning materials yet.</p>
                <p>Add a skill you can teach to upload your first material.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {editingMaterial && (
        <MaterialEditorDialog
          material={editingMaterial}
          isOpen={!!editingMaterial}
          onOpenChange={(isOpen) => !isOpen && setEditingMaterial(null)}
        />
      )}
    </>
  );
}


'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { LearningMaterial } from '@/lib/types';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { exploreSkills } from '@/lib/data';
import { useEffect, useState } from 'react';

const skillCategories = [...new Set(exploreSkills.map(skill => skill.category))];

const materialSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  skillName: z.string().min(1, 'Skill name is required'),
  skillCategory: z.string().min(1, 'Category is required'),
  type: z.enum(['pdf', 'text', 'link']),
  url: z.string().optional(),
  fileData: z.string().optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;
type MaterialType = 'pdf' | 'text' | 'link';

interface MaterialEditorDialogProps {
  material: LearningMaterial;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialEditorDialog({ material, isOpen, onOpenChange }: MaterialEditorDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [materialType, setMaterialType] = useState<MaterialType>(material.type as MaterialType || 'link');

  const extractSkillAndCategory = (fullSkill: string) => {
    const match = fullSkill.match(/(.*) \((.*)\)/);
    if (match) {
      return { skillName: match[1], skillCategory: match[2] };
    }
    return { skillName: fullSkill, skillCategory: '' };
  };

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: material.title || '',
      description: material.description || '',
      skillName: extractSkillAndCategory(material.skill).skillName,
      skillCategory: extractSkillAndCategory(material.skill).skillCategory,
      type: material.type as MaterialType || 'link',
      url: material.url || '',
      fileData: material.fileData || '',
    },
  });

  useEffect(() => {
    if (material) {
        const { skillName, skillCategory } = extractSkillAndCategory(material.skill);
        const type = material.type as MaterialType || 'link';
        setMaterialType(type);
        form.reset({
            title: material.title || '',
            description: material.description || '',
            skillName: skillName,
            skillCategory: skillCategory,
            type: type,
            url: material.url || '',
            fileData: material.fileData || '',
        });
    }
  }, [material, form]);

  const {
    formState: { isSubmitting },
    handleSubmit,
    reset,
    setValue,
  } = form;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setValue('fileData', base64String);
        setValue('url', file.name);
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

  const onSubmit = async (data: MaterialFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }
    
    const materialRef = doc(firestore, 'materials', material.id);
    const fullSkill = `${data.skillName} (${data.skillCategory})`;
    
    const updateData: Partial<LearningMaterial> = {
        title: data.title,
        description: data.description,
        skill: fullSkill,
        type: data.type,
        url: data.url,
        fileData: data.type === 'pdf' ? data.fileData : '', // Clear file data if not a PDF
    };
    
    updateDocumentNonBlocking(materialRef, updateData);
    
    toast({
      title: 'Material Updated',
      description: 'Your learning material has been successfully updated.',
    });
    onOpenChange(false);
  };
  
  const handleClose = (open: boolean) => {
    if(!open) {
      reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Learning Material</DialogTitle>
          <DialogDescription>Update the details for your material. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Introduction to React Hooks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief overview of the material." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="skillName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Skill</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., React" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="skillCategory"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {skillCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={(value) => { field.onChange(value); setMaterialType(value as MaterialType); }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a material type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
                <FormLabel>{materialType === 'pdf' ? 'File' : 'URL'}</FormLabel>
                <FormControl>
                    {materialType === 'pdf' ? (
                        <Input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        />
                    ) : (
                        <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <Input placeholder="https://example.com/..." {...field} value={field.value || ''} />
                        )}
                        />
                    )}
                </FormControl>
                <FormMessage />
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

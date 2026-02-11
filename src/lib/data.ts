
import type { User, Session, SkillProgress, Review } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const users: User[] = [];

export const sessions: Session[] = [];

export const skillProgress: SkillProgress[] = [];

export const currentUser: User | null = null;

export const exploreSkills = [
    {
      title: 'Python Full Course',
      category: 'Programming',
      youtubeId: 'XKHEtdqhLK8',
    },
    {
      title: 'Canva Basics',
      category: 'Graphic Design',
      youtubeId: 'J0jE0OsF1zo',
    },
    {
      title: 'Speak with Confidence !',
      category: 'Public Speaking',
      youtubeId: 'eIho2S0ZahI',
    },
    {
      title: 'Basics for Guitar',
      category: 'Music',
      youtubeId: 'NmqBE_C52j8',
    },
    {
      title: 'Basic Financial Planning',
      category: 'Finance',
      youtubeId: 'AkMTxMN7res',
    },
    {
      title: 'Figma UI/UX Design Basics',
      category: 'UI/UX Design',
      youtubeId: '1SNZRCVNizg',
    },
    {
      title: 'Digital Marketing For Beginners',
      category: 'Marketing',
      youtubeId: 'nU-IIXBWlS4',
    },
    {
      title: 'Cooking Basics',
      category: 'Cooking',
      youtubeId: 'J7g-33Gj3wA',
    },
    {
      title: 'Yoga For Beginners',
      category: 'Health & Wellness',
      youtubeId: 'v7AYKMP6rOE',
    },
    {
      title: 'Photography Basics',
      category: 'Photography',
      youtubeId: 'VArISvUuyr0',
    }
  ];




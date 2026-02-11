
export type User = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  skills: string[];
  interests: string[];
  experience: { role: string; company: string; duration: string }[];
  reviewsReceived?: Review[];
  matchedSkills?: string[];
};

export type Session = {
  id: string;
  skill: string;
  withUser: User;
  date: Date;
  duration: number; // in minutes
  status: 'upcoming' | 'completed' | 'cancelled';
  isReviewed: boolean;
};

export type SkillProgress = {
  skill: string;
  progress: number; // percentage
  sessions: number;
};

export type Review = {
  id: string;
  fromUser: User;
  rating: number; // 1-5
  comment: string;
  date: Date;
};

export type LearningMaterial = {
    id: string;
    title: string;
    description: string;
    skill: string;
    type: string;
    url: string;
    fileData?: string;
    uploadedBy: string;
    uploadedAt: any; // Can be a server timestamp
};

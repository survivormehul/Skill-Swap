
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth, useUser } from '@/firebase';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const pathToTitle: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/dashboard/profile': 'Profile',
  '/dashboard/find-matches': 'Find Matches',
  '/dashboard/connections': 'My Connections',
  '/dashboard/skills': 'My Skills',
  '/dashboard/schedule': 'Schedule',
  '/dashboard/reviews': 'Feedback & Reviews',
  '/dashboard/progress': 'My Progress',
  '/dashboard/learning-materials': 'Learning Materials',
  '/dashboard/my-data': 'My Data',
  '/dashboard/skills-learning': 'Skills You Want to Learn',
  '/dashboard/skills-teaching': 'Skills You Can Teach',
  '/dashboard/messages': 'Messages',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { user } = useUser();
  const title = Object.keys(pathToTitle).find(key => pathname.startsWith(key)) ? pathToTitle[Object.keys(pathToTitle).find(key => pathname.startsWith(key))!] : 'Skill Swap';
  const { isMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Sign out from Firebase client-side
      await signOut(auth);

      // 2. Clear the server-side session cookie
      await fetch('/api/auth/session', { method: 'DELETE' });

      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });

      // 3. Redirect to login page
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An error occurred while logging out. Please try again.',
      });
    }
  };

  const showBackButton = pathname !== '/dashboard';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger className={cn(
        "md:hidden",
        !mounted && "hidden",
        isMobile && "md:hidden"
      )} />

      {showBackButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full transition-all duration-200 ease-in-out hover:bg-primary/10 hover:scale-110 active:scale-95" 
                onClick={() => router.back()}
              >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Back</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <h1 className="font-headline text-xl font-semibold sm:text-2xl">{title}</h1>
      
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
               <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

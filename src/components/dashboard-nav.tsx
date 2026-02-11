
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Star,
  Users,
  GitGraph,
  Lightbulb,
  User,
  BookCopy,
  Database,
  MessageSquare,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/skills', icon: Lightbulb, label: 'Skills' },
  { href: '/dashboard/learning-materials', icon: BookCopy, label: 'Learning Materials' },
  { href: '/dashboard/my-data', icon: Database, label: 'My Data' },
  { href: '/dashboard/find-matches', icon: Users, label: 'Find Matches' },
  { href: '/dashboard/connections', icon: Users, label: 'Connections' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/dashboard/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/dashboard/progress', icon: GitGraph, label: 'Progress' },
  { href: '/dashboard/reviews', icon: Star, label: 'Reviews' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toggleSidebar } = useSidebar();


  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  const isLoading = isUserLoading || isUserDataLoading;

  return (
    <>
      <SidebarHeader className="p-2">
        <div 
          onClick={toggleSidebar} 
          className="flex w-full items-center p-2 rounded-md hover:bg-sidebar-accent cursor-pointer"
          role="button"
          aria-label="Toggle Sidebar"
        >
          <Logo className="group-data-[state=collapsed]:justify-center" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} prefetch={true}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

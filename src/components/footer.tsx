import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="sticky bottom-4 mx-4 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between p-4 gap-4 rounded-lg border bg-card/80 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <p className="text-sm text-muted-foreground order-last sm:order-none">
          &copy; {currentYear} Skill Swap. All Rights Reserved.
        </p>
        <div className="flex items-center gap-2">
          {/* Social media icons removed as requested */}
        </div>
      </div>
    </footer>
  );
}

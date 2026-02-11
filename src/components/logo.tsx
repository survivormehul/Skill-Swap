import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <BrainCircuit className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">Skill Swap</h1>
    </div>
  );
}

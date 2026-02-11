
import { Button } from "@/components/ui/button";
import { BrainCircuit, GitGraph, Star, Users } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "AI-Powered Matching",
    description: "Our intelligent algorithm connects you with the perfect partners based on the skills you want to learn and teach.",
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-lime-400" />,
    title: "Skill Exchange",
    description: "Share your expertise and learn new things from a vibrant community of passionate individuals.",
  },
  {
    icon: <GitGraph className="h-10 w-10 text-cyan-400" />,
    title: "Track Your Progress",
    description: "Monitor your learning journey, complete sessions, and see how far you've come with our progress tracking tools.",
  },
  {
    icon: <Star className="h-10 w-10 text-amber-400" />,
    title: "Review & Grow",
    description: "Leave and receive feedback on sessions to help everyone in the community improve and grow their skills.",
  },
];


export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-primary via-fuchsia-400 to-amber-400 text-transparent bg-clip-text">
          Share a Skill, Gain a Skill
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
          Welcome to Skill Swap, the ultimate platform for collaborative learning. Connect with peers to teach what you know and learn what you don't, all powered by AI.
        </p>
        <Link href="/login">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 rounded-full shadow-lg transition-transform transform hover:scale-105">
            Get Started for Free
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border shadow-md hover:shadow-primary/20 hover:border-primary/40 transition-all duration-300">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="font-headline text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

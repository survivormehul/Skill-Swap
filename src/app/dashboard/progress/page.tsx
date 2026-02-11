import { skillProgress } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GitGraph } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {skillProgress.map(skill => (
        <Card key={skill.skill}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitGraph className="h-5 w-5 text-primary" />
              {skill.skill}
            </CardTitle>
            <CardDescription>{skill.sessions} sessions completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-sm font-bold font-headline">{skill.progress}%</p>
            </div>
            <Progress value={skill.progress} className="w-full" />
          </CardContent>
        </Card>
      ))}
       {skillProgress.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground py-16">
          <p>You are not tracking progress for any skills yet.</p>
          <p>Start a session to begin your learning journey!</p>
        </div>
      )}
    </div>
  );
}

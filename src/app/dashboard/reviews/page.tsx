
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function ReviewsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>
                    This feature is coming soon!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                    <Star className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Reviews Not Available</h3>
                    <p>The ability to give and receive reviews will be added in a future update.</p>
                </div>
            </CardContent>
        </Card>
    );
}

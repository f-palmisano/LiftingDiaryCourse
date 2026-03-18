import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutForm } from "./WorkoutForm";

export default function NewWorkoutPage() {
  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutForm />
        </CardContent>
      </Card>
    </div>
  );
}

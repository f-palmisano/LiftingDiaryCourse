import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWorkoutsForDate } from '@/data/workouts';
import CalendarNav from './CalendarNav';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selectedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : format(new Date(), 'yyyy-MM-dd');

  const workouts = await getWorkoutsForDate(selectedDate);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Dashboard</h1>

      <div className="mb-8">
        <CalendarNav selectedDate={new Date(`${selectedDate}T12:00:00`)} />
      </div>

      {workouts.length === 0 && (
        <p className="text-muted-foreground">No workouts logged for this date.</p>
      )}

      {workouts.map((workout) => (
        <Card key={workout.id} className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{workout.name ?? 'Workout'}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {format(new Date(workout.startedAt), 'HH:mm')}
                {workout.completedAt && (
                  <> – {format(new Date(workout.completedAt), 'HH:mm')}</>
                )}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {workout.workoutExercises.length === 0 && (
              <p className="text-sm text-muted-foreground">No exercises recorded.</p>
            )}

            {workout.workoutExercises.map((we) => (
              <div key={we.id} className="mb-4 last:mb-0">
                <h3 className="text-sm font-medium mb-2">{we.exercise.name}</h3>
                {we.sets.length > 0 && (
                  <table className="text-sm w-full">
                    <thead>
                      <tr className="text-left text-muted-foreground text-xs">
                        <th className="pb-1 pr-4">Set</th>
                        <th className="pb-1 pr-4">Reps</th>
                        <th className="pb-1">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {we.sets.map((s) => (
                        <tr key={s.id} className="border-t border-border">
                          <td className="py-1 pr-4">{s.setNumber}</td>
                          <td className="py-1 pr-4">{s.reps ?? '–'}</td>
                          <td className="py-1">{s.weightKg ?? '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </main>
  );
}

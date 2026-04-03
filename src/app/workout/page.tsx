import { WorkoutForm } from '@/components/workout/WorkoutForm'
import { WorkoutList } from '@/components/workout/WorkoutList'
import { getProfile } from '@/lib/supabase/queries/profiles'
import { getWorkoutLogs } from '@/lib/supabase/queries/workout'

function getToday() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return formatter.format(new Date())
}

export default async function WorkoutPage() {
  const today = getToday()
  const [{ data: logs, error: workoutError }, { data: profile, error: profileError }] =
    await Promise.all([getWorkoutLogs({ date: today }), getProfile()])

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Workout</h1>
        <p className="text-sm text-muted-foreground">
          오늘 운동 기록을 저장하고 칼로리 소모를 확인하세요.
        </p>
      </div>

      {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
      {workoutError ? <p className="text-sm text-destructive">{workoutError}</p> : null}

      <WorkoutForm defaultDate={today} hasProfile={Boolean(profile)} />
      <WorkoutList logs={logs} />
    </main>
  )
}

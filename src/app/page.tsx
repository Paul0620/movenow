import { ProfileMissing } from '@/components/dashboard/ProfileMissing'
import { SuggestionCard } from '@/components/dashboard/SuggestionCard'
import { TodaySummary } from '@/components/dashboard/TodaySummary'
import { calcProteinGoal, calcTDEE, calcWorkoutGoalMinutes } from '@/lib/calculations'
import { calcSuggestions } from '@/lib/calculations/suggestions'
import { getDietLogs } from '@/lib/supabase/queries/diet'
import { getProfile } from '@/lib/supabase/queries/profiles'
import { getWorkoutLogs } from '@/lib/supabase/queries/workout'

function formatSeoulDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function getLastNDates(days: number, baseDate: Date) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() - index)

    return formatSeoulDate(date)
  })
}

export default async function Home() {
  const today = formatSeoulDate(new Date())
  const [
    { data: profile, error: profileError },
    { data: todayWorkoutLogs, error: workoutError },
    { data: todayDietLogs, error: dietError },
    { data: allWorkoutLogs, error: allWorkoutError },
  ] = await Promise.all([
    getProfile(),
    getWorkoutLogs({ date: today }),
    getDietLogs({ date: today }),
    getWorkoutLogs(),
  ])

  const errors = [profileError, workoutError, dietError, allWorkoutError].filter(
    (error): error is string => Boolean(error),
  )

  if (errors.length > 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 py-6 pb-28">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            오늘 기록을 불러오는 중 문제가 발생했습니다.
          </p>
        </div>
        {errors.map((error) => (
          <p key={error} className="text-sm text-destructive">
            {error}
          </p>
        ))}
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            오늘의 요약과 제안을 보려면 먼저 프로필을 설정해주세요.
          </p>
        </div>
        <ProfileMissing />
      </main>
    )
  }

  const recentSevenDays = new Set(getLastNDates(7, new Date()))
  const recentWorkoutDates = Array.from(
    new Set(allWorkoutLogs.map((log) => log.date).filter((date) => recentSevenDays.has(date))),
  )

  const calorieGoal = calcTDEE(profile)
  const proteinGoal = calcProteinGoal(profile)
  const workoutGoal = calcWorkoutGoalMinutes(profile.goal)
  const consumedCalories = todayDietLogs.reduce((sum, log) => sum + log.calories, 0)
  const consumedProtein = todayDietLogs.reduce((sum, log) => sum + log.protein_g, 0)
  const workoutMinutes = todayWorkoutLogs.reduce((sum, log) => sum + log.duration_minutes, 0)
  const burnedCalories = todayWorkoutLogs.reduce((sum, log) => sum + log.calories_burned, 0)
  const suggestions = calcSuggestions({
    profile,
    todayWorkoutLogs,
    todayDietLogs,
    recentWorkoutDates,
  })

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          오늘 기록을 바탕으로 핵심 지표와 우선순위 제안을 보여드립니다.
        </p>
      </div>

      <TodaySummary
        consumedCalories={consumedCalories}
        calorieGoal={calorieGoal}
        consumedProtein={consumedProtein}
        proteinGoal={proteinGoal}
        workoutMinutes={workoutMinutes}
        workoutGoal={workoutGoal}
        burnedCalories={burnedCalories}
      />
      <SuggestionCard suggestions={suggestions} />
    </main>
  )
}

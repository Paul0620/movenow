import { AchievementSummary } from '@/components/analysis/AchievementSummary'
import { CalorieChart } from '@/components/analysis/CalorieChart'
import { PeriodTabs } from '@/components/analysis/PeriodTabs'
import { ProteinChart } from '@/components/analysis/ProteinChart'
import { WorkoutChart } from '@/components/analysis/WorkoutChart'
import { ProfileMissing } from '@/components/dashboard/ProfileMissing'
import { calcProteinGoal, calcTDEE, calcWorkoutGoalMinutes } from '@/lib/calculations'
import {
  aggregateDietByDate,
  aggregateWorkoutByDate,
  calcDailyGoalStatus,
  type DailyDietSummary,
  type DailyWorkoutSummary,
} from '@/lib/calculations/analysis'
import { getDietLogs } from '@/lib/db/queries/diet'
import { getProfile } from '@/lib/db/queries/profiles'
import { getWorkoutLogs } from '@/lib/db/queries/workout'

type Props = {
  searchParams: Promise<{ period?: string }>
}

function formatSeoulDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function getDateRange(days: number) {
  const today = new Date()
  const from = new Date(today)
  from.setDate(today.getDate() - (days - 1))

  return {
    from: formatSeoulDate(from),
    to: formatSeoulDate(today),
  }
}

function getDateList(days: number) {
  const today = new Date()

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - index))

    return formatSeoulDate(date)
  })
}

function fillMissingWorkoutDates(dates: string[], summaries: DailyWorkoutSummary[]) {
  const summaryMap = new Map(summaries.map((summary) => [summary.date, summary]))

  return dates.map(
    (date) =>
      summaryMap.get(date) ?? {
        date,
        totalMinutes: 0,
        totalCaloriesBurned: 0,
      },
  )
}

function fillMissingDietDates(dates: string[], summaries: DailyDietSummary[]) {
  const summaryMap = new Map(summaries.map((summary) => [summary.date, summary]))

  return dates.map(
    (date) =>
      summaryMap.get(date) ?? {
        date,
        totalCalories: 0,
        totalProteinG: 0,
      },
  )
}

export default async function AnalysisPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const period = resolvedSearchParams.period === 'month' ? 'month' : 'week'
  const totalDays = period === 'month' ? 30 : 7
  const { from, to } = getDateRange(totalDays)
  const dates = getDateList(totalDays)

  const [profileResult, workoutResult, dietResult] = await Promise.all([
    getProfile(),
    getWorkoutLogs({ from, to }),
    getDietLogs({ from, to }),
  ])

  const errors = [profileResult.error, workoutResult.error, dietResult.error].filter(
    (error): error is string => Boolean(error),
  )

  if (errors.length > 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Analysis</h1>
          <p className="text-sm text-muted-foreground">
            분석 데이터를 불러오는 중 문제가 발생했습니다.
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

  if (!profileResult.data) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Analysis</h1>
          <p className="text-sm text-muted-foreground">
            분석 차트를 보려면 먼저 프로필을 설정해주세요.
          </p>
        </div>
        <ProfileMissing />
      </main>
    )
  }

  const profile = profileResult.data
  const workoutSummaries = fillMissingWorkoutDates(
    dates,
    aggregateWorkoutByDate(workoutResult.data),
  )
  const dietSummaries = fillMissingDietDates(dates, aggregateDietByDate(dietResult.data))
  const goalStatuses = calcDailyGoalStatus(dates, workoutSummaries, dietSummaries, profile)
  const tdeeGoal = calcTDEE(profile)
  const proteinGoal = calcProteinGoal(profile)
  const workoutGoalMinutes = calcWorkoutGoalMinutes(profile.goal)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analysis</h1>
        <p className="text-sm text-muted-foreground">
          최근 기록을 기간별 차트로 확인하고 목표 달성 흐름을 살펴보세요.
        </p>
      </div>

      <PeriodTabs period={period} />
      <AchievementSummary goalStatuses={goalStatuses} totalDays={totalDays} />
      <div className="grid gap-6">
        <CalorieChart data={dietSummaries} tdeeGoal={tdeeGoal} period={period} />
        <ProteinChart data={dietSummaries} proteinGoal={proteinGoal} period={period} />
        <WorkoutChart
          data={workoutSummaries}
          workoutGoalMinutes={workoutGoalMinutes}
          period={period}
        />
      </div>
    </main>
  )
}

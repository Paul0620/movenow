import { calcBMR, calcProteinGoal, calcTDEE, calcWorkoutGoalMinutes } from '@/lib/calculations'
import type { Profile } from '@/types'

type ProfileStatsProps = {
  profile: Profile | null
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        프로필을 저장하면 BMR, TDEE, 단백질 목표, 권장 운동 시간을 확인할 수 있습니다.
      </p>
    )
  }

  return (
    <div className="grid gap-3 text-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">BMR</span>
        <span className="font-medium">{formatNumber(calcBMR(profile))} kcal</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">TDEE</span>
        <span className="font-medium">{formatNumber(calcTDEE(profile))} kcal</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">권장 칼로리</span>
        <span className="font-medium">{formatNumber(calcTDEE(profile))} kcal</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">권장 단백질</span>
        <span className="font-medium">{formatNumber(calcProteinGoal(profile))} g/일</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">권장 운동</span>
        <span className="font-medium">
          {formatNumber(calcWorkoutGoalMinutes(profile.goal))} 분/일
        </span>
      </div>
    </div>
  )
}

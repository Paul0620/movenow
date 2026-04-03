import type { DailyGoalStatus } from '@/lib/calculations/analysis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  goalStatuses: DailyGoalStatus[]
  totalDays: number
}

export function AchievementSummary({ goalStatuses, totalDays }: Props) {
  const caloriesAchievedCount = goalStatuses.filter((status) => status.caloriesAchieved).length
  const proteinAchievedCount = goalStatuses.filter((status) => status.proteinAchieved).length
  const workoutAchievedCount = goalStatuses.filter((status) => status.workoutAchieved).length

  const items = [
    { title: '칼로리', value: `${caloriesAchievedCount} / ${totalDays}일 달성` },
    { title: '단백질', value: `${proteinAchievedCount} / ${totalDays}일 달성` },
    { title: '운동', value: `${workoutAchievedCount} / ${totalDays}일 달성` },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type TodaySummaryProps = {
  consumedCalories: number
  calorieGoal: number
  consumedProtein: number
  proteinGoal: number
  workoutMinutes: number
  workoutGoal: number
  burnedCalories: number
}

export function TodaySummary({
  consumedCalories,
  calorieGoal,
  consumedProtein,
  proteinGoal,
  workoutMinutes,
  workoutGoal,
  burnedCalories,
}: TodaySummaryProps) {
  const items = [
    {
      title: '칼로리',
      value: `${consumedCalories} / ${calorieGoal} kcal`,
      hint: '오늘 섭취량과 목표 칼로리',
    },
    {
      title: '단백질',
      value: `${Math.round(consumedProtein * 10) / 10} / ${proteinGoal} g`,
      hint: '오늘 섭취량과 목표 단백질',
    },
    {
      title: '운동 시간',
      value: `${workoutMinutes} / ${workoutGoal} 분`,
      hint: '오늘 누적 운동 시간',
    },
    {
      title: '칼로리 소모',
      value: `${burnedCalories} kcal`,
      hint: '오늘 운동으로 소모한 칼로리',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1">
            <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
            <p className="text-sm text-muted-foreground">{item.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

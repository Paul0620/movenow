import type { DietLog, MealTime } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { DietCard } from '@/components/diet/DietCard'

type DietListProps = {
  logs: DietLog[]
}

const mealOrder: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack']

const mealLabel: Record<MealTime, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
}

export function DietList({ logs }: DietListProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        오늘 등록된 식단 기록이 없습니다.
      </div>
    )
  }

  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0)
  const totalProtein = logs.reduce((sum, log) => sum + log.protein_g, 0)
  const totalCarbs = logs.reduce((sum, log) => sum + log.carbs_g, 0)
  const totalFat = logs.reduce((sum, log) => sum + log.fat_g, 0)

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold">오늘의 식단 기록</h2>
        <p className="text-sm text-muted-foreground">식사 시간별로 기록을 확인할 수 있습니다.</p>
      </div>
      <Separator />

      {mealOrder.map((mealTime) => {
        const group = logs.filter((log) => log.meal_time === mealTime)

        if (group.length === 0) {
          return null
        }

        return (
          <section key={mealTime} className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">{mealLabel[mealTime]}</h3>
              <span className="text-xs text-muted-foreground">{group.length}개 기록</span>
            </div>
            <div className="grid gap-3">
              {group.map((log) => (
                <DietCard key={log.id} log={log} />
              ))}
            </div>
          </section>
        )
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">오늘 합계</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>총 칼로리: {totalCalories} kcal</p>
          <p>단백질: {Math.round(totalProtein * 10) / 10} g</p>
          <p>탄수화물: {Math.round(totalCarbs * 10) / 10} g</p>
          <p>지방: {Math.round(totalFat * 10) / 10} g</p>
        </CardContent>
      </Card>
    </div>
  )
}

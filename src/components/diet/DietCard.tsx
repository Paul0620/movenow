import type { DietLog, MealTime } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { deleteDietAction } from '@/lib/actions/diet'

type DietCardProps = {
  log: DietLog
}

const mealLabel: Record<MealTime, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
}

export function DietCard({ log }: DietCardProps) {
  async function submitDeleteAction() {
    'use server'

    await deleteDietAction(log.id)
  }

  return (
    <Card size="sm">
      <CardContent className="grid gap-4 py-1">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <h3 className="font-medium">{log.food_name}</h3>
            <p className="text-sm text-muted-foreground">{log.calories} kcal</p>
          </div>
          <Badge variant="outline">{mealLabel[log.meal_time]}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>단백질 {log.protein_g}g</span>
          <span>탄수화물 {log.carbs_g}g</span>
          <span>지방 {log.fat_g}g</span>
          {log.amount_g ? <span>섭취량 {log.amount_g}g</span> : null}
        </div>

        <form action={submitDeleteAction}>
          <Button type="submit" variant="outline" size="sm">
            삭제
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

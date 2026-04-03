import type { ComponentType } from 'react'

import { AlertCircle, Drumstick, Flame, PersonStanding } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Suggestion } from '@/lib/calculations/suggestions'

type SuggestionCardProps = {
  suggestions: Suggestion[]
}

const iconMap = {
  protein: Drumstick,
  workout_time: PersonStanding,
  calories: Flame,
  no_workout: AlertCircle,
} satisfies Record<Suggestion['type'], ComponentType<{ className?: string }>>

export function SuggestionCard({ suggestions }: SuggestionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘의 제안</CardTitle>
        <CardDescription>우선순위가 높은 행동부터 1~2개만 보여드립니다.</CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            오늘 목표를 모두 달성했어요!
          </div>
        ) : (
          <div className="grid gap-3">
            {suggestions.map((suggestion) => {
              const Icon = iconMap[suggestion.type]

              return (
                <div
                  key={suggestion.type}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3"
                >
                  <div className="rounded-full bg-background p-2 text-primary ring-1 ring-border">
                    <Icon className="size-4" />
                  </div>
                  <p className="pt-1 text-sm text-foreground">{suggestion.message}</p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import type { WorkoutLog } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { deleteWorkoutAction } from '@/lib/actions/workout'

type WorkoutCardProps = {
  log: WorkoutLog
}

const intensityLabel: Record<WorkoutLog['intensity'], string> = {
  low: '낮음',
  moderate: '보통',
  high: '높음',
}

const intensityVariant: Record<WorkoutLog['intensity'], 'secondary' | 'outline' | 'destructive'> = {
  low: 'secondary',
  moderate: 'outline',
  high: 'destructive',
}

export function WorkoutCard({ log }: WorkoutCardProps) {
  async function submitDeleteAction() {
    'use server'

    await deleteWorkoutAction(log.id)
  }

  return (
    <Card size="sm">
      <CardContent className="grid gap-4 py-1">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <h3 className="font-medium">{log.exercise_name}</h3>
            <p className="text-sm text-muted-foreground">
              {log.duration_minutes}분 · {log.calories_burned} kcal
            </p>
          </div>
          <Badge variant={intensityVariant[log.intensity]}>{intensityLabel[log.intensity]}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>MET {log.met_value}</span>
          {log.sets ? <span>{log.sets}세트</span> : null}
          {log.reps ? <span>{log.reps}회</span> : null}
          {log.weight_kg ? <span>{log.weight_kg}kg</span> : null}
        </div>

        {log.notes ? <p className="text-sm text-muted-foreground">{log.notes}</p> : null}

        <form action={submitDeleteAction}>
          <Button type="submit" variant="outline" size="sm">
            삭제
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

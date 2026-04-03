import type { WorkoutLog } from '@/types'
import { Separator } from '@/components/ui/separator'

import { WorkoutCard } from '@/components/workout/WorkoutCard'

type WorkoutListProps = {
  logs: WorkoutLog[]
}

export function WorkoutList({ logs }: WorkoutListProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        오늘 등록된 운동 기록이 없습니다.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold">오늘의 운동 기록</h2>
        <p className="text-sm text-muted-foreground">기록된 운동은 최신 순으로 표시됩니다.</p>
      </div>
      <Separator />
      <div className="grid gap-3">
        {logs.map((log) => (
          <WorkoutCard key={log.id} log={log} />
        ))}
      </div>
    </div>
  )
}

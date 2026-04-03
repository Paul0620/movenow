import { DietForm } from '@/components/diet/DietForm'
import { DietList } from '@/components/diet/DietList'
import { getDietLogs } from '@/lib/supabase/queries/diet'

function getToday() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return formatter.format(new Date())
}

export default async function DietPage() {
  const today = getToday()
  const { data: logs, error } = await getDietLogs({ date: today })

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Diet</h1>
        <p className="text-sm text-muted-foreground">
          오늘 식단을 기록하고 영양소 합계를 확인하세요.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <DietForm defaultDate={today} />
      <DietList logs={logs} />
    </main>
  )
}

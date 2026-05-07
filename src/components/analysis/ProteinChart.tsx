'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { DailyDietSummary } from '@/lib/calculations/analysis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  data: DailyDietSummary[]
  proteinGoal: number
  period: 'week' | 'month'
}

function formatDateLabel(value: string) {
  return value.slice(5).replace('-', '/')
}

function formatTooltipLabel(label: unknown) {
  return typeof label === 'string' ? formatDateLabel(label) : ''
}

function formatTooltipValue(value: unknown) {
  return typeof value === 'number' ? [`${Math.round(value * 10) / 10} g`, '단백질'] : ['', '단백질']
}

export function ProteinChart({ data, proteinGoal, period }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>단백질 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={period === 'month' ? 'h-72' : 'h-64'}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                tickFormatter={formatDateLabel}
                minTickGap={period === 'month' ? 20 : 8}
              />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip labelFormatter={formatTooltipLabel} formatter={formatTooltipValue} />
              <ReferenceLine
                y={proteinGoal}
                stroke="var(--chart-3)"
                strokeDasharray="6 6"
                ifOverflow="extendDomain"
                label={{ value: '목표', position: 'insideTopRight' }}
              />
              <Bar dataKey="totalProteinG" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

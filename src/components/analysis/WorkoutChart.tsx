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

import type { DailyWorkoutSummary } from '@/lib/calculations/analysis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  data: DailyWorkoutSummary[]
  workoutGoalMinutes: number
  period: 'week' | 'month'
}

function formatDateLabel(value: string) {
  return value.slice(5).replace('-', '/')
}

function formatTooltipLabel(label: unknown) {
  return typeof label === 'string' ? formatDateLabel(label) : ''
}

function formatTooltipValue(value: unknown) {
  return typeof value === 'number' ? [`${value}분`, '운동 시간'] : ['', '운동 시간']
}

export function WorkoutChart({ data, workoutGoalMinutes, period }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>운동 시간 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={period === 'month' ? 'h-72' : 'h-64'}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                minTickGap={period === 'month' ? 20 : 8}
              />
              <YAxis />
              <Tooltip labelFormatter={formatTooltipLabel} formatter={formatTooltipValue} />
              <ReferenceLine
                y={workoutGoalMinutes}
                stroke="#ef4444"
                strokeDasharray="6 6"
                ifOverflow="extendDomain"
                label={{ value: '목표', position: 'insideTopRight' }}
              />
              <Bar dataKey="totalMinutes" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

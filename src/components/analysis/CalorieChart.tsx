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
  tdeeGoal: number
  period: 'week' | 'month'
}

function formatDateLabel(value: string) {
  return value.slice(5).replace('-', '/')
}

function formatTooltipLabel(label: unknown) {
  return typeof label === 'string' ? formatDateLabel(label) : ''
}

function formatTooltipValue(value: unknown) {
  return typeof value === 'number' ? [`${value} kcal`, '섭취'] : ['', '섭취']
}

export function CalorieChart({ data, tdeeGoal, period }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>칼로리 분석</CardTitle>
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
                y={tdeeGoal}
                stroke="#ef4444"
                strokeDasharray="6 6"
                ifOverflow="extendDomain"
                label={{ value: 'TDEE', position: 'insideTopRight' }}
              />
              <Bar dataKey="totalCalories" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

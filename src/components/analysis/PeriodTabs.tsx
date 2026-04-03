'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type PeriodTabsProps = {
  period: 'week' | 'month'
}

export function PeriodTabs({ period }: PeriodTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', value)
    router.push(`/analysis?${params.toString()}`)
  }

  return (
    <Tabs value={period} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="week">주간 (7일)</TabsTrigger>
        <TabsTrigger value="month">월간 (30일)</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

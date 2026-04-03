import type { Metadata } from 'next'
import './globals.css'

import { BottomNav } from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'MoveNow',
  description: '운동과 식단을 기록하고 오늘의 목표를 확인하는 개인 건강 트래커',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <div className="flex min-h-full flex-col">
          <main className="flex flex-1 flex-col">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}

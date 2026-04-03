'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Dumbbell, Home, User, UtensilsCrossed } from 'lucide-react'

import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: Home },
  { href: '/workout', label: '운동', icon: Dumbbell },
  { href: '/diet', label: '식단', icon: UtensilsCrossed },
  { href: '/profile', label: '프로필', icon: User },
  { href: '/analysis', label: '분석', icon: BarChart2 },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-[0.72rem] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('size-4', isActive && 'scale-105')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

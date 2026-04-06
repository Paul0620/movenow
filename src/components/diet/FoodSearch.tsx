'use client'

import { useEffect, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'

type FoodResult = {
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

type FoodSearchProps = {
  onSelect: (food: FoodResult) => void
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type FoodSearchResponse = {
  results: FoodResult[]
}

export function FoodSearch({ onSelect, defaultValue, onValueChange }: FoodSearchProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState(defaultValue ?? '')
  const [results, setResults] = useState<FoodResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setQuery(defaultValue ?? '')
  }, [defaultValue])

  useEffect(() => {
    const controller = new AbortController()
    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      return () => controller.abort()
    }

    const timeout = window.setTimeout(async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`/api/food-search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          setResults([])
          setHasSearched(true)
          setIsOpen(true)
          return
        }

        const payload: FoodSearchResponse = await response.json()
        setResults(payload.results.slice(0, 5))
        setHasSearched(true)
        setIsOpen(true)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setResults([])
          setHasSearched(true)
          setIsOpen(true)
        }
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [query])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    onValueChange?.(value)
    setIsOpen(Boolean(value.trim()))
  }

  const handleSelect = (food: FoodResult) => {
    setQuery(food.name)
    setResults([])
    setHasSearched(false)
    setIsOpen(false)
    onValueChange?.(food.name)
    onSelect(food)
  }

  const showEmpty = isOpen && hasSearched && !isLoading && results.length === 0
  const showResults = isOpen && results.length > 0

  return (
    <div ref={rootRef} className="relative">
      <Input
        id="food_name"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => {
          if (results.length > 0 || hasSearched) {
            setIsOpen(true)
          }
        }}
        placeholder="예: yogurt, chicken breast, granola"
        autoComplete="off"
      />

      {isLoading ? (
        <span className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      ) : null}

      {showResults ? (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-background p-2 shadow-lg">
          <div className="grid gap-2">
            {results.map((food) => (
              <button
                key={`${food.name}-${food.calories}-${food.proteinG}`}
                type="button"
                onClick={() => handleSelect(food)}
                className="rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <span className="block font-medium">{food.name}</span>
                <span className="text-xs text-muted-foreground">
                  100g 기준 · {food.calories} kcal · P {food.proteinG}g · C {food.carbsG}g · F{' '}
                  {food.fatG}g
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showEmpty ? (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground shadow-lg">
          검색 결과가 없습니다
        </div>
      ) : null}
    </div>
  )
}

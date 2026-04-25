'use client'

import { SearchDropdown } from '@/components/form/SearchDropdown'
import { useSearchAutocomplete } from '@/components/form/useSearchAutocomplete'
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

export function FoodSearch({ onSelect, defaultValue, onValueChange }: FoodSearchProps) {
  const {
    rootRef,
    dropdownRef,
    query,
    results,
    isLoading,
    showEmpty,
    showResults,
    handleChange,
    handleFocus,
    applySelection,
  } = useSearchAutocomplete<FoodResult>({
    defaultValue,
    endpoint: '/api/food-search',
    onValueChange,
  })

  const handleSelect = (food: FoodResult) => {
    applySelection(food.name)
    onSelect(food)
  }

  return (
    <div ref={rootRef} className="relative">
      <Input
        id="food_name"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={handleFocus}
        placeholder="예: yogurt, chicken breast, granola"
        autoComplete="off"
      />

      {isLoading ? (
        <span className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      ) : null}

      <SearchDropdown
        results={results}
        isOpen={showResults}
        dropdownRef={dropdownRef}
        getKey={(food) => `${food.name}-${food.calories}-${food.proteinG}`}
        renderItem={(food) => (
          <button
            type="button"
            onClick={() => handleSelect(food)}
            className="w-full rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
          >
            <span className="block font-medium">{food.name}</span>
            <span className="text-xs text-muted-foreground">
              100g 기준 · {food.calories} kcal · P {food.proteinG}g · C {food.carbsG}g · F{' '}
              {food.fatG}g
            </span>
          </button>
        )}
      />

      {showEmpty ? (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground shadow-lg">
          검색 결과가 없습니다
        </div>
      ) : null}
    </div>
  )
}

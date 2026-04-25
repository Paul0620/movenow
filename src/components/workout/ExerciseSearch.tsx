'use client'

import { SearchDropdown } from '@/components/form/SearchDropdown'
import { useSearchAutocomplete } from '@/components/form/useSearchAutocomplete'
import { Input } from '@/components/ui/input'

type ExerciseResult = {
  name: string
  metValue: number
}

type ExerciseSearchProps = {
  onSelect: (exercise: ExerciseResult) => void
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function formatMetValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function ExerciseSearch({
  onSelect,
  defaultValue,
  onValueChange,
}: ExerciseSearchProps) {
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
  } = useSearchAutocomplete<ExerciseResult>({
    defaultValue,
    endpoint: '/api/exercise-search',
    onValueChange,
  })

  const handleSelect = (exercise: ExerciseResult) => {
    applySelection(exercise.name)
    onSelect(exercise)
  }

  return (
    <div ref={rootRef} className="relative">
      <Input
        id="exercise_name"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={handleFocus}
        placeholder="예: squat, running, swimming"
        autoComplete="off"
      />

      {isLoading ? (
        <span className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      ) : null}

      <SearchDropdown
        results={results}
        isOpen={showResults}
        dropdownRef={dropdownRef}
        getKey={(exercise) => `${exercise.name}-${exercise.metValue}`}
        renderItem={(exercise) => (
          <button
            type="button"
            onClick={() => handleSelect(exercise)}
            className="w-full rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
          >
            <span className="block font-medium">{exercise.name}</span>
            <span className="text-xs text-muted-foreground">
              예상 MET {formatMetValue(exercise.metValue)}
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

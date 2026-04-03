'use client'

import { useActionState, useState, useTransition } from 'react'

import { createWorkoutAction, type CreateWorkoutState } from '@/lib/actions/workout'
import { getExerciseMetAction, searchExercisesAction } from '@/lib/actions/wger'
import type { WgerExercise } from '@/lib/wger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

type WorkoutFormProps = {
  defaultDate: string
  hasProfile: boolean
}

const initialState: CreateWorkoutState = {
  error: null,
  success: false,
  errors: {},
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}

export function WorkoutForm({ defaultDate, hasProfile }: WorkoutFormProps) {
  const [state, formAction, pending] = useActionState(createWorkoutAction, initialState)
  const [searchTerm, setSearchTerm] = useState('')
  const [exerciseName, setExerciseName] = useState('')
  const [metValue, setMetValue] = useState('')
  const [results, setResults] = useState<WgerExercise[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, startSearchTransition] = useTransition()
  const [isMetLoading, startMetTransition] = useTransition()

  const handleSearch = () => {
    const term = searchTerm.trim()

    if (!term) {
      setResults([])
      setSearchError('검색어를 입력해주세요.')
      return
    }

    startSearchTransition(async () => {
      const exercises = await searchExercisesAction(term)
      setResults(exercises)
      setSearchError(exercises.length === 0 ? '검색 결과가 없습니다. 직접 입력해도 됩니다.' : null)
    })
  }

  const handleSelectExercise = (exercise: WgerExercise) => {
    setExerciseName(exercise.name)
    setSearchTerm(exercise.name)

    startMetTransition(async () => {
      const met = await getExerciseMetAction(exercise.id)
      setMetValue(met ? String(met) : '')
      setSearchError(met ? null : 'MET 값을 찾지 못했습니다. 직접 입력해주세요.')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>운동 기록 추가</CardTitle>
        <CardDescription>
          운동 검색으로 이름과 MET를 채우거나, 직접 입력해서 기록할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {!hasProfile ? (
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            프로필을 먼저 저장해야 칼로리를 계산하고 운동 기록을 저장할 수 있습니다.
          </div>
        ) : null}

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="exercise-search">운동 검색</Label>
            <div className="flex gap-2">
              <Input
                id="exercise-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="예: squat, running, swimming"
              />
              <Button type="button" variant="outline" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? '검색 중...' : '검색'}
              </Button>
            </div>
            {searchError ? <p className="text-sm text-muted-foreground">{searchError}</p> : null}
          </div>

          {results.length > 0 ? (
            <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-sm font-medium">검색 결과</p>
              <div className="grid gap-2">
                {results.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => handleSelectExercise(exercise)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span className="block font-medium">{exercise.name}</span>
                    <span className="text-xs text-muted-foreground">{exercise.category}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <Separator />

        <form action={formAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              aria-invalid={Boolean(state.errors.date)}
            />
            <FieldError message={state.errors.date} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="exercise_name">운동명</Label>
            <Input
              id="exercise_name"
              name="exercise_name"
              value={exerciseName}
              onChange={(event) => setExerciseName(event.target.value)}
              placeholder="운동명을 직접 입력할 수 있습니다"
              aria-invalid={Boolean(state.errors.exercise_name)}
            />
            <FieldError message={state.errors.exercise_name} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duration_minutes">시간 (분)</Label>
            <Input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              min="1"
              max="600"
              defaultValue="30"
              aria-invalid={Boolean(state.errors.duration_minutes)}
            />
            <FieldError message={state.errors.duration_minutes} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="intensity">강도</Label>
            <Select name="intensity" defaultValue="moderate">
              <SelectTrigger
                id="intensity"
                className="w-full"
                aria-invalid={Boolean(state.errors.intensity)}
              >
                <SelectValue placeholder="강도를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">낮음</SelectItem>
                <SelectItem value="moderate">보통</SelectItem>
                <SelectItem value="high">높음</SelectItem>
              </SelectContent>
            </Select>
            <FieldError message={state.errors.intensity} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="met_value">MET</Label>
            <Input
              id="met_value"
              name="met_value"
              type="number"
              min="0.1"
              max="30"
              step="0.1"
              value={metValue}
              onChange={(event) => setMetValue(event.target.value)}
              placeholder={isMetLoading ? '불러오는 중...' : '직접 입력 가능'}
              aria-invalid={Boolean(state.errors.met_value)}
            />
            <FieldError message={state.errors.met_value} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="sets">세트</Label>
              <Input
                id="sets"
                name="sets"
                type="number"
                min="1"
                aria-invalid={Boolean(state.errors.sets)}
              />
              <FieldError message={state.errors.sets} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reps">횟수</Label>
              <Input
                id="reps"
                name="reps"
                type="number"
                min="1"
                aria-invalid={Boolean(state.errors.reps)}
              />
              <FieldError message={state.errors.reps} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight_kg">무게 (kg)</Label>
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                min="0"
                step="0.1"
                aria-invalid={Boolean(state.errors.weight_kg)}
              />
              <FieldError message={state.errors.weight_kg} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">메모</Label>
            <textarea
              id="notes"
              name="notes"
              maxLength={500}
              className="min-h-24 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <FieldError message={state.errors.notes} />
          </div>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? (
            <p className="text-sm text-emerald-600">운동 기록이 저장되었습니다.</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={!hasProfile || pending}>
            {pending ? '저장 중...' : '운동 기록 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

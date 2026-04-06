'use client'

import { useActionState, useState } from 'react'

import { ExerciseSearch } from '@/components/workout/ExerciseSearch'
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
import { createWorkoutAction, type CreateWorkoutState } from '@/lib/actions/workout'

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
  const [exerciseName, setExerciseName] = useState('')
  const [metValue, setMetValue] = useState('')

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

        <div className="grid gap-2">
          <Label htmlFor="exercise_name">운동 검색</Label>
          <ExerciseSearch
            defaultValue={exerciseName}
            onValueChange={setExerciseName}
            onSelect={(exercise) => {
              setExerciseName(exercise.name)
              setMetValue(String(exercise.metValue))
            }}
          />
          <p className="text-sm text-muted-foreground">
            검색 결과를 선택하면 운동명과 MET가 자동 입력되며, 이후에도 직접 수정할 수 있습니다.
          </p>
          <FieldError message={state.errors.exercise_name} />
        </div>

        <Separator />

        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="exercise_name" value={exerciseName} />

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
            <Label htmlFor="exercise_name_manual">운동명</Label>
            <Input
              id="exercise_name_manual"
              value={exerciseName}
              onChange={(event) => setExerciseName(event.target.value)}
              placeholder="검색 없이 직접 입력할 수도 있습니다"
            />
            <p className="text-sm text-muted-foreground">
              검색 입력창과 같은 값을 사용합니다.
            </p>
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
              placeholder="직접 입력 가능"
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

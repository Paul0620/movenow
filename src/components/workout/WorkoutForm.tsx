'use client'

import { useActionState, useState } from 'react'

import { WorkoutFields } from '@/components/workout/WorkoutFields'
import { WorkoutPrimaryFields } from '@/components/workout/WorkoutPrimaryFields'
import { WorkoutSearchSection } from '@/components/workout/WorkoutSearchSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
          <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-3 text-sm text-foreground">
            프로필을 먼저 저장해야 칼로리를 계산하고 운동 기록을 저장할 수 있습니다.
          </div>
        ) : null}

        <WorkoutSearchSection
          exerciseName={exerciseName}
          error={state.errors.exercise_name}
          onExerciseNameChange={setExerciseName}
          onExerciseSelect={(exercise) => {
            setExerciseName(exercise.name)
            setMetValue(String(exercise.metValue))
          }}
        />

        <Separator />

        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="exercise_name" value={exerciseName} />

          <WorkoutPrimaryFields
            defaultDate={defaultDate}
            exerciseName={exerciseName}
            metValue={metValue}
            errors={state.errors}
            onExerciseNameChange={setExerciseName}
            onMetValueChange={setMetValue}
          />

          <WorkoutFields errors={state.errors} />

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-foreground">운동 기록이 저장되었습니다.</p> : null}

          <Button type="submit" className="w-full" disabled={!hasProfile || pending}>
            {pending ? '저장 중...' : '운동 기록 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

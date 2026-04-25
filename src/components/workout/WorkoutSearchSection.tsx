'use client'

import { FieldError } from '@/components/form/FieldError'
import { ExerciseSearch } from '@/components/workout/ExerciseSearch'
import { Label } from '@/components/ui/label'
import type { CreateWorkoutState } from '@/lib/actions/workout'

type WorkoutSearchSectionProps = {
  exerciseName: string
  error?: CreateWorkoutState['errors']['exercise_name']
  onExerciseNameChange: (value: string) => void
  onExerciseSelect: (exercise: { name: string; metValue: number }) => void
}

export function WorkoutSearchSection({
  exerciseName,
  error,
  onExerciseNameChange,
  onExerciseSelect,
}: WorkoutSearchSectionProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="exercise_name">운동 검색</Label>
      <ExerciseSearch
        defaultValue={exerciseName}
        onValueChange={onExerciseNameChange}
        onSelect={onExerciseSelect}
      />
      <p className="text-sm text-muted-foreground">
        검색 결과를 선택하면 운동명과 MET가 자동 입력되며, 이후에도 직접 수정할 수 있습니다.
      </p>
      <FieldError message={error} />
    </div>
  )
}

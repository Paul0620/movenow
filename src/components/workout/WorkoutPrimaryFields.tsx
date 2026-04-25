'use client'

import { FieldError } from '@/components/form/FieldError'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreateWorkoutState } from '@/lib/actions/workout'

type WorkoutPrimaryFieldsProps = {
  defaultDate: string
  exerciseName: string
  metValue: string
  errors: CreateWorkoutState['errors']
  onExerciseNameChange: (value: string) => void
  onMetValueChange: (value: string) => void
}

export function WorkoutPrimaryFields({
  defaultDate,
  exerciseName,
  metValue,
  errors,
  onExerciseNameChange,
  onMetValueChange,
}: WorkoutPrimaryFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="date">날짜</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={defaultDate}
          aria-invalid={Boolean(errors.date)}
        />
        <FieldError message={errors.date} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="exercise_name_manual">운동명</Label>
        <Input
          id="exercise_name_manual"
          value={exerciseName}
          onChange={(event) => onExerciseNameChange(event.target.value)}
          placeholder="검색 없이 직접 입력할 수도 있습니다"
        />
        <p className="text-sm text-muted-foreground">검색 입력창과 같은 값을 사용합니다.</p>
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
          aria-invalid={Boolean(errors.duration_minutes)}
        />
        <FieldError message={errors.duration_minutes} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="intensity">강도</Label>
        <Select name="intensity" defaultValue="moderate">
          <SelectTrigger id="intensity" className="w-full" aria-invalid={Boolean(errors.intensity)}>
            <SelectValue placeholder="강도를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">낮음</SelectItem>
            <SelectItem value="moderate">보통</SelectItem>
            <SelectItem value="high">높음</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.intensity} />
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
          onChange={(event) => onMetValueChange(event.target.value)}
          placeholder="직접 입력 가능"
          aria-invalid={Boolean(errors.met_value)}
        />
        <FieldError message={errors.met_value} />
      </div>
    </>
  )
}

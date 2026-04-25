'use client'

import { FieldError } from '@/components/form/FieldError'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateWorkoutState } from '@/lib/actions/workout'

type WorkoutFieldsProps = {
  errors: CreateWorkoutState['errors']
}

export function WorkoutFields({ errors }: WorkoutFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="sets">세트</Label>
          <Input id="sets" name="sets" type="number" min="1" aria-invalid={Boolean(errors.sets)} />
          <FieldError message={errors.sets} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="reps">횟수</Label>
          <Input id="reps" name="reps" type="number" min="1" aria-invalid={Boolean(errors.reps)} />
          <FieldError message={errors.reps} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="weight_kg">무게 (kg)</Label>
          <Input
            id="weight_kg"
            name="weight_kg"
            type="number"
            min="0"
            step="0.1"
            aria-invalid={Boolean(errors.weight_kg)}
          />
          <FieldError message={errors.weight_kg} />
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
        <FieldError message={errors.notes} />
      </div>
    </>
  )
}

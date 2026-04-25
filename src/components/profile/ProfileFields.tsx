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
import type { SaveProfileState } from '@/lib/actions/profile'
import type { ActivityLevel, Goal, Profile } from '@/types'

type ProfileFieldsProps = {
  profile: Profile | null
  errors: SaveProfileState['errors']
  goalLabels: Record<Goal, string>
  activityLabels: Record<ActivityLevel, string>
}

export function ProfileFields({
  profile,
  errors,
  goalLabels,
  activityLabels,
}: ProfileFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="height">키 (cm)</Label>
        <Input
          id="height"
          name="height"
          type="number"
          inputMode="decimal"
          min="100"
          max="250"
          step="0.1"
          defaultValue={profile?.height ?? ''}
          aria-invalid={Boolean(errors.height)}
        />
        <FieldError message={errors.height} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="weight">몸무게 (kg)</Label>
        <Input
          id="weight"
          name="weight"
          type="number"
          inputMode="decimal"
          min="20"
          max="300"
          step="0.1"
          defaultValue={profile?.weight ?? ''}
          aria-invalid={Boolean(errors.weight)}
        />
        <FieldError message={errors.weight} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="age">나이</Label>
        <Input
          id="age"
          name="age"
          type="number"
          inputMode="numeric"
          min="10"
          max="120"
          step="1"
          defaultValue={profile?.age ?? ''}
          aria-invalid={Boolean(errors.age)}
        />
        <FieldError message={errors.age} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="gender">성별</Label>
        <Select name="gender" defaultValue={profile?.gender}>
          <SelectTrigger id="gender" className="w-full" aria-invalid={Boolean(errors.gender)}>
            <SelectValue placeholder="성별을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">남성</SelectItem>
            <SelectItem value="female">여성</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.gender} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="goal">목표</Label>
        <Select name="goal" defaultValue={profile?.goal}>
          <SelectTrigger id="goal" className="w-full" aria-invalid={Boolean(errors.goal)}>
            <SelectValue placeholder="목표를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(goalLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.goal} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="activity_level">활동량</Label>
        <Select name="activity_level" defaultValue={profile?.activity_level}>
          <SelectTrigger
            id="activity_level"
            className="w-full"
            aria-invalid={Boolean(errors.activity_level)}
          >
            <SelectValue placeholder="활동량을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(activityLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.activity_level} />
      </div>
    </>
  )
}

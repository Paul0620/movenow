'use client'

import { useActionState } from 'react'

import { saveProfileAction, type SaveProfileState } from '@/lib/actions/profile'
import { calcBMR, calcProteinGoal, calcTDEE, calcWorkoutGoalMinutes } from '@/lib/calculations'
import type { ActivityLevel, Goal, Profile } from '@/types'
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

type ProfileFormProps = {
  profile: Profile | null
}

const initialState: SaveProfileState = {
  error: null,
  errors: {},
  success: false,
}

const goalLabels: Record<Goal, string> = {
  loss: '감량',
  gain: '증량',
  maintain: '유지',
}

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: '거의 움직이지 않음',
  light: '가벼운 활동',
  moderate: '보통 활동',
  active: '활동적',
  very_active: '매우 활동적',
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveProfileAction, initialState)

  const currentProfile = state.profile ?? profile
  const hasCalculatedProfile = Boolean(currentProfile)

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>신체 정보</CardTitle>
          <CardDescription>기본 정보를 저장하면 개인 맞춤 기준을 계산합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-5">
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
                defaultValue={currentProfile?.height ?? ''}
                aria-invalid={Boolean(state.errors.height)}
              />
              <FieldError message={state.errors.height} />
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
                defaultValue={currentProfile?.weight ?? ''}
                aria-invalid={Boolean(state.errors.weight)}
              />
              <FieldError message={state.errors.weight} />
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
                defaultValue={currentProfile?.age ?? ''}
                aria-invalid={Boolean(state.errors.age)}
              />
              <FieldError message={state.errors.age} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender">성별</Label>
              <Select name="gender" defaultValue={currentProfile?.gender}>
                <SelectTrigger
                  id="gender"
                  className="w-full"
                  aria-invalid={Boolean(state.errors.gender)}
                >
                  <SelectValue placeholder="성별을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={state.errors.gender} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal">목표</Label>
              <Select name="goal" defaultValue={currentProfile?.goal}>
                <SelectTrigger
                  id="goal"
                  className="w-full"
                  aria-invalid={Boolean(state.errors.goal)}
                >
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
              <FieldError message={state.errors.goal} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="activity_level">활동량</Label>
              <Select name="activity_level" defaultValue={currentProfile?.activity_level}>
                <SelectTrigger
                  id="activity_level"
                  className="w-full"
                  aria-invalid={Boolean(state.errors.activity_level)}
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
              <FieldError message={state.errors.activity_level} />
            </div>

            {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
            {state.success ? (
              <p className="text-sm text-emerald-600">프로필이 저장되었습니다.</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? '저장 중...' : '저장하기'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>계산 결과</CardTitle>
          <CardDescription>저장된 프로필을 기준으로 하루 권장 수치를 보여줍니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasCalculatedProfile && currentProfile ? (
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">BMR</span>
                <span className="font-medium">{formatNumber(calcBMR(currentProfile))} kcal</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">TDEE</span>
                <span className="font-medium">{formatNumber(calcTDEE(currentProfile))} kcal</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">권장 칼로리</span>
                <span className="font-medium">{formatNumber(calcTDEE(currentProfile))} kcal</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">권장 단백질</span>
                <span className="font-medium">
                  {formatNumber(calcProteinGoal(currentProfile))} g/일
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">권장 운동</span>
                <span className="font-medium">
                  {formatNumber(calcWorkoutGoalMinutes(currentProfile.goal))} 분/일
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              프로필을 저장하면 BMR, TDEE, 단백질 목표, 권장 운동 시간을 확인할 수 있습니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

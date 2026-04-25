'use client'

import { useActionState } from 'react'

import { ProfileFields } from '@/components/profile/ProfileFields'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { saveProfileAction, type SaveProfileState } from '@/lib/actions/profile'
import type { ActivityLevel, Goal, Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveProfileAction, initialState)

  const currentProfile = state.profile ?? profile

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>신체 정보</CardTitle>
          <CardDescription>기본 정보를 저장하면 개인 맞춤 기준을 계산합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-5">
            <ProfileFields
              profile={currentProfile}
              errors={state.errors}
              goalLabels={goalLabels}
              activityLabels={activityLabels}
            />

            {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
            {state.success ? <p className="text-sm text-foreground">프로필이 저장되었습니다.</p> : null}

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
          <ProfileStats profile={currentProfile} />
        </CardContent>
      </Card>
    </div>
  )
}

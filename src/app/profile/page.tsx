import { ProfileForm } from '@/components/profile/ProfileForm'
import { getProfile } from '@/lib/supabase/queries/profiles'

export default async function ProfilePage() {
  const { data: profile, error } = await getProfile()

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">프로필</h1>
        <p className="text-sm text-muted-foreground">
          신체 정보를 저장하고 개인 맞춤 기준을 확인하세요.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ProfileForm profile={profile} />
    </section>
  )
}

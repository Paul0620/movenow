import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfileMissing() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 설정이 필요해요</CardTitle>
        <CardDescription>
          맞춤 목표와 오늘의 제안을 계산하려면 먼저 프로필을 저장해야 합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/profile">프로필 설정하러 가기</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

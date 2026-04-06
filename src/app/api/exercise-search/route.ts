import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const WGER_SEARCH_URL = 'https://wger.de/api/v2/exercise/search/'

const MET_BY_CATEGORY: Record<string, number> = {
  Abs: 5.0,
  Arms: 5.0,
  Back: 5.0,
  Calves: 5.0,
  Cardio: 7.5,
  Chest: 5.0,
  Legs: 5.5,
  Shoulders: 5.0,
}

const DEFAULT_MET = 5.0

type WgerSearchResponse = {
  suggestions?: Array<{
    data?: {
      value?: string
      category?: string
    }
  }>
}

type ExerciseResult = {
  name: string
  metValue: number
}

function parseResults(payload: WgerSearchResponse): ExerciseResult[] {
  if (!payload.suggestions) {
    return []
  }

  return payload.suggestions.flatMap((suggestion) => {
    const name = suggestion.data?.value?.trim()

    if (!name) {
      return []
    }

    return [
      {
        name,
        metValue: MET_BY_CATEGORY[suggestion.data?.category ?? ''] ?? DEFAULT_MET,
      },
    ]
  })
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (!query) {
    return Response.json({ results: [] satisfies ExerciseResult[] })
  }

  const params = new URLSearchParams({
    term: query,
    language: 'english',
    format: 'json',
  })

  try {
    const response = await fetch(`${WGER_SEARCH_URL}?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return Response.json({ results: [] satisfies ExerciseResult[] })
    }

    const payload = (await response.json()) as WgerSearchResponse

    return Response.json({ results: parseResults(payload) })
  } catch {
    return Response.json({ results: [] satisfies ExerciseResult[] })
  }
}

const WGER_BASE = 'https://wger.de/api/v2'

type WgerSearchResponse = {
  suggestions?: Array<{
    data?: {
      id?: number
      value?: string
      category?: string
    }
  }>
}

type WgerExerciseDetailResponse = {
  id?: number
  name?: string
  exercise_base?: {
    uuid?: string
  }
}

type WgerExerciseBaseResponse = {
  id?: number
  uuid?: string
  variations?: Array<{
    id?: number
    license_author?: string
  }>
}

type WgerAliasResponse = {
  results?: Array<{
    alias?: string
    exercise_base?: number
  }>
}

export type WgerExercise = {
  id: number
  name: string
  category: string
}

const MET_LOOKUP: Record<string, number> = {
  squat: 5.5,
  deadlift: 6,
  bench: 5,
  press: 5,
  push: 4,
  pull: 5,
  row: 5,
  run: 9.8,
  jogging: 7,
  walk: 3.5,
  walking: 3.5,
  cycling: 7.5,
  bike: 7.5,
  swim: 8,
  swimming: 8,
  jump: 8.5,
  burpee: 8,
  plank: 3.3,
  yoga: 2.8,
  pilates: 3,
  stretching: 2.3,
  cardio: 7,
}

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

function inferMetFromName(name: string) {
  const normalized = name.toLowerCase()

  for (const [keyword, met] of Object.entries(MET_LOOKUP)) {
    if (normalized.includes(keyword)) {
      return met
    }
  }

  return null
}

/** 운동 검색 — 영어 기준 */
export async function searchExercises(term: string): Promise<WgerExercise[]> {
  const searchTerm = term.trim()

  if (!searchTerm) {
    return []
  }

  const params = new URLSearchParams({
    term: searchTerm,
    language: 'english',
    format: 'json',
  })

  const response = await fetch(`${WGER_BASE}/exercise/search/?${params.toString()}`, {
    next: { revalidate: 86400 },
  }).catch(() => null)

  if (!response?.ok) {
    return []
  }

  const payload = await safeJson<WgerSearchResponse>(response)

  if (!payload?.suggestions) {
    return []
  }

  return payload.suggestions
    .map((suggestion) => {
      const exercise = suggestion.data

      if (!exercise?.id || !exercise.value) {
        return null
      }

      return {
        id: exercise.id,
        name: exercise.value,
        category: exercise.category ?? '기타',
      }
    })
    .filter((exercise): exercise is WgerExercise => exercise !== null)
}

/** 운동 상세 조회 — MET 값 포함 */
export async function getExerciseMet(id: number): Promise<number | null> {
  if (!Number.isFinite(id) || id <= 0) {
    return null
  }

  const detailResponse = await fetch(`${WGER_BASE}/exercise/${id}/?format=json`, {
    next: { revalidate: 86400 },
  }).catch(() => null)

  if (!detailResponse?.ok) {
    return null
  }

  const detail = await safeJson<WgerExerciseDetailResponse>(detailResponse)

  if (!detail?.name) {
    return null
  }

  const directMet = inferMetFromName(detail.name)

  if (directMet) {
    return directMet
  }

  const baseUuid = detail.exercise_base?.uuid

  if (!baseUuid) {
    return null
  }

  const baseResponse = await fetch(`${WGER_BASE}/exercisebaseinfo/${baseUuid}/?format=json`, {
    next: { revalidate: 86400 },
  }).catch(() => null)

  if (!baseResponse?.ok) {
    return null
  }

  const baseInfo = await safeJson<WgerExerciseBaseResponse>(baseResponse)

  if (!baseInfo?.id) {
    return null
  }

  const aliasResponse = await fetch(
    `${WGER_BASE}/exercisealias/?exercise_base=${baseInfo.id}&format=json`,
    { next: { revalidate: 86400 } },
  ).catch(() => null)

  if (!aliasResponse?.ok) {
    return null
  }

  const aliases = await safeJson<WgerAliasResponse>(aliasResponse)

  if (!aliases?.results?.length) {
    return null
  }

  for (const item of aliases.results) {
    if (item.alias) {
      const met = inferMetFromName(item.alias)

      if (met) {
        return met
      }
    }
  }

  return null
}

import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org/cgi/search.pl'

type OpenFoodFactsResponse = {
  products?: Array<{
    product_name?: string
    nutriments?: {
      'energy-kcal_100g'?: number | string
      proteins_100g?: number | string
      carbohydrates_100g?: number | string
      fat_100g?: number | string
    }
  }>
}

type FoodResult = {
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

function toNumber(value: number | string | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function parseProducts(payload: OpenFoodFactsResponse): FoodResult[] {
  if (!payload.products) {
    return []
  }

  return payload.products.flatMap((product) => {
    const name = product.product_name?.trim()

    if (!name) {
      return []
    }

    return [
      {
        name,
        calories: toNumber(product.nutriments?.['energy-kcal_100g']) ?? 0,
        proteinG: toNumber(product.nutriments?.proteins_100g) ?? 0,
        carbsG: toNumber(product.nutriments?.carbohydrates_100g) ?? 0,
        fatG: toNumber(product.nutriments?.fat_100g) ?? 0,
      },
    ]
  })
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (!query) {
    return Response.json({ results: [] satisfies FoodResult[] })
  }

  const params = new URLSearchParams({
    search_terms: query,
    json: 'true',
    fields: 'product_name,nutriments',
    page_size: '5',
  })

  try {
    const response = await fetch(`${OPEN_FOOD_FACTS_URL}?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return Response.json({ results: [] satisfies FoodResult[] })
    }

    const payload = (await response.json()) as OpenFoodFactsResponse

    return Response.json({ results: parseProducts(payload) })
  } catch {
    return Response.json({ results: [] satisfies FoodResult[] })
  }
}

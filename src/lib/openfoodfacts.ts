const OFF_BASE = 'https://world.openfoodfacts.org'

type OpenFoodFactsSearchResponse = {
  products?: Array<{
    code?: string
    product_name?: string
    nutriments?: {
      'energy-kcal_100g'?: number | string
      proteins_100g?: number | string
      carbohydrates_100g?: number | string
      fat_100g?: number | string
    }
  }>
}

export type FoodItem = {
  id: string
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

function toFiniteNumber(value: number | string | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

export async function searchFoods(term: string): Promise<FoodItem[]> {
  const query = term.trim()

  if (!query) {
    return []
  }

  const params = new URLSearchParams({
    search_terms: query,
    json: 'true',
    fields: 'code,product_name,nutriments',
    page_size: '10',
  })

  const response = await fetch(`${OFF_BASE}/cgi/search.pl?${params.toString()}`, {
    next: { revalidate: 86400 },
  }).catch(() => null)

  if (!response?.ok) {
    return []
  }

  const payload = await safeJson<OpenFoodFactsSearchResponse>(response)

  if (!payload?.products) {
    return []
  }

  return payload.products
    .map((product) => {
      const id = product.code?.trim()
      const name = product.product_name?.trim()
      const calories = toFiniteNumber(product.nutriments?.['energy-kcal_100g'])
      const protein = toFiniteNumber(product.nutriments?.proteins_100g)
      const carbs = toFiniteNumber(product.nutriments?.carbohydrates_100g)
      const fat = toFiniteNumber(product.nutriments?.fat_100g)

      if (!id || !name || calories === null || protein === null || carbs === null || fat === null) {
        return null
      }

      return {
        id,
        name,
        calories_per_100g: calories,
        protein_per_100g: protein,
        carbs_per_100g: carbs,
        fat_per_100g: fat,
      }
    })
    .filter((food): food is FoodItem => food !== null)
}

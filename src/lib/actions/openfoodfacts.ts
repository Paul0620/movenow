'use server'

import { searchFoods, type FoodItem } from '@/lib/openfoodfacts'

export async function searchFoodsAction(term: string): Promise<FoodItem[]> {
  return searchFoods(term)
}

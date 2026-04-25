'use client'

import { FoodSearch } from '@/components/diet/FoodSearch'
import { FieldError } from '@/components/form/FieldError'
import { Label } from '@/components/ui/label'
import type { CreateDietState } from '@/lib/actions/diet'

type DietFields = {
  food_name: string
  calories: string
  protein_g: string
  carbs_g: string
  fat_g: string
}

type DietSearchSectionProps = {
  foodName: string
  error?: CreateDietState['errors']['food_name']
  onFoodNameChange: (value: string) => void
  onFoodSelect: (fields: DietFields) => void
}

export function DietSearchSection({
  foodName,
  error,
  onFoodNameChange,
  onFoodSelect,
}: DietSearchSectionProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="food_name">음식 검색</Label>
      <FoodSearch
        defaultValue={foodName}
        onValueChange={onFoodNameChange}
        onSelect={(food) =>
          onFoodSelect({
            food_name: food.name,
            calories: String(food.calories),
            protein_g: String(food.proteinG),
            carbs_g: String(food.carbsG),
            fat_g: String(food.fatG),
          })
        }
      />
      <p className="text-sm text-muted-foreground">
        검색 결과를 선택하거나 음식명을 직접 입력할 수 있습니다.
      </p>
      <FieldError message={error} />
    </div>
  )
}

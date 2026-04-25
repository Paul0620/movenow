'use client'

import { MacroPreview } from '@/components/diet/MacroPreview'
import { FieldError } from '@/components/form/FieldError'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateDietState } from '@/lib/actions/diet'

type DietFields = {
  food_name: string
  calories: string
  protein_g: string
  carbs_g: string
  fat_g: string
}

type PreviewValues = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

type DietMacroFieldsProps = {
  fields: DietFields
  amount: string
  errors: CreateDietState['errors']
  preview: PreviewValues | null
  onFieldChange: (key: keyof DietFields, value: string) => void
  onAmountChange: (value: string) => void
}

export function DietMacroFields({
  fields,
  amount,
  errors,
  preview,
  onFieldChange,
  onAmountChange,
}: DietMacroFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="calories">칼로리 (100g 기준)</Label>
          <Input
            id="calories"
            name="calories"
            type="number"
            min="0"
            max="5000"
            value={fields.calories}
            onChange={(event) => onFieldChange('calories', event.target.value)}
            aria-invalid={Boolean(errors.calories)}
          />
          <FieldError message={errors.calories} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount_g">섭취량 (g, 선택)</Label>
          <Input
            id="amount_g"
            name="amount_g"
            type="number"
            min="1"
            max="5000"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="비워두면 입력값 그대로 저장됩니다"
            aria-invalid={Boolean(errors.amount_g)}
          />
          <FieldError message={errors.amount_g} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="protein_g">단백질 (100g 기준)</Label>
          <Input
            id="protein_g"
            name="protein_g"
            type="number"
            min="0"
            max="500"
            step="0.1"
            value={fields.protein_g}
            onChange={(event) => onFieldChange('protein_g', event.target.value)}
            aria-invalid={Boolean(errors.protein_g)}
          />
          <FieldError message={errors.protein_g} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="carbs_g">탄수화물 (100g 기준)</Label>
          <Input
            id="carbs_g"
            name="carbs_g"
            type="number"
            min="0"
            max="500"
            step="0.1"
            value={fields.carbs_g}
            onChange={(event) => onFieldChange('carbs_g', event.target.value)}
            aria-invalid={Boolean(errors.carbs_g)}
          />
          <FieldError message={errors.carbs_g} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fat_g">지방 (100g 기준)</Label>
          <Input
            id="fat_g"
            name="fat_g"
            type="number"
            min="0"
            max="500"
            step="0.1"
            value={fields.fat_g}
            onChange={(event) => onFieldChange('fat_g', event.target.value)}
            aria-invalid={Boolean(errors.fat_g)}
          />
          <FieldError message={errors.fat_g} />
        </div>
      </div>

      {preview ? (
        <MacroPreview
          calories={preview.calories}
          proteinG={preview.protein}
          carbsG={preview.carbs}
          fatG={preview.fat}
        />
      ) : null}
    </>
  )
}

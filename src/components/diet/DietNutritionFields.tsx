'use client'

import { DietMacroFields } from '@/components/diet/DietMacroFields'
import { FieldError } from '@/components/form/FieldError'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

type DietNutritionFieldsProps = {
  defaultDate: string
  fields: DietFields
  amount: string
  errors: CreateDietState['errors']
  preview: PreviewValues | null
  onFieldChange: (key: keyof DietFields, value: string) => void
  onAmountChange: (value: string) => void
}

export function DietNutritionFields({
  defaultDate,
  fields,
  amount,
  errors,
  preview,
  onFieldChange,
  onAmountChange,
}: DietNutritionFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="date">날짜</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={defaultDate}
          aria-invalid={Boolean(errors.date)}
        />
        <FieldError message={errors.date} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="meal_time">식사 시간</Label>
        <Select name="meal_time" defaultValue="breakfast">
          <SelectTrigger id="meal_time" className="w-full" aria-invalid={Boolean(errors.meal_time)}>
            <SelectValue placeholder="식사 시간을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">아침</SelectItem>
            <SelectItem value="lunch">점심</SelectItem>
            <SelectItem value="dinner">저녁</SelectItem>
            <SelectItem value="snack">간식</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.meal_time} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="food_name_manual">음식명</Label>
        <Input
          id="food_name_manual"
          value={fields.food_name}
          onChange={(event) => onFieldChange('food_name', event.target.value)}
          placeholder="검색 없이 직접 입력할 수도 있습니다"
        />
        <p className="text-sm text-muted-foreground">
          검색 입력창과 연동됩니다. 편한 쪽에서 수정하면 됩니다.
        </p>
      </div>

      <DietMacroFields
        fields={fields}
        amount={amount}
        errors={errors}
        preview={preview}
        onFieldChange={onFieldChange}
        onAmountChange={onAmountChange}
      />
    </>
  )
}

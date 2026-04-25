'use client'

import { useActionState, useState } from 'react'

import { DietNutritionFields } from '@/components/diet/DietNutritionFields'
import { DietSearchSection } from '@/components/diet/DietSearchSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createDietAction, type CreateDietState } from '@/lib/actions/diet'

type DietFormProps = {
  defaultDate: string
}

const initialState: CreateDietState = {
  error: null,
  success: false,
  errors: {},
}

function formatMacro(value: number) {
  return Math.round(value * 10) / 10
}

export function DietForm({ defaultDate }: DietFormProps) {
  const [state, formAction, pending] = useActionState(createDietAction, initialState)
  const [fields, setFields] = useState({
    food_name: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  })
  const [amount, setAmount] = useState('')

  const parsedCalories = Number(fields.calories)
  const parsedProtein = Number(fields.protein_g)
  const parsedCarbs = Number(fields.carbs_g)
  const parsedFat = Number(fields.fat_g)
  const parsedAmount = Number(amount)

  const preview =
    Number.isFinite(parsedCalories) &&
    Number.isFinite(parsedProtein) &&
    Number.isFinite(parsedCarbs) &&
    Number.isFinite(parsedFat) &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0
      ? {
          calories: Math.round(parsedCalories * (parsedAmount / 100)),
          protein: formatMacro(parsedProtein * (parsedAmount / 100)),
          carbs: formatMacro(parsedCarbs * (parsedAmount / 100)),
          fat: formatMacro(parsedFat * (parsedAmount / 100)),
        }
      : null

  const handleFieldChange = (key: keyof typeof fields, value: string) => {
    setFields((current) => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>식단 기록 추가</CardTitle>
        <CardDescription>
          음식 검색으로 100g 기준 영양정보를 채우거나, 직접 입력해서 기록할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <DietSearchSection
          foodName={fields.food_name}
          error={state.errors.food_name}
          onFoodNameChange={(value) => handleFieldChange('food_name', value)}
          onFoodSelect={setFields}
        />

        <Separator />

        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="food_name" value={fields.food_name} />

          <DietNutritionFields
            defaultDate={defaultDate}
            fields={fields}
            amount={amount}
            errors={state.errors}
            preview={preview}
            onFieldChange={handleFieldChange}
            onAmountChange={setAmount}
          />

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-foreground">식단 기록이 저장되었습니다.</p> : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '저장 중...' : '식단 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

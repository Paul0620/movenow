'use client'

import { useActionState, useState } from 'react'

import { FoodSearch } from '@/components/diet/FoodSearch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
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
        <div className="grid gap-2">
          <Label htmlFor="food_name">음식 검색</Label>
          <FoodSearch
            defaultValue={fields.food_name}
            onValueChange={(value) => handleFieldChange('food_name', value)}
            onSelect={(food) =>
              setFields({
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
          <FieldError message={state.errors.food_name} />
        </div>

        <Separator />

        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="food_name" value={fields.food_name} />

          <div className="grid gap-2">
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              aria-invalid={Boolean(state.errors.date)}
            />
            <FieldError message={state.errors.date} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meal_time">식사 시간</Label>
            <Select name="meal_time" defaultValue="breakfast">
              <SelectTrigger
                id="meal_time"
                className="w-full"
                aria-invalid={Boolean(state.errors.meal_time)}
              >
                <SelectValue placeholder="식사 시간을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">아침</SelectItem>
                <SelectItem value="lunch">점심</SelectItem>
                <SelectItem value="dinner">저녁</SelectItem>
                <SelectItem value="snack">간식</SelectItem>
              </SelectContent>
            </Select>
            <FieldError message={state.errors.meal_time} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="food_name_manual">음식명</Label>
            <Input
              id="food_name_manual"
              value={fields.food_name}
              onChange={(event) => handleFieldChange('food_name', event.target.value)}
              placeholder="검색 없이 직접 입력할 수도 있습니다"
            />
            <p className="text-sm text-muted-foreground">
              검색 입력창과 연동됩니다. 편한 쪽에서 수정하면 됩니다.
            </p>
          </div>

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
                onChange={(event) => handleFieldChange('calories', event.target.value)}
                aria-invalid={Boolean(state.errors.calories)}
              />
              <FieldError message={state.errors.calories} />
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
                onChange={(event) => setAmount(event.target.value)}
                placeholder="비워두면 입력값 그대로 저장됩니다"
                aria-invalid={Boolean(state.errors.amount_g)}
              />
              <FieldError message={state.errors.amount_g} />
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
                onChange={(event) => handleFieldChange('protein_g', event.target.value)}
                aria-invalid={Boolean(state.errors.protein_g)}
              />
              <FieldError message={state.errors.protein_g} />
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
                onChange={(event) => handleFieldChange('carbs_g', event.target.value)}
                aria-invalid={Boolean(state.errors.carbs_g)}
              />
              <FieldError message={state.errors.carbs_g} />
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
                onChange={(event) => handleFieldChange('fat_g', event.target.value)}
                aria-invalid={Boolean(state.errors.fat_g)}
              />
              <FieldError message={state.errors.fat_g} />
            </div>
          </div>

          {preview ? (
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              실제 섭취량 기준 예상값: {preview.calories} kcal / 단백질 {preview.protein}g /
              탄수화물 {preview.carbs}g / 지방 {preview.fat}g
            </div>
          ) : null}

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? (
            <p className="text-sm text-emerald-600">식단 기록이 저장되었습니다.</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '저장 중...' : '식단 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

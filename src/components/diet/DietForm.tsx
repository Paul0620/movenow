'use client'

import { useActionState, useState, useTransition } from 'react'

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
import { searchFoodsAction } from '@/lib/actions/openfoodfacts'
import type { FoodItem } from '@/lib/openfoodfacts'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [amount, setAmount] = useState('')
  const [isSearching, startSearchTransition] = useTransition()

  const parsedCalories = Number(calories)
  const parsedProtein = Number(protein)
  const parsedCarbs = Number(carbs)
  const parsedFat = Number(fat)
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

  const handleSearch = () => {
    const term = searchTerm.trim()

    if (!term) {
      setResults([])
      setSearchError('검색어를 입력해주세요.')
      return
    }

    startSearchTransition(async () => {
      const foods = await searchFoodsAction(term)
      setResults(foods)
      setSearchError(foods.length === 0 ? '검색 결과가 없습니다. 직접 입력해도 됩니다.' : null)
    })
  }

  const handleSelectFood = (food: FoodItem) => {
    setFoodName(food.name)
    setSearchTerm(food.name)
    setCalories(String(food.calories_per_100g))
    setProtein(String(food.protein_per_100g))
    setCarbs(String(food.carbs_per_100g))
    setFat(String(food.fat_per_100g))
    setSearchError(null)
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
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="food-search">음식 검색</Label>
            <div className="flex gap-2">
              <Input
                id="food-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="예: yogurt, chicken breast, granola"
              />
              <Button type="button" variant="outline" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? '검색 중...' : '검색'}
              </Button>
            </div>
            {searchError ? <p className="text-sm text-muted-foreground">{searchError}</p> : null}
          </div>

          {results.length > 0 ? (
            <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-sm font-medium">검색 결과</p>
              <div className="grid gap-2">
                {results.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleSelectFood(food)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span className="block font-medium">{food.name}</span>
                    <span className="text-xs text-muted-foreground">
                      100g 기준 · {food.calories_per_100g} kcal · P {food.protein_per_100g}g · C{' '}
                      {food.carbs_per_100g}g · F {food.fat_per_100g}g
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <Separator />

        <form action={formAction} className="grid gap-5">
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
            <Label htmlFor="food_name">음식명</Label>
            <Input
              id="food_name"
              name="food_name"
              value={foodName}
              onChange={(event) => setFoodName(event.target.value)}
              placeholder="음식명을 직접 입력할 수 있습니다"
              aria-invalid={Boolean(state.errors.food_name)}
            />
            <FieldError message={state.errors.food_name} />
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
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
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
                value={protein}
                onChange={(event) => setProtein(event.target.value)}
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
                value={carbs}
                onChange={(event) => setCarbs(event.target.value)}
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
                value={fat}
                onChange={(event) => setFat(event.target.value)}
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

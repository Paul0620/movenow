type MacroPreviewProps = {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export function MacroPreview({ calories, proteinG, carbsG, fatG }: MacroPreviewProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      실제 섭취량 기준 예상값: {calories} kcal / 단백질 {proteinG}g / 탄수화물 {carbsG}g / 지방{' '}
      {fatG}g
    </div>
  )
}

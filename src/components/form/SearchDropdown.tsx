'use client'

import type { ReactNode, RefObject } from 'react'

type SearchDropdownProps<T> = {
  results: T[]
  isOpen: boolean
  dropdownRef: RefObject<HTMLDivElement | null>
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
}

export function SearchDropdown<T>({
  results,
  isOpen,
  dropdownRef,
  getKey,
  renderItem,
}: SearchDropdownProps<T>) {
  if (!isOpen || results.length === 0) {
    return null
  }

  return (
    <div
      ref={dropdownRef}
      className="shadow-spotify-dialog absolute z-20 mt-2 w-full rounded-lg border border-border bg-popover p-2"
    >
      <div className="grid gap-2">
        {results.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

type SearchResponse<T> = {
  results: T[]
}

type UseSearchAutocompleteOptions = {
  defaultValue?: string
  endpoint: string
  onValueChange?: (value: string) => void
}

export function useSearchAutocomplete<T>({
  defaultValue,
  endpoint,
  onValueChange,
}: UseSearchAutocompleteOptions) {
  const rootRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState(defaultValue ?? '')
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setQuery(defaultValue ?? '')
  }, [defaultValue])

  useEffect(() => {
    const controller = new AbortController()
    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      return () => controller.abort()
    }

    const timeout = window.setTimeout(async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`${endpoint}?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          setResults([])
          setHasSearched(true)
          setIsOpen(true)
          return
        }

        const payload: SearchResponse<T> = await response.json()
        setResults(payload.results.slice(0, 5))
        setHasSearched(true)
        setIsOpen(true)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setResults([])
          setHasSearched(true)
          setIsOpen(true)
        }
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [endpoint, query])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!(event.target instanceof Node)) {
        return
      }

      if (
        !rootRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    onValueChange?.(value)
    setIsOpen(Boolean(value.trim()))
  }

  const handleFocus = () => {
    if (results.length > 0 || hasSearched) {
      setIsOpen(true)
    }
  }

  const applySelection = (value: string) => {
    setQuery(value)
    setResults([])
    setHasSearched(false)
    setIsOpen(false)
    onValueChange?.(value)
  }

  return {
    rootRef,
    dropdownRef,
    query,
    results,
    isLoading,
    showEmpty: isOpen && hasSearched && !isLoading && results.length === 0,
    showResults: isOpen && results.length > 0,
    handleChange,
    handleFocus,
    applySelection,
  }
}

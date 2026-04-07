'use client'

import { useState, useCallback, useRef } from 'react'

interface UseStreamCompletionOptions {
  api: string
  onFinish?: (prompt: string, completion: string) => void
  onError?: (error: Error) => void
}

interface UseStreamCompletionReturn {
  completion: string
  isLoading: boolean
  complete: (prompt: string, options?: { body?: string }) => void
  stop: () => void
}

export function useStreamCompletion({
  api,
  onFinish,
  onError,
}: UseStreamCompletionOptions): UseStreamCompletionReturn {
  const [completion, setCompletion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsLoading(false)
  }, [])

  const complete = useCallback(
    async (prompt: string, options?: { body?: string }) => {
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsLoading(true)
      setCompletion('')

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: options?.body || JSON.stringify({ prompt }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk
          setCompletion(fullText)
        }

        onFinish?.(prompt, fullText)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // User cancelled
        } else {
          onError?.(error instanceof Error ? error : new Error(String(error)))
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [api, onFinish, onError]
  )

  return { completion, isLoading, complete, stop }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { jobService } from '../../services/jobService'
import type { Engagement, FeedScope, Job } from '../../services/jobTypes'

interface FeedState {
  items: Job[]
  cursor: string | null
  loading: boolean
  error: boolean
  done: boolean
}

const initial: FeedState = { items: [], cursor: null, loading: false, error: false, done: false }

/** RF-07 a RF-09, RF-21: lista paginada por cursor de uma visão do feed. */
export function useJobFeed(scope: FeedScope) {
  const [state, setState] = useState<FeedState>(initial)
  // Evita chamadas em dobro e descarta respostas de uma visão anterior.
  const request = useRef(0)
  const busy = useRef(false)
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const load = useCallback(
    async (reset: boolean) => {
      const current = stateRef.current
      if (busy.current || (!reset && (current.done || current.error))) return
      busy.current = true
      const id = ++request.current
      setState((s) => ({ ...(reset ? initial : s), loading: true, error: false }))
      try {
        const page = await jobService.feed(scope, reset ? undefined : (current.cursor ?? undefined))
        if (id !== request.current) return
        setState((s) => ({
          items: [...s.items, ...page.items.filter((j) => !s.items.some((x) => x.id === j.id))],
          cursor: page.nextCursor,
          loading: false,
          error: false,
          done: page.nextCursor === null,
        }))
      } catch {
        if (id === request.current) setState((s) => ({ ...s, loading: false, error: true }))
      } finally {
        if (id === request.current) busy.current = false
      }
    },
    [scope],
  )

  useEffect(() => {
    const pending = request // contador de requisições, não um nó do DOM
    busy.current = false
    void load(true)
    return () => {
      pending.current++ // invalida a resposta pendente ao trocar de visão
    }
  }, [load])

  const loadMore = useCallback(() => void load(false), [load])

  const retry = useCallback(() => {
    setState((s) => ({ ...s, error: false }))
    stateRef.current = { ...stateRef.current, error: false }
    void load(stateRef.current.items.length === 0)
  }, [load])

  const updateJob = useCallback((id: string, engagement: Engagement) => {
    setState((s) => ({ ...s, items: s.items.map((j) => (j.id === id ? { ...j, ...engagement } : j)) }))
  }, [])

  return { ...state, loadMore, retry, updateJob }
}

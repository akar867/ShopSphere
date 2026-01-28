import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createShadowRun,
  createShadowRunDiff,
  fetchShadowRun,
  fetchShadowRunDiffs,
  fetchShadowRuns,
  fetchShadowSummary,
} from './api'
import type { CreateDiffFindingPayload, CreateShadowRunPayload } from './types'

export function useShadowSummary() {
  return useQuery({
    queryKey: ['shadowdeploy', 'summary'],
    queryFn: fetchShadowSummary,
  })
}

export function useShadowRuns(params?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['shadowdeploy', 'runs', params],
    queryFn: () => fetchShadowRuns(params),
  })
}

export function useShadowRun(runId: number) {
  return useQuery({
    queryKey: ['shadowdeploy', 'runs', runId],
    queryFn: () => fetchShadowRun(runId),
    enabled: Number.isFinite(runId),
  })
}

export function useShadowRunDiffs(runId: number) {
  return useQuery({
    queryKey: ['shadowdeploy', 'runs', runId, 'diffs'],
    queryFn: () => fetchShadowRunDiffs(runId),
    enabled: Number.isFinite(runId),
  })
}

export function useCreateShadowRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateShadowRunPayload) => createShadowRun(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shadowdeploy', 'runs'] })
      queryClient.invalidateQueries({ queryKey: ['shadowdeploy', 'summary'] })
    },
  })
}

export function useCreateShadowRunDiff(runId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDiffFindingPayload) => createShadowRunDiff(runId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shadowdeploy', 'runs', runId, 'diffs'] })
      queryClient.invalidateQueries({ queryKey: ['shadowdeploy', 'summary'] })
    },
  })
}

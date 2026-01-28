import { http } from '../../shared/api/http'
import type {
  CreateDiffFindingPayload,
  CreateShadowRunPayload,
  DiffFinding,
  ShadowRun,
  ShadowSummary,
} from './types'

export async function fetchShadowSummary() {
  const { data } = await http.get<ShadowSummary>('/api/shadowdeploy/summary')
  return data
}

export async function fetchShadowRuns(params?: { status?: string; limit?: number }) {
  const { data } = await http.get<ShadowRun[]>('/api/shadowdeploy/runs', { params })
  return data
}

export async function fetchShadowRun(runId: number) {
  const { data } = await http.get<ShadowRun>(`/api/shadowdeploy/runs/${runId}`)
  return data
}

export async function createShadowRun(payload: CreateShadowRunPayload) {
  const { data } = await http.post<ShadowRun>('/api/shadowdeploy/runs', payload)
  return data
}

export async function fetchShadowRunDiffs(runId: number) {
  const { data } = await http.get<DiffFinding[]>(`/api/shadowdeploy/runs/${runId}/diffs`)
  return data
}

export async function createShadowRunDiff(runId: number, payload: CreateDiffFindingPayload) {
  const { data } = await http.post<DiffFinding>(`/api/shadowdeploy/runs/${runId}/diffs`, payload)
  return data
}

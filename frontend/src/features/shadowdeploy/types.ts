export type RunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export type DiffType = 'HTTP_STATUS' | 'PAYLOAD' | 'LATENCY' | 'EXCEPTION' | 'DB_QUERY'

export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ShadowRun {
  id: number
  serviceName: string
  environment: string
  versionSha: string
  baseVersionSha?: string | null
  status: RunStatus
  startedAt: string
  completedAt?: string | null
  requestCount: number
  errorRate: number
  latencyP95DeltaMs: number
  riskScore: number
  trafficSamplePercent: number
  mockWrites: boolean
  aiSummary?: string | null
}

export interface DiffFinding {
  id: number
  runId: number
  type: DiffType
  severity: FindingSeverity
  endpoint: string
  summary: string
  impactPercent: number
  latencyDeltaMs: number
  baselineStatus?: number | null
  shadowStatus?: number | null
  example?: string | null
  aiExplanation?: string | null
}

export interface FindingHighlight {
  runId: number
  serviceName: string
  type: DiffType
  severity: FindingSeverity
  summary: string
  impactPercent: number
}

export interface ServiceRisk {
  serviceName: string
  averageRiskScore: number
  runCount: number
}

export interface ShadowSummary {
  totalRuns: number
  activeRuns: number
  highRiskRuns: number
  averageRiskScore: number
  totalFindings: number
  topFindings: FindingHighlight[]
  topServices: ServiceRisk[]
}

export interface CreateShadowRunPayload {
  serviceName: string
  environment: string
  versionSha: string
  baseVersionSha?: string | null
  trafficSamplePercent: number
  mockWrites: boolean
}

export interface CreateDiffFindingPayload {
  type: DiffType
  severity: FindingSeverity
  endpoint: string
  summary: string
  impactPercent: number
  latencyDeltaMs: number
  baselineStatus?: number | null
  shadowStatus?: number | null
  example?: string | null
  aiExplanation?: string | null
}

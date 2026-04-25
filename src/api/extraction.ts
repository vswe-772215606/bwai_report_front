import { apiClient } from "./client";
import type {
  ExtractionCandidate,
  ExtractionRun,
  RunExtractionRequest,
} from "../types/extraction";
import type { JsonValue } from "../types/common";

interface ExtractionRunResponse {
  id: number;
  upload_id: number;
  blueprint_id: number;
  workbook_index_run_id?: number | null;
  status?: string | null;
  summary_json?: JsonValue | null;
  unresolved_field_count?: number | null;
  low_confidence_field_count?: number | null;
  error_message?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
}

interface ExtractionCandidateResponse {
  id: number;
  run_id: number;
  blueprint_field_id?: number | null;
  field_key?: string | null;
  field_label?: string | null;
  formula?: string | null;
  candidate_kind?: string | null;
  source_sheet?: string | null;
  score?: number | null;
  rationale?: string | null;
  source_reference?: string | null;
  evidence_preview?: JsonValue | null;
  selected?: boolean | null;
  raw_json?: JsonValue | null;
  field?: {
    field_key?: string | null;
    label?: string | null;
    formula?: string | null;
  } | null;
}

function normalizeRun(run: ExtractionRunResponse): ExtractionRun {
  return {
    id: String(run.id),
    upload_id: String(run.upload_id),
    blueprint_id: String(run.blueprint_id),
    workbook_index_run_id:
      run.workbook_index_run_id == null ? null : String(run.workbook_index_run_id),
    status: run.status ?? "unknown",
    summary_json: run.summary_json ?? null,
    unresolved_field_count: run.unresolved_field_count ?? null,
    low_confidence_field_count: run.low_confidence_field_count ?? null,
    error_message: run.error_message ?? null,
    created_at: run.created_at ?? null,
    completed_at: run.completed_at ?? null,
  };
}

function normalizeCandidate(candidate: ExtractionCandidateResponse): ExtractionCandidate {
  return {
    id: String(candidate.id),
    run_id: String(candidate.run_id),
    blueprint_field_id:
      candidate.blueprint_field_id == null ? null : String(candidate.blueprint_field_id),
    field_key: candidate.field_key ?? candidate.field?.field_key ?? null,
    field_label: candidate.field_label ?? candidate.field?.label ?? null,
    formula: candidate.formula ?? candidate.field?.formula ?? null,
    candidate_kind: candidate.candidate_kind ?? null,
    source_sheet: candidate.source_sheet ?? null,
    score: candidate.score ?? null,
    rationale: candidate.rationale ?? null,
    source_reference: candidate.source_reference ?? null,
    evidence_preview: candidate.evidence_preview ?? null,
    selected: Boolean(candidate.selected),
    raw_json: candidate.raw_json ?? null,
  };
}

export async function runExtraction(data: RunExtractionRequest): Promise<ExtractionRun> {
  const res = await apiClient.post<ExtractionRunResponse>("/extraction/run", data);
  return normalizeRun(res.data);
}

export async function getExtractionRun(runId: string): Promise<ExtractionRun> {
  const res = await apiClient.get<ExtractionRunResponse>(`/extraction/${runId}`);
  return normalizeRun(res.data);
}

export async function getExtractionCandidates(runId: string): Promise<ExtractionCandidate[]> {
  const res = await apiClient.get<ExtractionCandidateResponse[]>(
    `/extraction/${runId}/candidates`
  );
  return res.data.map(normalizeCandidate);
}

export async function selectExtractionCandidate(
  candidateId: string
): Promise<ExtractionCandidate> {
  const res = await apiClient.post<ExtractionCandidateResponse>(
    `/extraction/candidates/${candidateId}/select`
  );
  return normalizeCandidate(res.data);
}

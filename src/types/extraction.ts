import type { JsonValue } from "./common";

export type ExtractionStatus = string;

export interface ExtractionRun {
  id: string;
  upload_id: string;
  blueprint_id: string;
  workbook_index_run_id: string | null;
  status: ExtractionStatus;
  summary_json: JsonValue | null;
  unresolved_field_count: number | null;
  low_confidence_field_count: number | null;
  error_message: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface ExtractionCandidate {
  id: string;
  run_id: string;
  blueprint_field_id: string | null;
  field_key: string | null;
  field_label: string | null;
  formula: string | null;
  candidate_kind: string | null;
  source_sheet: string | null;
  score: number | null;
  rationale: string | null;
  source_reference: string | null;
  evidence_preview: JsonValue | null;
  selected: boolean;
  raw_json: JsonValue | null;
}

export interface RunExtractionRequest {
  upload_id: string;
  blueprint_id: string;
  workbook_index_run_id?: string | null;
}

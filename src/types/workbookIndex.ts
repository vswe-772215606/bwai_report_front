import type { JsonValue } from "./common";

export type WorkbookIndexStatus = string;

export interface WorkbookIndexRun {
  id: string;
  upload_id: string;
  status: WorkbookIndexStatus;
  summary_json: JsonValue | null;
  error_message: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface WorkbookIndexSheet {
  id: string;
  run_id: string;
  sheet_name: string;
  row_count: number | null;
  column_count: number | null;
  detected_language: string | null;
  summary_json: JsonValue | null;
  table_summaries: JsonValue[] | null;
  row_label_candidates: JsonValue[] | null;
  column_profiles: JsonValue[] | null;
  raw_json: JsonValue | null;
}

export interface RunWorkbookIndexRequest {
  upload_id: string;
}

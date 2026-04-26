import type { JsonValue } from "./common";

export type BatchOutputFormat = "docx" | "pdf";
export type BatchStatus = string;

export interface DocumentBatchSummary {
  record_count: number | null;
  generated_count: number | null;
  skipped_count: number | null;
  generated_files: JsonValue[] | null;
  skipped_records: JsonValue[] | null;
  selected_sheet_names: string[] | null;
  document_name_field: string | null;
}

export interface DocumentBatchRun {
  id: string;
  blueprint_id: string;
  upload_ids: string[] | null;
  output_format: BatchOutputFormat | string;
  status: BatchStatus;
  created_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  summary_json: JsonValue | null;
  summary: DocumentBatchSummary;
  document_name_field: string | null;
}

export interface RunDocumentBatchRequest {
  blueprint_id: string;
  upload_ids: string[];
  output_format: BatchOutputFormat;
  sheet_names?: string[] | null;
  document_name_field?: string | null;
}

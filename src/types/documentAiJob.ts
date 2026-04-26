import type { JsonValue } from "./common";

export type DocumentAiDomain = "finance" | "hr" | string;
export type DocumentAiOutputFormat = "docx" | "pdf" | string;

export interface DocumentAiJobSummary {
  generated_count: number | null;
  skipped_count: number | null;
  generated_files: JsonValue[] | null;
  rejected_replacements: JsonValue[] | null;
  selected_sheet_names: string[] | null;
  ai_used_for_normalization: boolean | null;
  ai_used_for_replacement_planning: boolean | null;
}

export interface DocumentAiJob {
  id: string;
  status: string;
  domain: DocumentAiDomain | null;
  output_format: DocumentAiOutputFormat;
  created_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  source_filename: string | null;
  upload_ids: string[] | null;
  summary_json: JsonValue | null;
  summary: DocumentAiJobSummary;
}

export interface RunDocumentAiJobRequest {
  source_file: File;
  upload_ids: string[];
  domain: DocumentAiDomain;
  output_format: Extract<DocumentAiOutputFormat, "docx" | "pdf">;
  sheet_names?: string[] | null;
}

export type TableStatus =
  | "detected"
  | "header_confirmed";

export interface RawTable {
  id: string;
  upload_id: string;
  sheet_name: string;
  table_index: number;
  start_row: number;
  end_row: number;
  start_col: number;
  end_col: number;
  detected_header_row: number | null;
  header_depth: number;
  confidence_score: number;
  user_confirmed_header: boolean;
  status: TableStatus;
  column_count: number;
  row_count: number;
  has_duplicate_columns: boolean;
  created_at: string;
}

export interface ColumnInfo {
  index: number;
  name: string;
  path: string;
  is_duplicate: boolean;
}

export interface TablePreview {
  table_id: string;
  sheet_name: string;
  headers: ColumnInfo[];
  rows: Record<string, unknown>[];
  total_rows: number;
  confidence_score: number;
  detected_header_row: number | null;
  header_depth: number;
}

export interface AIHeaderSuggestion {
  suggested_header_row: number;
  confidence: number;
  reasoning: string;
}

export interface NormalizeResponse {
  table_id: string;
  normalized_rows_created: number;
  failed_rows: number;
  failed_row_indices: number[];
}

export type TableStatus =
  | "detected"
  | "header_confirmed"
  | "normalized"
  | "needs_review";

export interface RawTable {
  id: string;
  upload_id: string;
  sheet_name: string;
  table_index: number;
  start_row: number;
  end_row: number;
  detected_header_row: number;
  confirmed_header_row?: number;
  confidence_score: number;
  status: TableStatus;
  column_count: number;
  row_count: number;
  has_duplicate_columns: boolean;
}

export interface ColumnInfo {
  index: number;
  name: string;
  path: string;
  is_duplicate: boolean;
}

export interface TablePreview {
  table_id: string;
  headers: ColumnInfo[];
  rows: Record<string, unknown>[];
  total_rows: number;
}

export interface AIHeaderSuggestion {
  suggested_header_row: number;
  confidence: number;
  reasoning: string;
}

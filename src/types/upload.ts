export type UploadStatus = string;

export interface WorkbookSheet {
  id: string;
  upload_id: string;
  sheet_name: string;
  row_count: number;
  column_count: number;
  detected_language: string | null;
  created_at: string;
}

export interface UploadTable {
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
  confidence_score: number | null;
  user_confirmed_header: boolean;
  status: string;
  row_count: number;
  column_count: number;
  has_duplicate_columns: boolean;
  created_at: string;
}

export interface UploadTableColumn {
  index: number;
  name: string;
  path: string;
  is_duplicate: boolean;
}

export interface UploadTablePreview {
  table_id: string;
  sheet_name: string;
  headers: UploadTableColumn[];
  rows: Record<string, unknown>[];
  total_rows: number;
  confidence_score: number | null;
  detected_header_row: number | null;
  header_depth: number;
}

export interface Upload {
  id: string;
  user_id: string;
  original_filename: string;
  file_hash: string | null;
  status: UploadStatus;
  is_duplicate: boolean;
  created_at: string;
}

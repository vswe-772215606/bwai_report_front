export type UploadStatus =
  | "uploaded"
  | "parsing"
  | "parsed"
  | "error"
  | "duplicate";

export interface WorkbookSheet {
  sheet_name: string;
  row_count: number;
  col_count: number;
}

export interface Upload {
  id: string;
  filename: string;
  file_size: number;
  status: UploadStatus;
  sheet_count: number;
  table_count: number;
  duplicate_of?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadDetail extends Upload {
  sheets: WorkbookSheet[];
}

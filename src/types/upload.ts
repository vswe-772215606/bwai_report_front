export type UploadStatus =
  | "uploaded"
  | "parsed"
  | "failed";

export interface WorkbookSheet {
  id: string;
  upload_id: string;
  sheet_name: string;
  row_count: number;
  column_count: number;
  detected_language: string | null;
  created_at: string;
}

export interface Upload {
  id: string;
  user_id: string;
  original_filename: string;
  file_hash: string;
  status: UploadStatus;
  is_duplicate: boolean;
  created_at: string;
}

export type UploadDetail = Upload;

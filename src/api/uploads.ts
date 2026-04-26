import { apiClient } from "./client";
import type {
  Upload,
  UploadTable,
  UploadTableColumn,
  UploadTablePreview,
  WorkbookSheet,
} from "../types/upload";

interface UploadResponse {
  id: number;
  user_id?: number | null;
  original_filename: string;
  file_hash?: string | null;
  status: Upload["status"];
  is_duplicate?: boolean | null;
  created_at: string;
}

interface SheetInfoResponse {
  id: number;
  upload_id: number;
  sheet_name: string;
  row_count: number;
  column_count: number;
  detected_language: string | null;
  created_at: string;
}

interface UploadTableResponse {
  id: number;
  upload_id: number;
  sheet_name: string;
  table_index: number;
  start_row: number;
  end_row: number;
  start_col: number;
  end_col: number;
  detected_header_row?: number | null;
  header_depth?: number | null;
  confidence_score?: number | null;
  user_confirmed_header?: boolean | null;
  preview_json?: {
    headers?: string[];
    column_paths?: string[];
    [key: string]: unknown;
  };
  created_at: string;
}

interface UploadTablePreviewResponse {
  table_id: number;
  sheet_name: string;
  headers?: string[];
  column_paths?: string[];
  sample_rows?: Record<string, unknown>[];
  rows?: Record<string, unknown>[];
  total_rows?: number | null;
  confidence_score?: number | null;
  detected_header_row?: number | null;
  header_depth?: number | null;
}

function normalizeUpload(upload: UploadResponse): Upload {
  return {
    id: String(upload.id),
    user_id: String(upload.user_id ?? ""),
    original_filename: upload.original_filename,
    file_hash: upload.file_hash ?? null,
    status: upload.status,
    is_duplicate: Boolean(upload.is_duplicate),
    created_at: upload.created_at,
  };
}

function normalizeSheet(sheet: SheetInfoResponse): WorkbookSheet {
  return {
    id: String(sheet.id),
    upload_id: String(sheet.upload_id),
    sheet_name: sheet.sheet_name,
    row_count: sheet.row_count,
    column_count: sheet.column_count,
    detected_language: sheet.detected_language,
    created_at: sheet.created_at,
  };
}

function normalizeColumns(headers: string[], paths: string[]): UploadTableColumn[] {
  const counts = new Map<string, number>();

  for (const header of headers) {
    counts.set(header, (counts.get(header) ?? 0) + 1);
  }

  return headers.map((header, index) => ({
    index,
    name: header,
    path: paths[index] ?? header,
    is_duplicate: (counts.get(header) ?? 0) > 1,
  }));
}

function normalizeUploadTable(table: UploadTableResponse): UploadTable {
  const previewHeaders = Array.isArray(table.preview_json?.headers)
    ? table.preview_json.headers
    : [];

  return {
    id: String(table.id),
    upload_id: String(table.upload_id),
    sheet_name: table.sheet_name,
    table_index: table.table_index,
    start_row: table.start_row,
    end_row: table.end_row,
    start_col: table.start_col,
    end_col: table.end_col,
    detected_header_row: table.detected_header_row ?? null,
    header_depth: table.header_depth ?? 1,
    confidence_score: table.confidence_score ?? null,
    user_confirmed_header: Boolean(table.user_confirmed_header),
    status: table.user_confirmed_header ? "header_confirmed" : "detected",
    row_count: table.end_row - table.start_row + 1,
    column_count: table.end_col - table.start_col + 1,
    has_duplicate_columns: new Set(previewHeaders).size !== previewHeaders.length,
    created_at: table.created_at,
  };
}

function normalizeUploadTablePreview(
  preview: UploadTablePreviewResponse
): UploadTablePreview {
  const headers = Array.isArray(preview.headers) ? preview.headers : [];
  const columnPaths = Array.isArray(preview.column_paths) ? preview.column_paths : [];

  return {
    table_id: String(preview.table_id),
    sheet_name: preview.sheet_name,
    headers: normalizeColumns(headers, columnPaths),
    rows: preview.sample_rows ?? preview.rows ?? [],
    total_rows: preview.total_rows ?? 0,
    confidence_score: preview.confidence_score ?? null,
    detected_header_row: preview.detected_header_row ?? null,
    header_depth: preview.header_depth ?? 1,
  };
}

export async function uploadExcel(file: File): Promise<Upload> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post<UploadResponse>("/uploads/excel", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizeUpload(res.data);
}

export async function getUploads(): Promise<Upload[]> {
  const res = await apiClient.get<UploadResponse[]>("/uploads");
  return res.data.map(normalizeUpload);
}

export async function getUploadSheets(uploadId: string): Promise<WorkbookSheet[]> {
  const res = await apiClient.get<SheetInfoResponse[]>(`/uploads/${uploadId}/sheets`);
  return res.data.map(normalizeSheet);
}

export async function getUploadTables(uploadId: string): Promise<UploadTable[]> {
  const res = await apiClient.get<UploadTableResponse[]>(`/uploads/${uploadId}/tables`);
  return res.data.map(normalizeUploadTable);
}

export async function getUploadTablePreview(
  uploadId: string,
  tableId: string
): Promise<UploadTablePreview> {
  const res = await apiClient.get<UploadTablePreviewResponse>(
    `/uploads/${uploadId}/tables/${tableId}/preview`
  );

  return normalizeUploadTablePreview(res.data);
}

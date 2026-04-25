import { apiClient } from "./client";
import type {
  ColumnInfo,
  NormalizeResponse,
  RawTable,
  TablePreview,
} from "../types/table";

interface RawTableResponse {
  id: number;
  upload_id: number;
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
  preview_json: {
    headers?: string[];
    column_paths?: string[];
    rows?: Record<string, unknown>[];
    total_rows?: number;
    [key: string]: unknown;
  };
  created_at: string;
}

interface TablePreviewResponse {
  table_id: number;
  sheet_name: string;
  headers: string[];
  column_paths: string[];
  sample_rows: Record<string, unknown>[];
  total_rows: number;
  confidence_score: number;
  detected_header_row: number | null;
  header_depth: number;
}

function normalizeColumns(headers: string[], columnPaths: string[]): ColumnInfo[] {
  const counts = new Map<string, number>();
  headers.forEach((header) => {
    counts.set(header, (counts.get(header) ?? 0) + 1);
  });

  return headers.map((header, index) => ({
    index,
    name: header,
    path: columnPaths[index] ?? header,
    is_duplicate: (counts.get(header) ?? 0) > 1,
  }));
}

function normalizeRawTable(table: RawTableResponse): RawTable {
  const previewHeaders = Array.isArray(table.preview_json.headers)
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
    detected_header_row: table.detected_header_row,
    header_depth: table.header_depth,
    confidence_score: table.confidence_score,
    user_confirmed_header: table.user_confirmed_header,
    status: table.user_confirmed_header ? "header_confirmed" : "detected",
    column_count: table.end_col - table.start_col + 1,
    row_count: table.end_row - table.start_row + 1,
    has_duplicate_columns: new Set(previewHeaders).size !== previewHeaders.length,
    created_at: table.created_at,
  };
}

function normalizePreview(preview: TablePreviewResponse): TablePreview {
  return {
    table_id: String(preview.table_id),
    sheet_name: preview.sheet_name,
    headers: normalizeColumns(preview.headers ?? [], preview.column_paths ?? []),
    rows: preview.sample_rows ?? [],
    total_rows: preview.total_rows,
    confidence_score: preview.confidence_score,
    detected_header_row: preview.detected_header_row,
    header_depth: preview.header_depth,
  };
}

export async function getUploadTables(uploadId: string): Promise<RawTable[]> {
  const res = await apiClient.get<RawTableResponse[]>(`/uploads/${uploadId}/tables`);
  return res.data.map(normalizeRawTable);
}

export async function getTablePreview(
  uploadId: string,
  tableId: string
): Promise<TablePreview> {
  const res = await apiClient.get<TablePreviewResponse>(
    `/uploads/${uploadId}/tables/${tableId}/preview`
  );
  return normalizePreview(res.data);
}

export async function confirmTableHeader(
  tableId: string,
  headerRow: number
): Promise<RawTable> {
  const res = await apiClient.post<RawTableResponse>(
    `/tables/${tableId}/confirm-header`,
    { header_row: headerRow }
  );
  return normalizeRawTable(res.data);
}

export async function normalizeTable(tableId: string): Promise<NormalizeResponse> {
  const res = await apiClient.post<NormalizeResponse>(`/tables/${tableId}/normalize`);
  return {
    ...res.data,
    table_id: String(res.data.table_id),
  };
}

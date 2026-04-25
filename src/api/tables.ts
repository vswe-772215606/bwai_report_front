import { apiClient } from "./client";
import type { RawTable, TablePreview } from "../types/table";

export async function getUploadTables(uploadId: string): Promise<RawTable[]> {
  const res = await apiClient.get<RawTable[]>(`/uploads/${uploadId}/tables`);
  return res.data;
}

export async function getTablePreview(
  uploadId: string,
  tableId: string
): Promise<TablePreview> {
  const res = await apiClient.get<TablePreview>(
    `/uploads/${uploadId}/tables/${tableId}/preview`
  );
  return res.data;
}

export async function confirmTableHeader(
  tableId: string,
  headerRow: number
): Promise<RawTable> {
  const res = await apiClient.post<RawTable>(
    `/tables/${tableId}/confirm-header`,
    { header_row: headerRow }
  );
  return res.data;
}

export async function normalizeTable(tableId: string): Promise<RawTable> {
  const res = await apiClient.post<RawTable>(`/tables/${tableId}/normalize`);
  return res.data;
}

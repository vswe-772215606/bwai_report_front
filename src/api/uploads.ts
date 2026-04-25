import { apiClient } from "./client";
import type { Upload, UploadDetail, WorkbookSheet } from "../types/upload";

interface UploadResponse {
  id: number;
  user_id: number;
  original_filename: string;
  file_hash: string;
  status: Upload["status"];
  is_duplicate: boolean;
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

function normalizeUpload(upload: UploadResponse): Upload {
  return {
    id: String(upload.id),
    user_id: String(upload.user_id),
    original_filename: upload.original_filename,
    file_hash: upload.file_hash,
    status: upload.status,
    is_duplicate: upload.is_duplicate,
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

export async function getUpload(uploadId: string): Promise<UploadDetail> {
  const res = await apiClient.get<UploadResponse>(`/uploads/${uploadId}`);
  return normalizeUpload(res.data);
}

export async function getUploadSheets(uploadId: string): Promise<WorkbookSheet[]> {
  const res = await apiClient.get<SheetInfoResponse[]>(`/uploads/${uploadId}/sheets`);
  return res.data.map(normalizeSheet);
}

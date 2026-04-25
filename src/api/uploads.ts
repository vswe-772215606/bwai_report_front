import { apiClient } from "./client";
import type { Upload, UploadDetail, WorkbookSheet } from "../types/upload";

export async function uploadExcel(file: File): Promise<Upload> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post<Upload>("/uploads/excel", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getUploads(): Promise<Upload[]> {
  const res = await apiClient.get<Upload[]>("/uploads");
  return res.data;
}

export async function getUpload(uploadId: string): Promise<UploadDetail> {
  const res = await apiClient.get<UploadDetail>(`/uploads/${uploadId}`);
  return res.data;
}

export async function getUploadSheets(uploadId: string): Promise<WorkbookSheet[]> {
  const res = await apiClient.get<WorkbookSheet[]>(`/uploads/${uploadId}/sheets`);
  return res.data;
}

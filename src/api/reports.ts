import { apiClient } from "./client";
import type { GeneratedReport, GenerateReportRequest } from "../types/report";

export async function generateReport(data: GenerateReportRequest): Promise<GeneratedReport> {
  const res = await apiClient.post<GeneratedReport>("/reports/generate", data);
  return res.data;
}

export async function getReports(): Promise<GeneratedReport[]> {
  const res = await apiClient.get<GeneratedReport[]>("/reports");
  return res.data;
}

export async function getReport(reportId: string): Promise<GeneratedReport> {
  const res = await apiClient.get<GeneratedReport>(`/reports/${reportId}`);
  return res.data;
}

export async function downloadReport(reportId: string): Promise<Blob> {
  const res = await apiClient.get(`/reports/${reportId}/download`, {
    responseType: "blob",
  });
  return res.data;
}

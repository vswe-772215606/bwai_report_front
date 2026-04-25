import axios from "axios";
import { apiClient } from "./client";
import type {
  RunWorkbookIndexRequest,
  WorkbookIndexRun,
  WorkbookIndexSheet,
} from "../types/workbookIndex";
import type { JsonValue } from "../types/common";

interface WorkbookIndexRunResponse {
  id: number;
  upload_id: number;
  status?: string | null;
  summary_json?: JsonValue | null;
  error_message?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
}

interface WorkbookIndexSheetResponse {
  id?: number | null;
  run_id?: number | null;
  sheet_name: string;
  row_count?: number | null;
  column_count?: number | null;
  detected_language?: string | null;
  summary_json?: JsonValue | null;
  table_summaries?: JsonValue[] | null;
  row_label_candidates?: JsonValue[] | null;
  column_profiles?: JsonValue[] | null;
  raw_json?: JsonValue | null;
}

function normalizeRun(run: WorkbookIndexRunResponse): WorkbookIndexRun {
  return {
    id: String(run.id),
    upload_id: String(run.upload_id),
    status: run.status ?? "unknown",
    summary_json: run.summary_json ?? null,
    error_message: run.error_message ?? null,
    created_at: run.created_at ?? null,
    completed_at: run.completed_at ?? null,
  };
}

function normalizeSheet(sheet: WorkbookIndexSheetResponse, runId: string): WorkbookIndexSheet {
  return {
    id: sheet.id == null ? `${runId}:${sheet.sheet_name}` : String(sheet.id),
    run_id: sheet.run_id == null ? runId : String(sheet.run_id),
    sheet_name: sheet.sheet_name,
    row_count: sheet.row_count ?? null,
    column_count: sheet.column_count ?? null,
    detected_language: sheet.detected_language ?? null,
    summary_json: sheet.summary_json ?? null,
    table_summaries: sheet.table_summaries ?? null,
    row_label_candidates: sheet.row_label_candidates ?? null,
    column_profiles: sheet.column_profiles ?? null,
    raw_json: sheet.raw_json ?? null,
  };
}

export async function runWorkbookIndex(
  data: RunWorkbookIndexRequest
): Promise<WorkbookIndexRun> {
  const res = await apiClient.post<WorkbookIndexRunResponse>("/workbook-index/run", data);
  return normalizeRun(res.data);
}

export async function getLatestWorkbookIndexForUpload(
  uploadId: string
): Promise<WorkbookIndexRun | null> {
  try {
    const res = await apiClient.get<WorkbookIndexRunResponse | null>(
      `/workbook-index/upload/${uploadId}/latest`
    );
    return res.data ? normalizeRun(res.data) : null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getWorkbookIndexRun(runId: string): Promise<WorkbookIndexRun> {
  const res = await apiClient.get<WorkbookIndexRunResponse>(`/workbook-index/${runId}`);
  return normalizeRun(res.data);
}

export async function getWorkbookIndexSheets(runId: string): Promise<WorkbookIndexSheet[]> {
  const res = await apiClient.get<WorkbookIndexSheetResponse[]>(
    `/workbook-index/${runId}/sheets`
  );
  return res.data.map((sheet) => normalizeSheet(sheet, runId));
}

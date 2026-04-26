import { apiClient } from "./client";
import type {
  DocumentBatchRun,
  DocumentBatchSummary,
  RunDocumentBatchRequest,
} from "../types/documentBatch";
import type { JsonValue } from "../types/common";

interface DocumentBatchRunResponse {
  id: number | string;
  blueprint_id: number | string;
  upload_ids?: Array<number | string> | null;
  output_format?: string | null;
  status?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  summary_json?: JsonValue | null;
  document_name_field?: string | null;
}

function asRecord(value: JsonValue | null | undefined): Record<string, JsonValue> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, JsonValue>;
}

function asNumber(value: JsonValue | undefined): number | null {
  return typeof value === "number" ? value : null;
}

function asStringArray(value: JsonValue | undefined): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry);
}

function asArray(value: JsonValue | undefined): JsonValue[] | null {
  return Array.isArray(value) ? value : null;
}

function asString(value: JsonValue | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeSummary(summaryJson: JsonValue | null | undefined): DocumentBatchSummary {
  const summary = asRecord(summaryJson);

  return {
    record_count: asNumber(summary?.record_count),
    generated_count: asNumber(summary?.generated_count),
    skipped_count: asNumber(summary?.skipped_count),
    generated_files: asArray(summary?.generated_files),
    skipped_records: asArray(summary?.skipped_records),
    selected_sheet_names: asStringArray(summary?.selected_sheet_names),
    document_name_field: asString(summary?.document_name_field),
  };
}

function normalizeBatchRun(run: DocumentBatchRunResponse): DocumentBatchRun {
  const summary = normalizeSummary(run.summary_json);

  return {
    id: String(run.id),
    blueprint_id: String(run.blueprint_id),
    upload_ids: Array.isArray(run.upload_ids) ? run.upload_ids.map((id) => String(id)) : null,
    output_format: run.output_format ?? "docx",
    status: run.status ?? "unknown",
    created_at: run.created_at ?? null,
    completed_at: run.completed_at ?? null,
    error_message: run.error_message ?? null,
    summary_json: run.summary_json ?? null,
    summary,
    document_name_field: run.document_name_field ?? null,
  };
}

function normalizeRunRequest(data: RunDocumentBatchRequest) {
  return {
    blueprint_id: Number(data.blueprint_id),
    upload_ids: data.upload_ids.map((id) => Number(id)),
    output_format: data.output_format,
    sheet_names: data.sheet_names && data.sheet_names.length > 0 ? data.sheet_names : null,
    document_name_field: data.document_name_field ?? null,
  };
}

export async function runDocumentBatch(
  data: RunDocumentBatchRequest
): Promise<DocumentBatchRun> {
  const res = await apiClient.post<DocumentBatchRunResponse>(
    "/document-batches/run",
    normalizeRunRequest(data)
  );
  return normalizeBatchRun(res.data);
}

export async function getDocumentBatches(): Promise<DocumentBatchRun[]> {
  const res = await apiClient.get<DocumentBatchRunResponse[]>("/document-batches");
  return res.data.map(normalizeBatchRun);
}

export async function getDocumentBatch(batchRunId: string): Promise<DocumentBatchRun> {
  const res = await apiClient.get<DocumentBatchRunResponse>(
    `/document-batches/${batchRunId}`
  );
  return normalizeBatchRun(res.data);
}

export async function downloadDocumentBatch(
  batchRunId: string
): Promise<{ blob: Blob; filename: string | null }> {
  const res = await apiClient.get(`/document-batches/${batchRunId}/download`, {
    responseType: "blob",
  });

  const disposition = res.headers["content-disposition"] as string | undefined;
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i);

  return {
    blob: res.data,
    filename: filenameMatch?.[1] ?? null,
  };
}

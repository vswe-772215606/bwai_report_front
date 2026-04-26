import { apiClient } from "./client";
import type { JsonValue } from "../types/common";
import type { DocumentAiJob, DocumentAiJobSummary, RunDocumentAiJobRequest } from "../types/documentAiJob";

interface DocumentAiJobResponse {
  id?: number | string | null;
  job_id?: number | string | null;
  status?: string | null;
  domain?: string | null;
  output_format?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  source_filename?: string | null;
  source_document_name?: string | null;
  upload_ids?: Array<number | string> | null;
  generated_count?: number | null;
  skipped_count?: number | null;
  generated_files?: JsonValue[] | null;
  rejected_replacements?: JsonValue[] | null;
  ai_used_for_normalization?: boolean | null;
  ai_used_for_replacement_planning?: boolean | null;
  selected_sheet_names?: string[] | null;
  summary_json?: JsonValue | null;
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

function asBoolean(value: JsonValue | undefined): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asArray(value: JsonValue | undefined): JsonValue[] | null {
  return Array.isArray(value) ? value : null;
}

function asString(value: JsonValue | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function asStringArray(value: JsonValue | undefined): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function normalizeSummary(job: DocumentAiJobResponse): DocumentAiJobSummary {
  const summary = asRecord(job.summary_json);

  return {
    generated_count: job.generated_count ?? asNumber(summary?.generated_count),
    skipped_count: job.skipped_count ?? asNumber(summary?.skipped_count),
    generated_files: job.generated_files ?? asArray(summary?.generated_files),
    rejected_replacements:
      job.rejected_replacements ?? asArray(summary?.rejected_replacements),
    selected_sheet_names:
      job.selected_sheet_names ?? asStringArray(summary?.selected_sheet_names),
    ai_used_for_normalization:
      job.ai_used_for_normalization ?? asBoolean(summary?.ai_used_for_normalization),
    ai_used_for_replacement_planning:
      job.ai_used_for_replacement_planning ??
      asBoolean(summary?.ai_used_for_replacement_planning),
  };
}

function normalizeJob(job: DocumentAiJobResponse): DocumentAiJob {
  return {
    id: String(job.id ?? job.job_id ?? ""),
    status: job.status ?? "unknown",
    domain: job.domain ?? null,
    output_format: job.output_format ?? "docx",
    created_at: job.created_at ?? null,
    completed_at: job.completed_at ?? null,
    error_message: job.error_message ?? null,
    source_filename: job.source_filename ?? job.source_document_name ?? null,
    upload_ids: Array.isArray(job.upload_ids) ? job.upload_ids.map((id) => String(id)) : null,
    summary_json: job.summary_json ?? null,
    summary: normalizeSummary(job),
  };
}

export async function runDocumentAiJob(
  data: RunDocumentAiJobRequest
): Promise<DocumentAiJob> {
  const form = new FormData();
  form.append("file", data.source_file);
  form.append("domain", data.domain);
  form.append("output_format", data.output_format);

  for (const uploadId of data.upload_ids) {
    form.append("upload_ids", uploadId);
  }

  for (const sheetName of data.sheet_names ?? []) {
    form.append("sheet_names", sheetName);
  }

  const res = await apiClient.post<DocumentAiJobResponse>("/document-ai-jobs/run", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return normalizeJob(res.data);
}

export async function getDocumentAiJobs(): Promise<DocumentAiJob[]> {
  const res = await apiClient.get<DocumentAiJobResponse[]>("/document-ai-jobs");
  return res.data.map(normalizeJob);
}

export async function getDocumentAiJob(jobId: string): Promise<DocumentAiJob> {
  const res = await apiClient.get<DocumentAiJobResponse>(`/document-ai-jobs/${jobId}`);
  return normalizeJob(res.data);
}

export async function downloadDocumentAiJob(
  jobId: string
): Promise<{ blob: Blob; filename: string | null }> {
  const res = await apiClient.get(`/document-ai-jobs/${jobId}/download`, {
    responseType: "blob",
  });

  const disposition = res.headers["content-disposition"] as string | undefined;
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i);

  return {
    blob: res.data,
    filename: filenameMatch?.[1] ?? null,
  };
}

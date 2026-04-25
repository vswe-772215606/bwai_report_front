import { apiClient } from "./client";
import type { AIHeaderSuggestion } from "../types/table";
import type { AIColumnMappingResponse } from "../types/mapping";

export interface SuggestHeaderRequest {
  upload_id: string;
  table_id: string;
}

export interface SuggestMappingRequest {
  upload_id: string;
  table_id: string;
  template_id: string;
}

export async function suggestHeaderRow(
  data: SuggestHeaderRequest
): Promise<AIHeaderSuggestion> {
  const res = await apiClient.post<AIHeaderSuggestion>(
    "/ai/suggest-header-row",
    data
  );
  return res.data;
}

export async function suggestColumnMapping(
  data: SuggestMappingRequest
): Promise<AIColumnMappingResponse> {
  const res = await apiClient.post<AIColumnMappingResponse>(
    "/ai/suggest-column-mapping",
    data
  );
  return res.data;
}

export async function explainValidation(issueId: string): Promise<{ explanation: string }> {
  const res = await apiClient.post<{ explanation: string }>(
    "/ai/explain-validation",
    { issue_id: issueId }
  );
  return res.data;
}

import { apiClient } from "./client";
import type { CreateBlueprintFieldRequest } from "../types/blueprint";
import type { JsonValue } from "../types/common";

export interface SuggestHeaderRequest {
  upload_id: string;
  table_id: string;
}

export interface SuggestTemplateFieldsRequest {
  title: string;
  document_domain: string;
  document_type: string;
  blueprint_json?: JsonValue | null;
  existing_fields?: Array<Pick<CreateBlueprintFieldRequest, "field_key" | "label">>;
}

interface SuggestedTemplateFieldResponse {
  field_key?: string | null;
  label?: string | null;
  data_type?: string | null;
  required?: boolean | null;
  formula?: string | null;
  display_order?: number | null;
  hints_json?: JsonValue | null;
}

interface SuggestTemplateFieldsEnvelope {
  fields?: SuggestedTemplateFieldResponse[];
  suggestions?: SuggestedTemplateFieldResponse[];
}

export interface SuggestedTemplateField {
  field_key: string;
  label: string;
  data_type: string;
  required: boolean;
  formula: string | null;
  display_order: number | null;
  hints_json: JsonValue | null;
}

export interface HeaderRowSuggestion {
  suggested_header_row: number;
  confidence: number;
  reasoning: string;
}

export async function suggestHeaderRow(
  data: SuggestHeaderRequest
): Promise<HeaderRowSuggestion> {
  const res = await apiClient.post<HeaderRowSuggestion>(
    "/ai/suggest-header-row",
    data
  );
  return res.data;
}

export async function suggestTemplateFields(
  data: SuggestTemplateFieldsRequest
): Promise<SuggestedTemplateField[]> {
  const res = await apiClient.post<
    SuggestedTemplateFieldResponse[] | SuggestTemplateFieldsEnvelope
  >("/ai/suggest-template-fields", data);

  const rawItems = Array.isArray(res.data)
    ? res.data
    : res.data.fields ?? res.data.suggestions ?? [];

  return rawItems.map((field, index) => ({
    field_key: field.field_key ?? `field_${index + 1}`,
    label: field.label ?? field.field_key ?? `Field ${index + 1}`,
    data_type: field.data_type ?? "string",
    required: Boolean(field.required),
    formula: field.formula ?? null,
    display_order: field.display_order ?? index + 1,
    hints_json: field.hints_json ?? null,
  }));
}

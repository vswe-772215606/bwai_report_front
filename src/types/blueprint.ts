import type { JsonValue } from "./common";

export type BlueprintSourceType = "manual" | "docx" | string;
export type BlueprintStatus = string;

export interface Blueprint {
  id: string;
  title: string;
  document_domain: string | null;
  document_type: string | null;
  supports_batch_generation: boolean;
  status: BlueprintStatus | null;
  source_type: BlueprintSourceType | null;
  parse_error: string | null;
  blueprint_json: JsonValue | null;
  created_at: string;
  updated_at?: string | null;
  user_id?: string | null;
}

export interface BlueprintField {
  id: string;
  blueprint_id: string;
  section_key: string | null;
  field_key: string;
  label: string;
  data_type: string;
  required: boolean;
  formula: string | null;
  display_order: number | null;
  hints_json: JsonValue | null;
}

export interface CreateBlueprintRequest {
  title: string;
  document_domain?: string | null;
  document_type?: string | null;
  supports_batch_generation?: boolean;
  source_type?: BlueprintSourceType | null;
  blueprint_json?: JsonValue | null;
  fields?: CreateBlueprintFieldRequest[];
}

export interface CreateBlueprintFieldRequest {
  section_key?: string | null;
  field_key: string;
  label: string;
  data_type: string;
  required?: boolean;
  formula?: string | null;
  display_order?: number | null;
  hints_json?: JsonValue | null;
}

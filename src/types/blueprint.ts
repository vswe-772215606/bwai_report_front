import type { JsonValue } from "./common";

export type ReportType = "pnl" | "cash_flow" | "balance_sheet" | "kpi";

export type BlueprintSourceType = "manual" | "docx" | "pdf" | string;
export type BlueprintStatus = string;

export interface Blueprint {
  id: string;
  title: string;
  report_type: ReportType | string | null;
  status: BlueprintStatus | null;
  source_type: BlueprintSourceType | null;
  parse_error: string | null;
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
  report_type?: ReportType | string | null;
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

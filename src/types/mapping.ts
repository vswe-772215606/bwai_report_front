import type { AggregationType } from "./template";

export type MappingStatus =
  | "suggested"
  | "confirmed"
  | "needs_review"
  | "error"
  | "unmapped";

export interface Mapping {
  id: string;
  template_id: string;
  upload_id: string;
  table_id: string;
  field_key: string;
  field_label: string;
  required: boolean;
  source_sheet?: string;
  source_column?: string;
  source_column_index?: number;
  aggregation_type: AggregationType;
  ai_confidence?: number;
  status: MappingStatus;
  user_overridden: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIColumnMappingResponse {
  upload_id: string;
  table_id: string;
  template_id: string;
  suggestions: AIMappingSuggestion[];
  overall_confidence: number;
}

export interface AIMappingSuggestion {
  field_key: string;
  field_label: string;
  required: boolean;
  source_sheet?: string;
  source_column?: string;
  source_column_index?: number;
  aggregation_type: AggregationType;
  confidence: number;
  reasoning?: string;
}

export interface ConfirmMappingRequest {
  upload_id: string;
  table_id: string;
  template_id: string;
  mappings: ConfirmMappingItem[];
}

export interface ConfirmMappingItem {
  field_key: string;
  source_sheet?: string;
  source_column?: string;
  source_column_index?: number;
  aggregation_type: AggregationType;
}

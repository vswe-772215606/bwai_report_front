export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationIssueType =
  | "missing_required_field"
  | "invalid_value"
  | "negative_balance"
  | "formula_mismatch"
  | "duplicate_mapping"
  | "unmapped_required"
  | "data_type_mismatch"
  | "missing_data"
  | "other";

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  issue_type: ValidationIssueType;
  message: string;
  affected_sheet?: string;
  affected_row?: number;
  affected_column?: string;
  expected_value?: string;
  actual_value?: string;
  mapping_related: boolean;
  field_key?: string;
}

export interface ValidationResult {
  upload_id: string;
  template_id?: string;
  run_at: string;
  error_count: number;
  warning_count: number;
  info_count: number;
  has_blocking_errors: boolean;
  issues: ValidationIssue[];
}

export interface ValidationRunRequest {
  upload_id: string;
  template_id: string;
  table_id: string;
}

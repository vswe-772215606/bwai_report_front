export type ReportType =
  | "pnl"
  | "cash_flow"
  | "balance_sheet"
  | "kpi";

export type FieldDataType =
  | "currency"
  | "percentage"
  | "integer"
  | "text"
  | "date";

export type AggregationType =
  | "sum"
  | "avg"
  | "first"
  | "last"
  | "count"
  | "formula";

export interface Template {
  id: string;
  name: string;
  report_type: ReportType;
  description?: string;
  has_docx: boolean;
  field_count: number;
  created_at: string;
}

export interface TemplateField {
  id: string;
  template_id: string;
  field_key: string;
  label: string;
  data_type: FieldDataType;
  required: boolean;
  formula?: string;
  aggregation_type: AggregationType;
  category_code?: string;
  placeholder_example: string;
  sort_order: number;
}

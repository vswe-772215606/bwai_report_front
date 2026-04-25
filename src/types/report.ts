export type ReportOutputFormat = "pdf" | "docx";

export type ReportStatus =
  | "pending"
  | "generating"
  | "generated"
  | "failed";

export interface GeneratedReport {
  id: string;
  name: string;
  template_id: string;
  template_name: string;
  upload_id: string;
  upload_filename: string;
  output_format: ReportOutputFormat;
  status: ReportStatus;
  error_message?: string;
  file_size?: number;
  generated_at?: string;
  created_at: string;
}

export interface GenerateReportRequest {
  upload_id: string;
  table_id: string;
  template_id: string;
  output_format: ReportOutputFormat;
  report_name?: string;
}

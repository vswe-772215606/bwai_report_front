import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUploads } from "../api/uploads";
import { getUploadTables } from "../api/tables";
import { getTemplates } from "../api/templates";
import { getValidationByUpload } from "../api/validation";
import { generateReport } from "../api/reports";
import { extractErrorMessage } from "../api/client";
import { ReportGenerateForm } from "../components/reports/ReportGenerateForm";
import { ValidationSummary } from "../components/validation/ValidationSummary";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Loader2, Download, CheckCircle2, AlertCircle } from "lucide-react";
import type { ReportOutputFormat } from "../types/report";
import { downloadReport } from "../api/reports";
import { triggerBlobDownload, getReportFilename } from "../utils/fileDownload";
import { extractErrorMessage as em } from "../api/client";

export function GenerateReportPage() {
  const [uploadId, setUploadId] = useState("");
  const [tableId, setTableId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [opError, setOpError] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<{ id: string; name: string; status: string; format: string } | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: uploads = [] } = useQuery({ queryKey: ["uploads"], queryFn: getUploads });
  const { data: tables = [] } = useQuery({
    queryKey: ["tables", uploadId],
    queryFn: () => getUploadTables(uploadId),
    enabled: !!uploadId,
  });
  const { data: templates = [] } = useQuery({ queryKey: ["templates"], queryFn: getTemplates });
  const { data: validation, isLoading: validationLoading } = useQuery({
    queryKey: ["validation", uploadId],
    queryFn: () => getValidationByUpload(uploadId),
    enabled: !!uploadId,
    retry: false,
  });

  useEffect(() => {
    setTableId("");
    setGeneratedReport(null);
  }, [uploadId]);

  const genMut = useMutation({
    mutationFn: ({ format, name }: { format: ReportOutputFormat; name: string }) =>
      generateReport({
        upload_id: uploadId,
        table_id: tableId,
        template_id: templateId,
        output_format: format,
        report_name: name || undefined,
      }),
    onSuccess: (data) => {
      setGeneratedReport({ id: data.id, name: data.name, status: data.status, format: data.output_format });
      setOpError(null);
    },
    onError: (e) => setOpError(extractErrorMessage(e)),
  });

  const hasBlockingErrors = validation?.has_blocking_errors ?? false;
  const noConfirmedMappings = false; // Backend enforces this; we show an alert if API returns 400

  let blockReason: string | undefined;
  if (!uploadId || !tableId || !templateId) {
    blockReason = "Select upload, table, and template to continue.";
  } else if (hasBlockingErrors) {
    blockReason = "Validation errors must be resolved before generating a report.";
  }

  const canGenerate = !!uploadId && !!tableId && !!templateId && !hasBlockingErrors;

  const handleDownload = async () => {
    if (!generatedReport) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await downloadReport(generatedReport.id);
      triggerBlobDownload(blob, getReportFilename(generatedReport.name, generatedReport.format as "pdf" | "docx"));
    } catch (e) {
      setDownloadError(em(e));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Generate Report</h1>
        <p className="text-sm text-gray-500">
          Select your data source and template to generate a financial report.
        </p>
      </div>

      {opError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{opError}</AlertDescription>
        </Alert>
      )}

      <ReportGenerateForm
        uploads={uploads}
        templates={templates}
        tables={tables}
        selectedUploadId={uploadId}
        selectedTableId={tableId}
        selectedTemplateId={templateId}
        onUploadChange={setUploadId}
        onTableChange={setTableId}
        onTemplateChange={setTemplateId}
        onGenerate={(format, name) => genMut.mutate({ format, name })}
        isLoading={genMut.isPending}
        canGenerate={canGenerate}
        blockReason={blockReason}
      />

      {uploadId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Latest Validation Status</CardTitle>
          </CardHeader>
          <CardContent>
            {validationLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking validation...
              </div>
            ) : validation ? (
              <ValidationSummary result={validation} />
            ) : (
              <p className="text-sm text-gray-400">
                No validation results for this upload.{" "}
                <a href="/validation" className="text-blue-600 hover:underline text-sm">Run validation →</a>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              Report Status
              <Badge
                variant={
                  generatedReport.status === "generated"
                    ? "success"
                    : generatedReport.status === "failed"
                    ? "destructive"
                    : "warning"
                }
              >
                {generatedReport.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{generatedReport.name}</span> ·{" "}
              {generatedReport.format.toUpperCase()}
            </p>

            {generatedReport.status === "generated" && (
              <>
                {downloadError && (
                  <Alert variant="destructive">
                    <AlertDescription>{downloadError}</AlertDescription>
                  </Alert>
                )}
                <Button onClick={handleDownload} disabled={downloading} size="sm">
                  {downloading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Downloading...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" /> Download Report</>
                  )}
                </Button>
              </>
            )}

            {generatedReport.status === "failed" && (
              <p className="text-sm text-red-600">
                Generation failed. Check that mappings are confirmed and validation passes.
              </p>
            )}

            {(generatedReport.status === "pending" || generatedReport.status === "generating") && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Report is being generated...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

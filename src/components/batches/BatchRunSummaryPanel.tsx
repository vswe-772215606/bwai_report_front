import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { KeyValueList } from "../workflow/KeyValueList";
import { JsonDebugPanel } from "../workflow/JsonDebugPanel";
import type { DocumentBatchRun } from "../../types/documentBatch";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function BatchRunSummaryPanel({ batch }: { batch: DocumentBatchRun }) {
  const summary = batch.summary;
  const skippedRecords = Array.isArray(summary.skipped_records)
    ? summary.skipped_records
    : [];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-slate-500">
              Records
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-950">
            {summary.record_count ?? "n/a"}
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-slate-500">
              Generated
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-700">
            {summary.generated_count ?? "n/a"}
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-slate-500">
              Skipped
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-700">
            {summary.skipped_count ?? "n/a"}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Batch summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.selected_sheet_names && summary.selected_sheet_names.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {summary.selected_sheet_names.map((sheetName) => (
                <Badge key={sheetName} variant="info">
                  {sheetName}
                </Badge>
              ))}
            </div>
          )}

          {summary.document_name_field && (
            <div className="text-sm text-slate-700">
              Document name field:{" "}
              <span className="font-medium">{summary.document_name_field}</span>
            </div>
          )}

          {Array.isArray(summary.generated_files) && summary.generated_files.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-medium text-slate-900">Generated files</div>
              <div className="space-y-2">
                {summary.generated_files.map((file, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    {asRecord(file) ? (
                      <KeyValueList value={asRecord(file)!} />
                    ) : (
                      <div className="text-sm text-slate-700">{String(file)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Skipped records</CardTitle>
        </CardHeader>
        <CardContent>
          {skippedRecords.length === 0 ? (
            <Alert variant="success">
              <AlertDescription>No records were skipped in this batch.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {skippedRecords.map((record, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
                >
                  <AlertTitle className="mb-2">Skipped record {index + 1}</AlertTitle>
                  {asRecord(record) ? (
                    <KeyValueList value={asRecord(record)!} />
                  ) : (
                    <AlertDescription>{String(record)}</AlertDescription>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <JsonDebugPanel title="Batch summary JSON" value={batch.summary_json} />
    </div>
  );
}

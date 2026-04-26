import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { KeyValueList } from "../workflow/KeyValueList";
import { JsonDebugPanel } from "../workflow/JsonDebugPanel";
import type { DocumentAiJob } from "../../types/documentAiJob";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function DocumentAiJobSummaryPanel({ job }: { job: DocumentAiJob }) {
  const summary = job.summary;
  const generatedFiles = Array.isArray(summary.generated_files) ? summary.generated_files : [];
  const rejectedReplacements = Array.isArray(summary.rejected_replacements)
    ? summary.rejected_replacements
    : [];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-slate-500">
              Normalization AI
            </CardTitle>
          </CardHeader>
          <CardContent className="text-base font-semibold text-slate-950">
            {summary.ai_used_for_normalization == null
              ? "Not reported"
              : summary.ai_used_for_normalization
              ? "Used"
              : "Not used"}
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-slate-500">
              Replacement Planning AI
            </CardTitle>
          </CardHeader>
          <CardContent className="text-base font-semibold text-slate-950">
            {summary.ai_used_for_replacement_planning == null
              ? "Not reported"
              : summary.ai_used_for_replacement_planning
              ? "Used"
              : "Not used"}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Generated files</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedFiles.length === 0 ? (
            <p className="text-sm text-slate-500">No generated files were reported yet.</p>
          ) : (
            <div className="space-y-3">
              {generatedFiles.map((file, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {asRecord(file) ? (
                    <KeyValueList value={asRecord(file)!} />
                  ) : (
                    <div className="text-sm text-slate-700">{String(file)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Rejected replacements</CardTitle>
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

          {rejectedReplacements.length === 0 ? (
            <Alert variant="success">
              <AlertDescription>No rejected replacements were reported.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {rejectedReplacements.map((item, index) => (
                <div key={index} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <AlertTitle className="mb-2">Rejected replacement {index + 1}</AlertTitle>
                  {asRecord(item) ? (
                    <KeyValueList value={asRecord(item)!} />
                  ) : (
                    <AlertDescription>{String(item)}</AlertDescription>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <JsonDebugPanel title="Document AI summary JSON" value={job.summary_json} />
    </div>
  );
}

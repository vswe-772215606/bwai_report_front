import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import { getUploads } from "../api/uploads";
import {
  getLatestWorkbookIndexForUpload,
  getWorkbookIndexRun,
  getWorkbookIndexSheets,
  runWorkbookIndex,
} from "../api/workbookIndex";
import { extractErrorMessage } from "../api/client";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { JsonDebugPanel } from "../components/workflow/JsonDebugPanel";
import { KeyValueList } from "../components/workflow/KeyValueList";
import { StatusBadge } from "../components/workflow/StatusBadge";
import { useWorkspaceStore } from "../store/workspaceStore";
import { formatDateTime } from "../utils/formatDate";
import type { WorkbookIndexSheet } from "../types/workbookIndex";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function SheetSection({
  title,
  items,
}: {
  title: string;
  items: unknown[];
}) {
  if (items.length === 0) {
    return (
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
        <p className="mt-2 text-sm text-slate-500">Not available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-3 space-y-3">
        {items.map((item, index) => {
          const record = asRecord(item);

          return (
            <div key={index} className="rounded-xl border bg-slate-50 p-3">
              {record ? (
                <KeyValueList value={record} />
              ) : (
                <div className="text-sm text-slate-700">{JSON.stringify(item)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkbookIndexSheetCard({ sheet }: { sheet: WorkbookIndexSheet }) {
  const summary = asRecord(sheet.summary_json);

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base text-slate-950">
          <span>{sheet.sheet_name}</span>
          <div className="flex flex-wrap gap-2">
            <Badge variant="muted">{sheet.row_count ?? "?"} rows</Badge>
            <Badge variant="muted">{sheet.column_count ?? "?"} cols</Badge>
            <Badge variant="info">{sheet.detected_language ?? "language n/a"}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Summary
          </div>
          <div className="mt-3">
            {summary ? (
              <KeyValueList value={summary} />
            ) : (
              <p className="text-sm text-slate-500">Not available yet.</p>
            )}
          </div>
        </div>

        <SheetSection title="Table summaries" items={asArray(sheet.table_summaries)} />
        <SheetSection title="Row label candidates" items={asArray(sheet.row_label_candidates)} />
        <SheetSection title="Column profiles" items={asArray(sheet.column_profiles)} />

        <JsonDebugPanel
          title={`Debug panel: ${sheet.sheet_name}`}
          value={{
            summary_json: sheet.summary_json,
            table_summaries: sheet.table_summaries,
            row_label_candidates: sheet.row_label_candidates,
            column_profiles: sheet.column_profiles,
            raw_json: sheet.raw_json,
          }}
        />
      </CardContent>
    </Card>
  );
}

export function WorkbookIndexPage() {
  const queryClient = useQueryClient();
  const currentUpload = useWorkspaceStore((state) => state.currentUpload);
  const currentIndexRun = useWorkspaceStore((state) => state.currentIndexRun);
  const setCurrentUpload = useWorkspaceStore((state) => state.setCurrentUpload);
  const setCurrentIndexRun = useWorkspaceStore((state) => state.setCurrentIndexRun);

  const uploadId = currentUpload?.id ?? "";

  const { data: uploads = [] } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  const { data: latestRun, isLoading: loadingLatestRun, error: latestRunError } = useQuery({
    queryKey: ["workbook-index", "latest", uploadId],
    queryFn: () => getLatestWorkbookIndexForUpload(uploadId),
    enabled: Boolean(uploadId),
    retry: false,
  });

  const activeRunId = currentIndexRun?.id ?? latestRun?.id ?? null;

  const { data: activeRun } = useQuery({
    queryKey: ["workbook-index", "run", activeRunId],
    queryFn: () => getWorkbookIndexRun(activeRunId!),
    enabled: Boolean(activeRunId) && activeRunId !== latestRun?.id,
  });

  const resolvedRun = activeRun ?? latestRun ?? null;

  const { data: sheets = [], isLoading: loadingSheets } = useQuery({
    queryKey: ["workbook-index", "sheets", resolvedRun?.id],
    queryFn: () => getWorkbookIndexSheets(resolvedRun!.id),
    enabled: Boolean(resolvedRun?.id),
  });

  const runMutation = useMutation({
    mutationFn: runWorkbookIndex,
    onSuccess: (run) => {
      queryClient.invalidateQueries({ queryKey: ["workbook-index"] });
      setCurrentIndexRun({
        id: run.id,
        label: `Run ${run.id}`,
      });
    },
  });

  useEffect(() => {
    if (!currentIndexRun && latestRun) {
      setCurrentIndexRun({
        id: latestRun.id,
        label: `Run ${latestRun.id}`,
      });
    }
  }, [currentIndexRun, latestRun, setCurrentIndexRun]);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="text-xl text-slate-950">Workbook Index</CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Build a backend summary layer for the selected workbook. This index is for review and extraction support, not a spreadsheet editor.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-800">Current workbook</div>
            <Select
              value={currentUpload?.id ?? ""}
              onValueChange={(value) => {
                const upload = uploads.find((item) => item.id === value);
                if (upload) {
                  setCurrentUpload({
                    id: upload.id,
                    label: upload.original_filename,
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a workbook upload" />
              </SelectTrigger>
              <SelectContent>
                {uploads.map((upload) => (
                  <SelectItem key={upload.id} value={upload.id}>
                    {upload.original_filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => currentUpload && runMutation.mutate({ upload_id: currentUpload.id })}
            disabled={!currentUpload || runMutation.isPending}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            {runMutation.isPending ? "Building index..." : "Run workbook index"}
          </Button>
        </CardContent>
      </Card>

      {!currentUpload && (
        <Alert variant="warning">
          <AlertTitle>Select a workbook first</AlertTitle>
          <AlertDescription>
            Choose the current workbook in Uploads before building or reviewing an index run.
          </AlertDescription>
        </Alert>
      )}

      {runMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>{extractErrorMessage(runMutation.error)}</AlertDescription>
        </Alert>
      )}

      {latestRunError && (
        <Alert variant="destructive">
          <AlertDescription>{extractErrorMessage(latestRunError)}</AlertDescription>
        </Alert>
      )}

      {currentUpload && (
        <Card className="border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3 text-base text-slate-950">
              <span>Latest index run summary</span>
              {loadingLatestRun ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <StatusBadge value={resolvedRun?.status ?? "not available"} />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!resolvedRun ? (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No workbook index run is available yet for the selected upload.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Run ID</div>
                    <div className="mt-1 text-sm text-slate-900">{resolvedRun.id}</div>
                  </div>
                  <div className="rounded-xl border bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Created</div>
                    <div className="mt-1 text-sm text-slate-900">{formatDateTime(resolvedRun.created_at)}</div>
                  </div>
                  <div className="rounded-xl border bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Completed</div>
                    <div className="mt-1 text-sm text-slate-900">{formatDateTime(resolvedRun.completed_at)}</div>
                  </div>
                  <div className="rounded-xl border bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Error</div>
                    <div className="mt-1 text-sm text-slate-900">{resolvedRun.error_message ?? "None"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Run summary
                  </div>
                  <div className="mt-3">
                    {asRecord(resolvedRun.summary_json) ? (
                      <KeyValueList value={asRecord(resolvedRun.summary_json)!} />
                    ) : (
                      <p className="text-sm text-slate-500">Not available yet.</p>
                    )}
                  </div>
                </div>

                <JsonDebugPanel title="Index run debug" value={resolvedRun.summary_json} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {resolvedRun && (
        <Card className="border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">Indexed sheets</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSheets ? (
              <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading indexed sheets...
              </div>
            ) : sheets.length === 0 ? (
              <p className="py-8 text-sm text-slate-500">No indexed sheet details are available yet.</p>
            ) : (
              <div className="space-y-5">
                {sheets.map((sheet) => (
                  <WorkbookIndexSheetCard key={sheet.id} sheet={sheet} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

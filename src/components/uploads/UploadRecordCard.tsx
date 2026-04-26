import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { suggestHeaderRow } from "../../api/ai";
import {
  getUploadSheets,
  getUploadTablePreview,
  getUploadTables,
} from "../../api/uploads";
import { extractErrorMessage, normalizeApiError } from "../../api/client";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { StatusBadge } from "../workflow/StatusBadge";
import { DataPreviewTable } from "../tables/DataPreviewTable";
import { formatDateTime } from "../../utils/formatDate";
import type { Upload } from "../../types/upload";

type Props = {
  upload: Upload;
  isCurrent: boolean;
  onSetCurrent: () => void;
};

function summaryVariant(status: Upload["status"]) {
  if (status === "failed") {
    return "destructive" as const;
  }

  if (status === "parsed") {
    return "success" as const;
  }

  return "info" as const;
}

export function UploadRecordCard({ upload, isCurrent, onSetCurrent }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [previewTableId, setPreviewTableId] = useState<string | null>(null);
  const [headerHint, setHeaderHint] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: sheets = [], isLoading: loadingSheets } = useQuery({
    queryKey: ["upload-sheets", upload.id],
    queryFn: () => getUploadSheets(upload.id),
    enabled: expanded,
  });

  const { data: tables = [], isLoading: loadingTables } = useQuery({
    queryKey: ["upload-tables", upload.id],
    queryFn: () => getUploadTables(upload.id),
    enabled: expanded,
  });

  const { data: preview, isLoading: loadingPreview } = useQuery({
    queryKey: ["upload-table-preview", upload.id, previewTableId],
    queryFn: () => getUploadTablePreview(upload.id, previewTableId!),
    enabled: expanded && Boolean(previewTableId),
  });

  const aiMutation = useMutation({
    mutationFn: (tableId: string) =>
      suggestHeaderRow({
        upload_id: upload.id,
        table_id: tableId,
      }),
    onSuccess: (result) => {
      setHeaderHint(
        `Suggested header row: ${result.suggested_header_row}. Confidence ${Math.round(
          result.confidence * 100
        )}%. Review required.`
      );
      setLocalError(null);
    },
    onError: (error) => {
      const normalized = normalizeApiError(error);
      if (normalized.status === 503) {
        setLocalError(
          "AI helper is unavailable right now. The backend reported a temporary 503."
        );
      } else {
        setLocalError(extractErrorMessage(error));
      }
    },
  });

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === previewTableId) ?? null,
    [previewTableId, tables]
  );

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base text-slate-950">
                {upload.original_filename}
              </CardTitle>
              <Badge variant={summaryVariant(upload.status)}>{upload.status}</Badge>
              {upload.is_duplicate && <Badge variant="warning">Duplicate</Badge>}
              {isCurrent && <Badge variant="success">Current upload</Badge>}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Uploaded {formatDateTime(upload.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={isCurrent ? "default" : "outline"}
              className={isCurrent ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : ""}
              onClick={onSetCurrent}
            >
              {isCurrent ? "Selected" : "Set current"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expanded ? "Hide details" : "Show details"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5">
          {localError && (
            <Alert variant="destructive">
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}

          {headerHint && (
            <Alert variant="info">
              <Sparkles className="h-4 w-4" />
              <AlertTitle>AI header suggestion</AlertTitle>
              <AlertDescription>{headerHint}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-5 xl:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Detected sheets</div>
                  {loadingSheets && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                </div>
                {sheets.length === 0 ? (
                  <p className="text-sm text-slate-500">No sheet metadata available yet.</p>
                ) : (
                  <div className="space-y-2">
                    {sheets.map((sheet) => (
                      <div
                        key={sheet.id}
                        className="flex items-center justify-between rounded-xl bg-white px-3 py-2"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {sheet.sheet_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {sheet.row_count} rows, {sheet.column_count} columns
                          </div>
                        </div>
                        <Badge variant="muted">
                          {sheet.detected_language ?? "Language n/a"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Detected tables</div>
                  {loadingTables && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                </div>
                {tables.length === 0 ? (
                  <p className="text-sm text-slate-500">No table candidates available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {tables.map((table) => (
                      <div
                        key={table.id}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {table.sheet_name} table {table.table_index}
                            </div>
                            <div className="text-xs text-slate-500">
                              Rows {table.start_row}-{table.end_row}, {table.row_count} rows,
                              {" "} {table.column_count} columns
                            </div>
                          </div>
                          <StatusBadge value={table.status} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewTableId(table.id)}
                          >
                            Preview rows
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={aiMutation.isPending}
                            onClick={() => aiMutation.mutate(table.id)}
                          >
                            {aiMutation.isPending ? "Checking..." : "Suggest header row"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}

      <Dialog open={Boolean(previewTableId)} onOpenChange={(open) => !open && setPreviewTableId(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTable
                ? `${selectedTable.sheet_name} table ${selectedTable.table_index}`
                : "Table preview"}
            </DialogTitle>
            <DialogDescription>
              Review sample rows before selecting sheet filters or trusting downstream replacements.
            </DialogDescription>
          </DialogHeader>

          {selectedTable && (
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={selectedTable.status} />
              <Badge variant="muted">{selectedTable.row_count} rows</Badge>
              <Badge variant="muted">{selectedTable.column_count} columns</Badge>
              {selectedTable.confidence_score != null && (
                <Badge variant="info">
                  Confidence {Math.round(selectedTable.confidence_score * 100)}%
                </Badge>
              )}
            </div>
          )}

          {loadingPreview ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preview rows...
            </div>
          ) : preview ? (
            <DataPreviewTable preview={preview} />
          ) : (
            <p className="text-sm text-slate-500">Preview data is not available.</p>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

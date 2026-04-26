import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { downloadDocumentBatch, getDocumentBatches, runDocumentBatch } from "../api/documentBatches";
import { getBlueprints } from "../api/blueprints";
import { getUploads } from "../api/uploads";
import { extractErrorMessage } from "../api/client";
import { BatchRunSummaryPanel } from "../components/batches/BatchRunSummaryPanel";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { StatusBadge } from "../components/workflow/StatusBadge";
import { triggerBlobDownload } from "../utils/fileDownload";
import { formatDateTime } from "../utils/formatDate";
import type { DocumentBatchRun } from "../types/documentBatch";

export function ControlledBatchesPage() {
  const queryClient = useQueryClient();
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [selectedUploadIds, setSelectedUploadIds] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<"docx" | "pdf">("docx");
  const [sheetNames, setSheetNames] = useState("");
  const [documentNameField, setDocumentNameField] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [latestBatch, setLatestBatch] = useState<DocumentBatchRun | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: blueprints = [] } = useQuery({
    queryKey: ["blueprints"],
    queryFn: getBlueprints,
  });

  const { data: uploads = [] } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ["document-batches"],
    queryFn: getDocumentBatches,
  });

  const runMutation = useMutation({
    mutationFn: runDocumentBatch,
    onSuccess: (batch) => {
      setLatestBatch(batch);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["document-batches"] });
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const handleToggleUpload = (id: string) => {
    setSelectedUploadIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const handleSubmit = () => {
    if (!selectedBlueprintId || selectedUploadIds.length === 0) return;
    const parsedSheets = sheetNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    runMutation.mutate({
      blueprint_id: selectedBlueprintId,
      upload_ids: selectedUploadIds,
      output_format: outputFormat,
      sheet_names: parsedSheets.length > 0 ? parsedSheets : null,
      document_name_field: documentNameField.trim() || null,
    });
  };

  const handleDownload = async (batchId: string) => {
    setDownloadingId(batchId);
    try {
      const { blob, filename } = await downloadDocumentBatch(batchId);
      triggerBlobDownload(blob, filename ?? `document-batch-${batchId}.zip`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const sortedBatches = [...batches].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Controlled Batches
          </div>
          <CardTitle className="mt-2 text-2xl text-slate-950">
            Blueprint-driven batch generation
          </CardTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Select a blueprint and one or more Excel uploads. The backend generates one document
            per data row using the blueprint field definitions as the replacement map. Output is
            a ZIP archive.
          </p>
        </CardHeader>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Run a new batch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Blueprint</Label>
                <Select value={selectedBlueprintId} onValueChange={setSelectedBlueprintId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a blueprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    {blueprints.map((bp) => (
                      <SelectItem key={bp.id} value={bp.id}>
                        {bp.title}
                        {bp.document_domain ? ` (${bp.document_domain})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {blueprints.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No blueprints available. Create one under Blueprints first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Output format</Label>
                <Select
                  value={outputFormat}
                  onValueChange={(v) => setOutputFormat(v as "docx" | "pdf")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch-sheet-names">Sheet names filter (optional)</Label>
                <Input
                  id="batch-sheet-names"
                  value={sheetNames}
                  onChange={(e) => setSheetNames(e.target.value)}
                  placeholder="Sheet1, Sheet2"
                />
                <p className="text-xs text-slate-500">
                  Comma-separated. Leave blank to use all sheets.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-name-field">Document name field (optional)</Label>
                <Input
                  id="doc-name-field"
                  value={documentNameField}
                  onChange={(e) => setDocumentNameField(e.target.value)}
                  placeholder="e.g. company_name"
                />
                <p className="text-xs text-slate-500">
                  Field key whose value will be used as the output filename per document.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excel uploads to use</Label>
              <p className="text-xs text-slate-500">
                Only uploads with status <span className="font-medium text-slate-700">parsed</span> have
                confirmed tables the backend can read rows from.
              </p>
              {uploads.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No uploads available. Go to Uploads to add Excel data first.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50">
                  {uploads.map((upload) => (
                    <label
                      key={upload.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-slate-200 px-4 py-3 last:border-0 hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUploadIds.includes(upload.id)}
                        onChange={() => handleToggleUpload(upload.id)}
                        className="h-4 w-4 rounded"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {upload.original_filename}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDateTime(upload.created_at)}
                        </div>
                      </div>
                      <StatusBadge value={upload.status} />
                    </label>
                  ))}
                </div>
              )}
              {selectedUploadIds.length > 0 && (
                <p className="text-xs text-slate-500">
                  {selectedUploadIds.length} upload{selectedUploadIds.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={
              !selectedBlueprintId || selectedUploadIds.length === 0 || runMutation.isPending
            }
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            {runMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running batch...
              </>
            ) : (
              "Run controlled batch"
            )}
          </Button>
        </CardContent>
      </Card>

      {latestBatch && (
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base text-slate-950">Latest batch result</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge value={latestBatch.status} />
                <Badge variant="muted">{String(latestBatch.output_format).toUpperCase()}</Badge>
                {latestBatch.created_at && (
                  <span className="text-xs text-slate-500">
                    {formatDateTime(latestBatch.created_at)}
                  </span>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleDownload(latestBatch.id)}
              disabled={downloadingId === latestBatch.id}
            >
              {downloadingId === latestBatch.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download ZIP
            </Button>
          </CardHeader>
          <CardContent>
            <BatchRunSummaryPanel batch={latestBatch} />
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Previous controlled batches</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBatches ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading batches...
            </div>
          ) : sortedBatches.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">No batches have run yet.</p>
          ) : (
            <div className="space-y-4">
              {sortedBatches.map((batch) => (
                <div key={batch.id} className="rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          Batch {batch.id}
                        </span>
                        <StatusBadge value={batch.status} />
                        <Badge variant="muted">
                          {String(batch.output_format).toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>{formatDateTime(batch.created_at)}</span>
                        <span>
                          Generated: {batch.summary.generated_count ?? "n/a"} &middot; Skipped:{" "}
                          {batch.summary.skipped_count ?? "n/a"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setExpandedBatchId(expandedBatchId === batch.id ? null : batch.id)
                        }
                      >
                        {expandedBatchId === batch.id ? "Hide details" : "Show details"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloadingId === batch.id}
                        onClick={() => handleDownload(batch.id)}
                      >
                        {downloadingId === batch.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download
                      </Button>
                    </div>
                  </div>
                  {expandedBatchId === batch.id && (
                    <div className="border-t border-slate-200 px-4 py-4">
                      <BatchRunSummaryPanel batch={batch} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

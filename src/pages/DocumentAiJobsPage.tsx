import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { downloadDocumentAiJob, getDocumentAiJobs, runDocumentAiJob } from "../api/documentAiJobs";
import { getUploads } from "../api/uploads";
import { extractErrorMessage } from "../api/client";
import { DocumentAiJobSummaryPanel } from "../components/jobs/DocumentAiJobSummaryPanel";
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
import type { DocumentAiJob } from "../types/documentAiJob";

export function DocumentAiJobsPage() {
  const queryClient = useQueryClient();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [selectedUploadIds, setSelectedUploadIds] = useState<string[]>([]);
  const [domain, setDomain] = useState("finance");
  const [outputFormat, setOutputFormat] = useState<"docx" | "pdf">("docx");
  const [sheetNames, setSheetNames] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [latestJob, setLatestJob] = useState<DocumentAiJob | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: uploads = [] } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ["document-ai-jobs"],
    queryFn: getDocumentAiJobs,
  });

  const runMutation = useMutation({
    mutationFn: runDocumentAiJob,
    onSuccess: (job) => {
      setLatestJob(job);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["document-ai-jobs"] });
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const handleToggleUpload = (id: string) => {
    setSelectedUploadIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const handleSubmit = () => {
    if (!sourceFile || selectedUploadIds.length === 0) return;
    const parsedSheets = sheetNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    runMutation.mutate({
      source_file: sourceFile,
      upload_ids: selectedUploadIds,
      domain,
      output_format: outputFormat,
      sheet_names: parsedSheets.length > 0 ? parsedSheets : null,
    });
  };

  const handleDownload = async (jobId: string) => {
    setDownloadingId(jobId);
    try {
      const { blob, filename } = await downloadDocumentAiJob(jobId);
      triggerBlobDownload(blob, filename ?? `document-ai-job-${jobId}.zip`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Document AI Jobs
          </div>
          <CardTitle className="mt-2 text-2xl text-slate-950">
            Autonomous constrained document editing
          </CardTitle>
          <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Source:</span> a real DOCX you upload now — not a template
            </div>
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Replacements:</span> validated only — low-confidence edits are rejected
            </div>
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Traceability:</span> all rejected replacements are reported back
            </div>
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Not a rewrite:</span> structure is preserved, not regenerated from scratch
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Run a new job</CardTitle>
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
                <Label>Source DOCX</Label>
                <input
                  type="file"
                  accept=".docx"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
                  onChange={(e) => setSourceFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-slate-500">
                  The real source document that will receive constrained replacements.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheet-names">Sheet names filter (optional)</Label>
                <Input
                  id="sheet-names"
                  value={sheetNames}
                  onChange={(e) => setSheetNames(e.target.value)}
                  placeholder="Sheet1, Sheet2"
                />
                <p className="text-xs text-slate-500">
                  Comma-separated. Leave blank to use all sheets.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excel uploads to use</Label>
              {uploads.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No uploads available. Go to Uploads to add Excel data first.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50">
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
            disabled={!sourceFile || selectedUploadIds.length === 0 || runMutation.isPending}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            {runMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running job...
              </>
            ) : (
              "Run document AI job"
            )}
          </Button>
        </CardContent>
      </Card>

      {latestJob && (
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base text-slate-950">Latest job result</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge value={latestJob.status} />
                {latestJob.source_filename && (
                  <Badge variant="muted">{latestJob.source_filename}</Badge>
                )}
                {latestJob.domain && (
                  <Badge variant={latestJob.domain === "finance" ? "success" : "info"}>
                    {latestJob.domain}
                  </Badge>
                )}
                <Badge variant="muted">{String(latestJob.output_format).toUpperCase()}</Badge>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleDownload(latestJob.id)}
              disabled={downloadingId === latestJob.id}
            >
              {downloadingId === latestJob.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download ZIP
            </Button>
          </CardHeader>
          <CardContent>
            <DocumentAiJobSummaryPanel job={latestJob} />
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Previous Document AI jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingJobs ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading jobs...
            </div>
          ) : sortedJobs.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">No jobs have run yet.</p>
          ) : (
            <div className="space-y-4">
              {sortedJobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {job.source_filename ?? `Job ${job.id}`}
                        </span>
                        <StatusBadge value={job.status} />
                        {job.domain && (
                          <Badge variant={job.domain === "finance" ? "success" : "info"}>
                            {job.domain}
                          </Badge>
                        )}
                        <Badge variant="muted">{String(job.output_format).toUpperCase()}</Badge>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>{formatDateTime(job.created_at)}</span>
                        <span>
                          Generated: {job.summary.generated_count ?? "n/a"} &middot; Skipped:{" "}
                          {job.summary.skipped_count ?? "n/a"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      >
                        {expandedJobId === job.id ? "Hide details" : "Show details"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloadingId === job.id}
                        onClick={() => handleDownload(job.id)}
                      >
                        {downloadingId === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download
                      </Button>
                    </div>
                  </div>
                  {expandedJobId === job.id && (
                    <div className="border-t border-slate-200 px-4 py-4">
                      <DocumentAiJobSummaryPanel job={job} />
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

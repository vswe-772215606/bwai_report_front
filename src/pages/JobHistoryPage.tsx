import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { downloadDocumentAiJob, getDocumentAiJobs } from "../api/documentAiJobs";
import { downloadDocumentBatch, getDocumentBatches } from "../api/documentBatches";
import { extractErrorMessage } from "../api/client";
import { DocumentAiJobSummaryPanel } from "../components/jobs/DocumentAiJobSummaryPanel";
import { BatchRunSummaryPanel } from "../components/batches/BatchRunSummaryPanel";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatusBadge } from "../components/workflow/StatusBadge";
import { triggerBlobDownload } from "../utils/fileDownload";
import { formatDateTime } from "../utils/formatDate";

type ActiveTab = "jobs" | "batches";

export function JobHistoryPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("jobs");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ["document-ai-jobs"],
    queryFn: getDocumentAiJobs,
  });

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ["document-batches"],
    queryFn: getDocumentBatches,
  });

  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );

  const sortedBatches = [...batches].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );

  const handleDownloadJob = async (jobId: string) => {
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

  const handleDownloadBatch = async (batchId: string) => {
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

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Job History
          </div>
          <CardTitle className="mt-2 text-2xl text-slate-950">Operations history</CardTitle>
          <p className="mt-2 text-sm text-slate-500">
            All Document AI jobs and Controlled Batch runs, most recent first.
          </p>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex w-fit gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1">
        <button
          onClick={() => {
            setActiveTab("jobs");
            setExpandedId(null);
          }}
          className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
            activeTab === "jobs"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Document AI Jobs
          <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs">
            {jobs.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("batches");
            setExpandedId(null);
          }}
          className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
            activeTab === "batches"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Controlled Batches
          <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs">
            {batches.length}
          </span>
        </button>
      </div>

      {activeTab === "jobs" && (
        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            {loadingJobs ? (
              <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading jobs...
              </div>
            ) : sortedJobs.length === 0 ? (
              <p className="py-8 text-sm text-slate-500">No Document AI jobs have run yet.</p>
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
                          <Badge variant="muted">
                            {String(job.output_format).toUpperCase()}
                          </Badge>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-slate-500">
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
                          onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                        >
                          {expandedId === job.id ? "Hide" : "Details"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={downloadingId === job.id}
                          onClick={() => handleDownloadJob(job.id)}
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
                    {expandedId === job.id && (
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
      )}

      {activeTab === "batches" && (
        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            {loadingBatches ? (
              <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading batches...
              </div>
            ) : sortedBatches.length === 0 ? (
              <p className="py-8 text-sm text-slate-500">No Controlled Batches have run yet.</p>
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
                        <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-slate-500">
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
                            setExpandedId(expandedId === batch.id ? null : batch.id)
                          }
                        >
                          {expandedId === batch.id ? "Hide" : "Details"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={downloadingId === batch.id}
                          onClick={() => handleDownloadBatch(batch.id)}
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
                    {expandedId === batch.id && (
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
      )}
    </div>
  );
}

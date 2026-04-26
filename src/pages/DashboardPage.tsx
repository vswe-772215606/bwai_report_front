import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Download, FileSpreadsheet, Info, Loader2 } from "lucide-react";
import { getBlueprints } from "../api/blueprints";
import { downloadDocumentAiJob, getDocumentAiJobs } from "../api/documentAiJobs";
import { downloadDocumentBatch, getDocumentBatches } from "../api/documentBatches";
import { getUploads } from "../api/uploads";
import { extractErrorMessage } from "../api/client";
import { mapErrorToUzbek } from "../utils/errorMessages";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatusBadge } from "../components/workflow/StatusBadge";
import { triggerBlobDownload } from "../utils/fileDownload";
import { formatDateTime } from "../utils/formatDate";

type ActivityRow = {
  id: string;
  type: "batch" | "job";
  typeLabel: string;
  status: string;
  generated_count: number | null;
  created_at: string | null;
  error_message: string | null;
};

function ErrorTooltip({ message }: { message: string }) {
  return (
    <div className="group relative inline-flex items-center">
      <Info className="h-3.5 w-3.5 cursor-help text-red-500" />
      <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden w-72 -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-lg group-hover:block">
        {message}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: uploads = [] } = useQuery({ queryKey: ["uploads"], queryFn: getUploads });
  const { data: blueprints = [] } = useQuery({ queryKey: ["blueprints"], queryFn: getBlueprints });
  const { data: batches = [] } = useQuery({ queryKey: ["document-batches"], queryFn: getDocumentBatches });
  const { data: jobs = [] } = useQuery({ queryKey: ["document-ai-jobs"], queryFn: getDocumentAiJobs });

  const totalGenerated = useMemo(() => {
    const fromJobs = jobs.reduce((s, j) => s + (j.summary.generated_count ?? 0), 0);
    const fromBatches = batches.reduce((s, b) => s + (b.summary.generated_count ?? 0), 0);
    return fromJobs + fromBatches;
  }, [jobs, batches]);

  const hoursSaved = Math.round(totalGenerated * 0.5);

  const activity = useMemo<ActivityRow[]>(() => {
    const rows: ActivityRow[] = [
      ...batches.map((b) => ({
        id: b.id,
        type: "batch" as const,
        typeLabel: "Ommaviy yaratish",
        status: b.status,
        generated_count: b.summary.generated_count,
        created_at: b.created_at,
        error_message: b.error_message,
      })),
      ...jobs.map((j) => ({
        id: j.id,
        type: "job" as const,
        typeLabel: "Avtomatik to'ldirish",
        status: j.status,
        generated_count: j.summary.generated_count,
        created_at: j.created_at,
        error_message: j.error_message,
      })),
    ];
    return rows
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 15);
  }, [jobs, batches]);

  const handleDownload = async (row: ActivityRow) => {
    setDownloadingId(row.id);
    setDownloadError(null);
    try {
      if (row.type === "batch") {
        const { blob, filename } = await downloadDocumentBatch(row.id);
        triggerBlobDownload(blob, filename ?? `hujjatlar-${row.id}.zip`);
      } else {
        const { blob, filename } = await downloadDocumentAiJob(row.id);
        triggerBlobDownload(blob, filename ?? `hujjatlar-${row.id}.zip`);
      }
    } catch (err) {
      setDownloadError(mapErrorToUzbek(extractErrorMessage(err)));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Yaratilgan hujjatlar
            </div>
            <div className="mt-2 text-4xl font-bold text-emerald-700">{totalGenerated}</div>
            <div className="mt-1 text-sm text-slate-500">ta hujjat</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Yuklangan ma'lumot fayllari
            </div>
            <div className="mt-2 text-4xl font-bold text-sky-700">{uploads.length}</div>
            <div className="mt-1 text-sm text-slate-500">ta fayl</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tejilgan vaqt
            </div>
            <div className="mt-2 text-4xl font-bold text-amber-700">{hoursSaved}</div>
            <div className="mt-1 text-sm text-slate-500">soat tejaldi</div>
          </CardContent>
        </Card>
      </div>

      {/* Action cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
            </div>
            <CardTitle className="mt-3 text-lg text-slate-950">
              Ma'lumotdan hujjat yaratish
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              Excel fayl va Word shablonini yuklang. Har bir qator uchun alohida hujjat oling.
            </p>
            <Button asChild className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              <Link to="/controlled-batches">
                Boshlash
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
              <FileSpreadsheet className="h-5 w-5 text-sky-700" />
            </div>
            <CardTitle className="mt-3 text-lg text-slate-950">
              Hujjatni avtomatik to'ldirish
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              Excel fayl va tayyor Word hujjatini yuklang. Sun'iy intellekt ma'lumotlarni
              o'zi to'ldiradi.
            </p>
            <Button asChild className="bg-sky-500 hover:bg-sky-400">
              <Link to="/document-ai-jobs">
                Boshlash
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity table */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">So'nggi amallar</CardTitle>
        </CardHeader>
        <CardContent>
          {downloadError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {downloadError}
            </div>
          )}

          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Hali hech qanday amal bajarilmagan
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tur
                    </th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Holat
                    </th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Hujjatlar
                    </th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sana
                    </th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Yuklab olish
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((row) => {
                    const isFailed =
                      row.status.toLowerCase().includes("fail") ||
                      row.status.toLowerCase().includes("error");

                    return (
                      <tr key={`${row.type}-${row.id}`} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4">
                          <Badge variant={row.type === "batch" ? "success" : "info"}>
                            {row.typeLabel}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge value={row.status} />
                            {isFailed && row.error_message && (
                              <ErrorTooltip
                                message={mapErrorToUzbek(row.error_message)}
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-900">
                          {row.generated_count != null
                            ? `${row.generated_count} ta hujjat`
                            : "—"}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {formatDateTime(row.created_at)}
                        </td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={downloadingId === row.id}
                            onClick={() => handleDownload(row)}
                            title="ZIP arxivini yuklab olish"
                          >
                            {downloadingId === row.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

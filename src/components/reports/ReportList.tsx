import { Download, BookOpen } from "lucide-react";
import type { GeneratedReport } from "../../types/report";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatDateTime } from "../../utils/formatDate";

type StatusVariant = "success" | "destructive" | "warning" | "muted" | "info";

const statusVariant: Record<string, StatusVariant> = {
  generated: "success",
  failed: "destructive",
  generating: "warning",
  pending: "muted",
};

interface Props {
  reports: GeneratedReport[];
  onDownload: (report: GeneratedReport) => void;
  downloadingId?: string | null;
}

export function ReportList({ reports, onDownload, downloadingId }: Props) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No reports generated yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y border rounded-lg bg-white overflow-hidden">
      {reports.map((r) => (
        <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
            <p className="text-xs text-gray-400">
              {r.template_name} · {r.upload_filename} · {r.output_format.toUpperCase()} ·{" "}
              {formatDateTime(r.generated_at ?? r.created_at)}
            </p>
            {r.error_message && (
              <p className="text-xs text-red-600 mt-0.5">{r.error_message}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <Badge variant={statusVariant[r.status] ?? "muted"}>
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </Badge>
            {r.status === "generated" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload(r)}
                disabled={downloadingId === r.id}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                {downloadingId === r.id ? "Downloading..." : "Download"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

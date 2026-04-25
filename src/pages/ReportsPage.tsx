import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReports, downloadReport } from "../api/reports";
import { extractErrorMessage } from "../api/client";
import { ReportList } from "../components/reports/ReportList";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";
import { triggerBlobDownload, getReportFilename } from "../utils/fileDownload";
import type { GeneratedReport } from "../types/report";

export function ReportsPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
  });

  const handleDownload = async (report: GeneratedReport) => {
    setDownloadingId(report.id);
    setDownloadError(null);
    try {
      const blob = await downloadReport(report.id);
      triggerBlobDownload(
        blob,
        getReportFilename(report.name, report.output_format)
      );
    } catch (e) {
      setDownloadError(extractErrorMessage(e));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Generated report history.</p>
      </div>

      {downloadError && (
        <Alert variant="destructive">
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400 py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reports...
        </div>
      ) : (
        <ReportList
          reports={reports}
          onDownload={handleDownload}
          downloadingId={downloadingId}
        />
      )}
    </div>
  );
}

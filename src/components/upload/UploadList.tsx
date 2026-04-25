import { Link } from "react-router-dom";
import { FileSpreadsheet, AlertCircle } from "lucide-react";
import type { Upload } from "../../types/upload";
import { Badge } from "../ui/badge";
import { formatDate } from "../../utils/formatDate";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "muted" | "info"> = {
  uploaded: "info",
  parsed: "success",
  failed: "destructive",
};

const statusLabel: Record<string, string> = {
  uploaded: "Uploaded",
  parsed: "Parsed",
  failed: "Failed",
};

interface Props {
  uploads: Upload[];
}

export function UploadList({ uploads }: Props) {
  if (uploads.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No uploads yet. Upload an Excel file to get started.</p>
      </div>
    );
  }

  return (
    <div className="divide-y border rounded-lg bg-white overflow-hidden">
      {uploads.map((upload) => (
        <div
          key={upload.id}
          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
            <div className="min-w-0">
              <Link
                to={`/uploads/${upload.id}`}
                className="text-sm font-medium text-blue-600 hover:underline truncate block"
              >
                {upload.original_filename}
              </Link>
              <p className="text-xs text-gray-400">{formatDate(upload.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {upload.is_duplicate && (
              <span title="Duplicate file" className="text-yellow-500">
                <AlertCircle className="h-4 w-4" />
              </span>
            )}
            <Badge variant={statusVariant[upload.status] ?? "muted"}>
              {statusLabel[upload.status] ?? upload.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

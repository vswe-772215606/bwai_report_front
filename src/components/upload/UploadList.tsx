import { Link } from "react-router-dom";
import { FileSpreadsheet, AlertCircle } from "lucide-react";
import type { Upload } from "../../types/upload";
import { Badge } from "../ui/badge";
import { formatDate } from "../../utils/formatDate";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "muted" | "info"> = {
  uploaded: "info",
  parsing: "muted",
  parsed: "success",
  error: "destructive",
  duplicate: "warning",
};

const statusLabel: Record<string, string> = {
  uploaded: "Uploaded",
  parsing: "Parsing",
  parsed: "Parsed",
  error: "Error",
  duplicate: "Duplicate",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
      {uploads.map((u) => (
        <div key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
          <div className="flex items-center gap-3 min-w-0">
            <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
            <div className="min-w-0">
              <Link
                to={`/uploads/${u.id}`}
                className="text-sm font-medium text-blue-600 hover:underline truncate block"
              >
                {u.filename}
              </Link>
              <p className="text-xs text-gray-400">
                {formatBytes(u.file_size)} · {formatDate(u.created_at)} · {u.sheet_count} sheet{u.sheet_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {u.duplicate_of && (
              <span title="Duplicate file" className="text-yellow-500">
                <AlertCircle className="h-4 w-4" />
              </span>
            )}
            <Badge variant={statusVariant[u.status] ?? "muted"}>
              {statusLabel[u.status] ?? u.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadExcel } from "../api/uploads";
import { extractErrorMessage } from "../api/client";
import { ExcelUploadBox } from "../components/upload/ExcelUploadBox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { FileSpreadsheet } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadExcelPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setPending(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!pending) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadExcel(pending);
      navigate(`/uploads/${result.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Upload Excel File</h1>
        <p className="text-sm text-gray-500">Upload a .xlsx or .xls financial data file for analysis.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ExcelUploadBox onFile={handleFile} disabled={uploading} />

      {pending && (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{pending.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(pending.size)}</p>
            </div>
            <button
              className="text-xs text-gray-400 hover:text-gray-700"
              onClick={() => setPending(null)}
              disabled={uploading}
            >
              Remove
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      )}
    </div>
  );
}

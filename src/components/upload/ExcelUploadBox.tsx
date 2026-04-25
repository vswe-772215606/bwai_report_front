import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ACCEPTED_EXT = [".xlsx", ".xls"];

export function ExcelUploadBox({ onFile, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): boolean => {
    if (!ACCEPTED.includes(file.type) && !ACCEPTED_EXT.some((ext) => file.name.endsWith(ext))) {
      setError(`Invalid file type. Only .xlsx and .xls files are accepted.`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file && validate(file)) onFile(file);
    },
    [disabled, onFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validate(file)) onFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 cursor-pointer transition-colors",
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleChange}
          disabled={disabled}
        />
        <FileSpreadsheet className="h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700">
          Drag & drop Excel file here
        </p>
        <p className="text-xs text-gray-400 mt-1">or click to browse</p>
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
          <Upload className="h-3 w-3" />
          <span>Accepts .xlsx and .xls only</span>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

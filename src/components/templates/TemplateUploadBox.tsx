import { useCallback, useState } from "react";
import { FileUp, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function TemplateUploadBox({ onFile, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): boolean => {
    if (!file.name.endsWith(".docx")) {
      setError("Only .docx files are accepted.");
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
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors",
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept=".docx"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleChange}
          disabled={disabled}
        />
        <FileUp className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">Upload DOCX template</p>
        <p className="text-xs text-gray-400 mt-1">Accepts .docx only</p>
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

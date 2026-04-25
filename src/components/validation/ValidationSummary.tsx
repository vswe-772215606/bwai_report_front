import type { ValidationResult } from "../../types/validation";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface Props {
  result: ValidationResult;
}

export function ValidationSummary({ result }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className={`rounded-lg border p-4 ${result.error_count > 0 ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className={`h-5 w-5 ${result.error_count > 0 ? "text-red-500" : "text-gray-300"}`} />
          <span className="text-sm font-medium text-gray-700">Errors</span>
        </div>
        <p className={`text-2xl font-bold mt-1 ${result.error_count > 0 ? "text-red-600" : "text-gray-400"}`}>
          {result.error_count}
        </p>
        {result.has_blocking_errors && (
          <p className="text-xs text-red-600 mt-1 font-medium">Blocks report generation</p>
        )}
      </div>

      <div className={`rounded-lg border p-4 ${result.warning_count > 0 ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-white"}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${result.warning_count > 0 ? "text-yellow-500" : "text-gray-300"}`} />
          <span className="text-sm font-medium text-gray-700">Warnings</span>
        </div>
        <p className={`text-2xl font-bold mt-1 ${result.warning_count > 0 ? "text-yellow-600" : "text-gray-400"}`}>
          {result.warning_count}
        </p>
      </div>

      <div className={`rounded-lg border p-4 ${result.info_count > 0 ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"}`}>
        <div className="flex items-center gap-2">
          <Info className={`h-5 w-5 ${result.info_count > 0 ? "text-blue-500" : "text-gray-300"}`} />
          <span className="text-sm font-medium text-gray-700">Info</span>
        </div>
        <p className={`text-2xl font-bold mt-1 ${result.info_count > 0 ? "text-blue-600" : "text-gray-400"}`}>
          {result.info_count}
        </p>
      </div>

      {result.error_count === 0 && result.warning_count === 0 && (
        <div className="col-span-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          All checks passed. Ready to generate report.
        </div>
      )}
    </div>
  );
}

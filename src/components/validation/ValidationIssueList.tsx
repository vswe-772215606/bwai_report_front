import { Link } from "react-router-dom";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { ValidationIssue, ValidationSeverity } from "../../types/validation";
import { Badge } from "../ui/badge";

interface Props {
  issues: ValidationIssue[];
  uploadId?: string;
}

const severityIcon: Record<ValidationSeverity, React.ReactNode> = {
  error: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />,
  info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
};

const severityVariant: Record<ValidationSeverity, "destructive" | "warning" | "info"> = {
  error: "destructive",
  warning: "warning",
  info: "info",
};

export function ValidationIssueList({ issues, uploadId }: Props) {
  if (issues.length === 0) {
    return <p className="text-sm text-gray-400 py-4">No issues found.</p>;
  }

  const sorted = [...issues].sort((a, b) => {
    const order: Record<ValidationSeverity, number> = { error: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-2">
      {sorted.map((issue) => (
        <div
          key={issue.id}
          className={`rounded-lg border p-3 ${
            issue.severity === "error"
              ? "border-red-200 bg-red-50"
              : issue.severity === "warning"
              ? "border-yellow-200 bg-yellow-50"
              : "border-blue-200 bg-blue-50"
          }`}
        >
          <div className="flex items-start gap-2">
            {severityIcon[issue.severity]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={severityVariant[issue.severity]} className="text-[10px]">
                  {issue.severity.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500 font-mono">{issue.issue_type}</span>
              </div>
              <p className="text-sm font-medium mt-0.5">{issue.message}</p>

              {(issue.affected_sheet || issue.affected_row !== undefined || issue.affected_column) && (
                <p className="text-xs text-gray-500 mt-1">
                  {issue.affected_sheet && <span>Sheet: <code className="font-mono">{issue.affected_sheet}</code></span>}
                  {issue.affected_row !== undefined && <span> · Row: {issue.affected_row}</span>}
                  {issue.affected_column && <span> · Column: <code className="font-mono">{issue.affected_column}</code></span>}
                </p>
              )}

              {(issue.expected_value || issue.actual_value) && (
                <div className="flex gap-4 mt-1 text-xs">
                  {issue.expected_value && (
                    <span className="text-green-700">Expected: <code>{issue.expected_value}</code></span>
                  )}
                  {issue.actual_value && (
                    <span className="text-red-700">Actual: <code>{issue.actual_value}</code></span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mt-2">
                {issue.mapping_related && (
                  <Link
                    to="/mapping"
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Fix mapping →
                  </Link>
                )}
                {issue.affected_row !== undefined && uploadId && (
                  <Link
                    to={`/uploads/${uploadId}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View source row
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { RawTable } from "../../types/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface Props {
  tables: RawTable[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function confidenceColor(score: number): "success" | "warning" | "destructive" {
  if (score >= 0.75) return "success";
  if (score >= 0.5) return "warning";
  return "destructive";
}

export function TableCandidates({ tables, selectedId, onSelect }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (tables.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-center gap-2 text-yellow-700 font-medium text-sm">
          <AlertTriangle className="h-4 w-4" />
          No table candidates detected in this upload.
        </div>
        <p className="text-xs text-yellow-600 mt-1">
          You can still manually select a header row in Table Review.
        </p>
      </div>
    );
  }

  const visible = showAll ? tables : tables.slice(0, 5);

  return (
    <div className="space-y-2">
      {visible.map((t) => (
        <div
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
            selectedId === t.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:bg-gray-50"
          )}
        >
          <input
            type="radio"
            checked={selectedId === t.id}
            onChange={() => onSelect(t.id)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-800">
                Sheet: <span className="font-mono">{t.sheet_name}</span>
              </span>
              <span className="text-xs text-gray-500">Table #{t.table_index}</span>
              <Badge variant={confidenceColor(t.confidence_score)}>
                {(t.confidence_score * 100).toFixed(0)}% confidence
              </Badge>
              {t.confidence_score < 0.75 && (
                <Badge variant="warning">Low confidence</Badge>
              )}
              {t.has_duplicate_columns && (
                <Badge variant="warning">Duplicate columns</Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Rows {t.start_row}–{t.end_row} · {t.row_count} rows · {t.column_count} cols ·
              Detected header row: {t.detected_header_row}
            </p>
          </div>
        </div>
      ))}
      {tables.length > 5 && (
        <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show less" : `Show ${tables.length - 5} more`}
        </Button>
      )}
    </div>
  );
}

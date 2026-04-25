import { useState } from "react";
import type { AIMappingSuggestion } from "../../types/mapping";
import type { AggregationType } from "../../types/template";
import type { ColumnInfo } from "../../types/table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MappingConfidenceBadge } from "./MappingConfidenceBadge";
import { AggregationSelector } from "./AggregationSelector";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";

export interface MappingRow {
  field_key: string;
  field_label: string;
  required: boolean;
  source_sheet?: string;
  source_column?: string;
  source_column_index?: number;
  aggregation_type: AggregationType;
  ai_confidence?: number;
  user_overridden: boolean;
}

interface Props {
  rows: MappingRow[];
  availableColumns: ColumnInfo[];
  onChange: (rows: MappingRow[]) => void;
}

export function MappingReviewTable({ rows, availableColumns, onChange }: Props) {
  const update = (index: number, patch: Partial<MappingRow>) => {
    const next = rows.map((r, i) =>
      i === index ? { ...r, ...patch, user_overridden: true } : r
    );
    onChange(next);
  };

  const clear = (index: number) => {
    update(index, {
      source_column: undefined,
      source_column_index: undefined,
      source_sheet: undefined,
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Template Field</TableHead>
          <TableHead>Req.</TableHead>
          <TableHead>Source Column</TableHead>
          <TableHead>Aggregation</TableHead>
          <TableHead>AI Confidence</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => {
          const missing = row.required && !row.source_column;
          const needsReview = !missing && (row.ai_confidence ?? 1) < 0.75;

          return (
            <TableRow key={row.field_key} className={missing ? "bg-red-50" : ""}>
              <TableCell className="text-xs text-gray-400">{i + 1}</TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium">{row.field_label}</p>
                  <p className="text-xs text-gray-400 font-mono">{row.field_key}</p>
                </div>
              </TableCell>
              <TableCell>
                {row.required ? (
                  <Badge variant="destructive" className="text-[10px]">Required</Badge>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell>
                <Select
                  value={row.source_column ?? "__none__"}
                  onValueChange={(v) => {
                    if (v === "__none__") {
                      clear(i);
                    } else {
                      const col = availableColumns.find((c) => c.path === v);
                      update(i, {
                        source_column: col?.name,
                        source_column_index: col?.index,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-48">
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-xs text-gray-400">
                      — none —
                    </SelectItem>
                    {availableColumns.map((c) => (
                      <SelectItem key={c.path} value={c.path} className="text-xs font-mono">
                        {c.name}{c.is_duplicate ? ` [col ${c.index}]` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <AggregationSelector
                  value={row.aggregation_type}
                  onChange={(v) => update(i, { aggregation_type: v })}
                />
              </TableCell>
              <TableCell>
                <MappingConfidenceBadge confidence={row.ai_confidence} />
              </TableCell>
              <TableCell>
                {missing ? (
                  <Badge variant="destructive">Missing</Badge>
                ) : needsReview ? (
                  <Badge variant="warning">Needs review</Badge>
                ) : row.user_overridden ? (
                  <Badge variant="info">User set</Badge>
                ) : (
                  <Badge variant="success">OK</Badge>
                )}
              </TableCell>
              <TableCell>
                {row.source_column && (
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => clear(i)}>
                    Clear
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function suggestionsToRows(suggestions: AIMappingSuggestion[]): MappingRow[] {
  return suggestions.map((s) => ({
    field_key: s.field_key,
    field_label: s.field_label,
    required: s.required,
    source_sheet: s.source_sheet,
    source_column: s.source_column,
    source_column_index: s.source_column_index,
    aggregation_type: s.aggregation_type,
    ai_confidence: s.confidence,
    user_overridden: false,
  }));
}

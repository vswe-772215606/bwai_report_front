import type { UploadTablePreview } from "../../types/upload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

interface Props {
  preview: UploadTablePreview;
}

export function DataPreviewTable({ preview }: Props) {
  const { headers, rows } = preview;

  if (headers.length === 0) {
    return <p className="text-sm text-gray-400 py-3">No data to preview.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-gray-400 mb-2">
        Showing {rows.length} of {preview.total_rows} rows
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h.index} className="whitespace-nowrap text-xs">
                <div className="flex items-center gap-1">
                  <span>{h.name || `Col ${h.index}`}</span>
                  {h.is_duplicate && (
                    <Badge variant="warning" className="text-[10px] py-0">dup</Badge>
                  )}
                </div>
                {h.is_duplicate && (
                  <span className="text-[10px] text-gray-400 font-mono block">{h.path}</span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, ri) => (
            <TableRow key={ri}>
              {headers.map((h) => (
                <TableCell key={h.index} className="text-xs whitespace-nowrap max-w-[200px] truncate">
                  {String(row[h.path] ?? row[h.name] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

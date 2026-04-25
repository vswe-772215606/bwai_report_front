import type { WorkbookSheet } from "../../types/upload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface Props {
  sheets: WorkbookSheet[];
}

export function SheetList({ sheets }: Props) {
  if (sheets.length === 0) {
    return <p className="text-sm text-gray-400 py-4">No sheets detected.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sheet Name</TableHead>
          <TableHead className="text-right">Rows</TableHead>
          <TableHead className="text-right">Columns</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sheets.map((s) => (
          <TableRow key={s.sheet_name}>
            <TableCell className="font-mono text-sm">{s.sheet_name}</TableCell>
            <TableCell className="text-right text-sm">{s.row_count}</TableCell>
            <TableCell className="text-right text-sm">{s.col_count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

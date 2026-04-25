import type { TemplateField } from "../../types/template";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

interface Props {
  fields: TemplateField[];
}

export function TemplateFieldTable({ fields }: Props) {
  if (fields.length === 0) {
    return <p className="text-sm text-gray-400 py-4">No fields defined.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field Key</TableHead>
          <TableHead>Label</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Aggregation</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Placeholder</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((f) => (
          <TableRow key={f.id}>
            <TableCell className="font-mono text-xs">{f.field_key}</TableCell>
            <TableCell className="text-sm">{f.label}</TableCell>
            <TableCell className="text-xs">{f.data_type}</TableCell>
            <TableCell>
              {f.required ? (
                <Badge variant="destructive" className="text-[10px]">Yes</Badge>
              ) : (
                <span className="text-xs text-gray-400">No</span>
              )}
            </TableCell>
            <TableCell className="text-xs">{f.aggregation_type}</TableCell>
            <TableCell className="text-xs font-mono">{f.category_code ?? "—"}</TableCell>
            <TableCell className="text-xs font-mono text-blue-600">{f.placeholder_example}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

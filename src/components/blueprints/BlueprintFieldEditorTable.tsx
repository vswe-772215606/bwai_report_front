import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

export type BlueprintFieldDraft = {
  local_id: string;
  field_key: string;
  label: string;
  data_type: string;
  required: boolean;
  formula: string;
  display_order: string;
  aliases: string;
};

type Props = {
  rows: BlueprintFieldDraft[];
  onChange: (rows: BlueprintFieldDraft[]) => void;
  readOnly?: boolean;
  showAddRow?: boolean;
};

const DATA_TYPE_OPTIONS = ["string", "currency", "number", "date", "boolean", "text"];

export function createEmptyBlueprintFieldDraft(seed: number): BlueprintFieldDraft {
  return {
    local_id: `draft-${seed}`,
    field_key: "",
    label: "",
    data_type: "string",
    required: false,
    formula: "",
    display_order: String(seed),
    aliases: "",
  };
}

export function BlueprintFieldEditorTable({
  rows,
  onChange,
  readOnly = false,
  showAddRow = true,
}: Props) {
  const updateRow = (rowId: string, patch: Partial<BlueprintFieldDraft>) => {
    onChange(
      rows.map((row) => (row.local_id === rowId ? { ...row, ...patch } : row))
    );
  };

  const removeRow = (rowId: string) => {
    onChange(rows.filter((row) => row.local_id !== rowId));
  };

  const addRow = () => {
    const nextSeed = rows.length + 1;
    onChange([...rows, createEmptyBlueprintFieldDraft(nextSeed)]);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        Aliases are stored in <code>hints_json.aliases</code>. Use them for noisy spreadsheet
        headers like "client nm", "employee full name", or "amt paid".
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[140px]">Field key</TableHead>
            <TableHead className="min-w-[160px]">Label</TableHead>
            <TableHead className="min-w-[120px]">Data type</TableHead>
            <TableHead className="min-w-[120px]">Aliases</TableHead>
            <TableHead className="min-w-[90px]">Required</TableHead>
            <TableHead className="min-w-[160px]">Formula</TableHead>
            <TableHead className="min-w-[90px]">Order</TableHead>
            {!readOnly && <TableHead className="w-[70px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const rowClassName = row.formula
              ? "bg-amber-50/70"
              : row.required
              ? "bg-rose-50/70"
              : "";

            return (
              <TableRow key={row.local_id} className={rowClassName}>
                <TableCell>
                  <Input
                    value={row.field_key}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateRow(row.local_id, { field_key: event.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.label}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateRow(row.local_id, { label: event.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <Badge variant="muted">{row.data_type}</Badge>
                  ) : (
                    <select
                      value={row.data_type}
                      onChange={(event) =>
                        updateRow(row.local_id, { data_type: event.target.value })
                      }
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                      {DATA_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    value={row.aliases}
                    disabled={readOnly}
                    placeholder="comma,separated,aliases"
                    onChange={(event) =>
                      updateRow(row.local_id, { aliases: event.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={row.required}
                      disabled={readOnly}
                      onChange={(event) =>
                        updateRow(row.local_id, { required: event.target.checked })
                      }
                    />
                    <span>{row.required ? "Yes" : "No"}</span>
                  </label>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.formula}
                    disabled={readOnly}
                    placeholder="Optional formula"
                    onChange={(event) =>
                      updateRow(row.local_id, { formula: event.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.display_order}
                    disabled={readOnly}
                    type="number"
                    onChange={(event) =>
                      updateRow(row.local_id, { display_order: event.target.value })
                    }
                  />
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeRow(row.local_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {showAddRow && !readOnly && (
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4" />
          Add field
        </Button>
      )}
    </div>
  );
}

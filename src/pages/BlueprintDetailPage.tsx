import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import {
  createBlueprintField,
  getBlueprint,
  getBlueprintFields,
} from "../api/blueprints";
import { extractErrorMessage } from "../api/client";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { JsonDebugPanel } from "../components/workflow/JsonDebugPanel";
import { StatusBadge } from "../components/workflow/StatusBadge";
import { useWorkspaceStore } from "../store/workspaceStore";
import { formatDateTime } from "../utils/formatDate";

function getAliases(hints: unknown): string[] {
  if (!hints || typeof hints !== "object" || Array.isArray(hints)) {
    return [];
  }

  const aliases = (hints as { aliases?: unknown }).aliases;

  if (!Array.isArray(aliases)) {
    return [];
  }

  return aliases.filter((alias): alias is string => typeof alias === "string");
}

export function BlueprintDetailPage() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const setCurrentBlueprint = useWorkspaceStore((state) => state.setCurrentBlueprint);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sectionKey, setSectionKey] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [label, setLabel] = useState("");
  const [dataType, setDataType] = useState("string");
  const [required, setRequired] = useState(false);
  const [formula, setFormula] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [aliases, setAliases] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: blueprint, isLoading: loadingBlueprint, error: blueprintError } = useQuery({
    queryKey: ["blueprint", id],
    queryFn: () => getBlueprint(id!),
    enabled: Boolean(id),
  });

  const { data: fields = [], isLoading: loadingFields, error: fieldsError } = useQuery({
    queryKey: ["blueprint-fields", id],
    queryFn: () => getBlueprintFields(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (blueprint) {
      setCurrentBlueprint({ id: blueprint.id, label: blueprint.title });
    }
  }, [blueprint, setCurrentBlueprint]);

  const createFieldMutation = useMutation({
    mutationFn: () => {
      const aliasList = aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter(Boolean);

      return createBlueprintField(id!, {
        section_key: sectionKey || null,
        field_key: fieldKey.trim(),
        label: label.trim(),
        data_type: dataType,
        required,
        formula: formula.trim() || null,
        display_order: displayOrder ? Number(displayOrder) : null,
        hints_json: aliasList.length > 0 ? { aliases: aliasList } : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blueprint-fields", id] });
      setDialogOpen(false);
      setSectionKey("");
      setFieldKey("");
      setLabel("");
      setDataType("string");
      setRequired(false);
      setFormula("");
      setDisplayOrder("");
      setAliases("");
      setLocalError(null);
    },
    onError: (mutationError) => setLocalError(extractErrorMessage(mutationError)),
  });

  const sortedFields = useMemo(
    () =>
      [...fields].sort(
        (left, right) =>
          (left.display_order ?? Number.MAX_SAFE_INTEGER) -
          (right.display_order ?? Number.MAX_SAFE_INTEGER)
      ),
    [fields]
  );

  if (loadingBlueprint) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading blueprint...
      </div>
    );
  }

  if (blueprintError || !blueprint) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{extractErrorMessage(blueprintError)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/blueprints" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to blueprints
        </Link>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950">{blueprint.title}</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              This is the controlled generation mode. Keep fields precise, use aliases for noisy
              spreadsheet headers, and avoid turning the blueprint into a generic mapping system.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge value={blueprint.status} />
            {blueprint.source_type && <Badge variant="info">{blueprint.source_type}</Badge>}
            {blueprint.document_domain && (
              <Badge variant={blueprint.document_domain === "finance" ? "success" : "info"}>
                {blueprint.document_domain}
              </Badge>
            )}
            {blueprint.document_type && <Badge variant="muted">{blueprint.document_type}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Blueprint ID
            </div>
            <div className="mt-1 text-sm text-slate-900">{blueprint.id}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Created
            </div>
            <div className="mt-1 text-sm text-slate-900">
              {formatDateTime(blueprint.created_at)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Updated
            </div>
            <div className="mt-1 text-sm text-slate-900">
              {formatDateTime(blueprint.updated_at)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Supports batches
            </div>
            <div className="mt-1 text-sm text-slate-900">
              {blueprint.supports_batch_generation ? "Yes" : "No"}
            </div>
          </div>
        </CardContent>
      </Card>

      {blueprint.parse_error && (
        <Alert variant="warning">
          <AlertDescription>
            Parse error: {blueprint.parse_error}. Review and complete the field list manually.
          </AlertDescription>
        </Alert>
      )}

      {fieldsError && (
        <Alert variant="destructive">
          <AlertDescription>{extractErrorMessage(fieldsError)}</AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 bg-white">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base text-slate-950">Blueprint fields</CardTitle>
          <Button onClick={() => setDialogOpen(true)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
            <Plus className="mr-2 h-4 w-4" />
            Add field
          </Button>
        </CardHeader>
        <CardContent>
          {loadingFields ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading blueprint fields...
            </div>
          ) : sortedFields.length === 0 ? (
            <Alert variant="warning">
              <AlertDescription>
                No fields are defined yet. Add fields before using this blueprint in controlled
                batch mode.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Field key</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Aliases</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Formula</TableHead>
                  <TableHead>Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>{field.section_key ?? "-"}</TableCell>
                    <TableCell className="font-mono text-xs">{field.field_key}</TableCell>
                    <TableCell>{field.label}</TableCell>
                    <TableCell>{field.data_type}</TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {getAliases(field.hints_json).length === 0 ? (
                          <span className="text-sm text-slate-500">-</span>
                        ) : (
                          getAliases(field.hints_json).map((alias) => (
                            <Badge key={alias} variant="muted">
                              {alias}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{field.required ? "Yes" : "No"}</TableCell>
                    <TableCell className="max-w-[260px] truncate font-mono text-xs">
                      {field.formula ?? "-"}
                    </TableCell>
                    <TableCell>{field.display_order ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <JsonDebugPanel
        title="Blueprint field debug"
        value={sortedFields.map((field) => ({
          id: field.id,
          field_key: field.field_key,
          hints_json: field.hints_json,
        }))}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add blueprint field</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="section-key">Section key</Label>
              <Input
                id="section-key"
                value={sectionKey}
                onChange={(event) => setSectionKey(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-key">Field key</Label>
              <Input
                id="field-key"
                value={fieldKey}
                onChange={(event) => setFieldKey(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={label} onChange={(event) => setLabel(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-type">Data type</Label>
              <Input
                id="data-type"
                value={dataType}
                onChange={(event) => setDataType(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aliases">Aliases</Label>
              <Input
                id="aliases"
                value={aliases}
                onChange={(event) => setAliases(event.target.value)}
                placeholder="comma,separated,aliases"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display-order">Display order</Label>
              <Input
                id="display-order"
                type="number"
                value={displayOrder}
                onChange={(event) => setDisplayOrder(event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="formula">Formula</Label>
              <Input
                id="formula"
                value={formula}
                onChange={(event) => setFormula(event.target.value)}
                placeholder="Optional formula"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={required}
                onChange={(event) => setRequired(event.target.checked)}
              />
              Required
            </label>
          </div>

          {localError && (
            <Alert variant="destructive">
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createFieldMutation.mutate()}
              disabled={!fieldKey.trim() || !label.trim() || createFieldMutation.isPending}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              {createFieldMutation.isPending ? "Saving..." : "Save field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

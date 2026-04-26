import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import {
  createBlueprint,
  getBlueprints,
  uploadBlueprintDocx,
} from "../api/blueprints";
import { suggestTemplateFields } from "../api/ai";
import { extractErrorMessage } from "../api/client";
import {
  BlueprintFieldEditorTable,
  createEmptyBlueprintFieldDraft,
  type BlueprintFieldDraft,
} from "../components/blueprints/BlueprintFieldEditorTable";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { StatusBadge } from "../components/workflow/StatusBadge";
import { useWorkspaceStore } from "../store/workspaceStore";
import { formatDateTime } from "../utils/formatDate";

function buildFieldPayload(rows: BlueprintFieldDraft[]) {
  return rows
    .filter((row) => row.field_key.trim() && row.label.trim())
    .map((row, index) => {
      const aliases = row.aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter(Boolean);

      return {
        field_key: row.field_key.trim(),
        label: row.label.trim(),
        data_type: row.data_type,
        required: row.required,
        formula: row.formula.trim() || null,
        display_order: row.display_order ? Number(row.display_order) : index + 1,
        hints_json: aliases.length > 0 ? { aliases } : null,
      };
    });
}

export function BlueprintsPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const currentBlueprint = useWorkspaceStore((state) => state.currentBlueprint);
  const setCurrentBlueprint = useWorkspaceStore((state) => state.setCurrentBlueprint);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [documentDomain, setDocumentDomain] = useState("finance");
  const [documentType, setDocumentType] = useState("");
  const [supportsBatchGeneration, setSupportsBatchGeneration] = useState(true);
  const [fieldRows, setFieldRows] = useState<BlueprintFieldDraft[]>([
    createEmptyBlueprintFieldDraft(1),
  ]);
  const [error, setError] = useState<string | null>(null);

  const openInDocxMode = searchParams.get("mode") === "docx";

  useEffect(() => {
    const nextDocumentType = searchParams.get("documentType");
    const nextDocumentDomain = searchParams.get("documentDomain");

    if (nextDocumentType) {
      setDocumentType(nextDocumentType);
      setCreateOpen(true);
    }

    if (nextDocumentDomain) {
      setDocumentDomain(nextDocumentDomain);
    }
  }, [searchParams]);

  const { data: blueprints = [], isLoading } = useQuery({
    queryKey: ["blueprints"],
    queryFn: getBlueprints,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createBlueprint({
        title: title.trim(),
        document_domain: documentDomain,
        document_type: documentType.trim() || null,
        supports_batch_generation: supportsBatchGeneration,
        source_type: "manual",
        fields: buildFieldPayload(fieldRows),
      }),
    onSuccess: (blueprint) => {
      queryClient.invalidateQueries({ queryKey: ["blueprints"] });
      setCurrentBlueprint({ id: blueprint.id, label: blueprint.title });
      setCreateOpen(false);
      setTitle("");
      setDocumentType("");
      setDocumentDomain("finance");
      setSupportsBatchGeneration(true);
      setFieldRows([createEmptyBlueprintFieldDraft(1)]);
      setError(null);
    },
    onError: (mutationError) => setError(extractErrorMessage(mutationError)),
  });

  const docxMutation = useMutation({
    mutationFn: uploadBlueprintDocx,
    onSuccess: (blueprint) => {
      queryClient.invalidateQueries({ queryKey: ["blueprints"] });
      setCurrentBlueprint({ id: blueprint.id, label: blueprint.title });
      setError(null);
    },
    onError: (mutationError) => setError(extractErrorMessage(mutationError)),
  });

  const suggestMutation = useMutation({
    mutationFn: () =>
      suggestTemplateFields({
        title: title.trim(),
        document_domain: documentDomain,
        document_type: documentType.trim(),
        existing_fields: buildFieldPayload(fieldRows).map((field) => ({
          field_key: field.field_key,
          label: field.label,
        })),
      }),
    onSuccess: (suggestedFields) => {
      if (suggestedFields.length === 0) {
        setError("The AI helper did not return any field suggestions.");
        return;
      }

      setFieldRows(
        suggestedFields.map((field, index) => ({
          local_id: `draft-${index + 1}`,
          field_key: field.field_key,
          label: field.label,
          data_type: field.data_type,
          required: field.required,
          formula: field.formula ?? "",
          display_order: String(field.display_order ?? index + 1),
          aliases: Array.isArray((field.hints_json as { aliases?: unknown } | null)?.aliases)
            ? ((field.hints_json as { aliases?: string[] }).aliases ?? []).join(", ")
            : "",
        }))
      );
      setError(null);
    },
    onError: (mutationError) => setError(extractErrorMessage(mutationError)),
  });

  const orderedBlueprints = useMemo(
    () =>
      [...blueprints].sort(
        (left, right) =>
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
      ),
    [blueprints]
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Blueprints
            </div>
            <CardTitle className="mt-2 text-2xl text-slate-950">
              Controlled mode for repeatable DOCX-based generation
            </CardTitle>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Blueprints stay useful where the workflow needs predictable field replacement.
              They are no longer the whole product. Use them for controlled batch generation,
              not as a generic reporting layer.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCreateOpen(true)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              Create manual blueprint
            </Button>
            <Button asChild variant="outline">
              <Link to="/document-types">Hujjat turlarini ko&apos;rish</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">Upload blueprint DOCX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {openInDocxMode && (
              <Alert variant="info">
                <AlertDescription>
                  Upload a source DOCX when you want the controlled batch flow to start from an
                  existing template-like document.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-sm leading-6 text-slate-600">
              DOCX is the main editable source format. The backend creates a blueprint shell from
              the uploaded file, then field review stays explicit and editable.
            </p>

            <input
              type="file"
              accept=".docx"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  docxMutation.mutate(file);
                }
                event.target.value = "";
              }}
            />

            {docxMutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading DOCX blueprint...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">What stays in this area</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Manual blueprint creation
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              DOCX upload for controlled generation
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Field definitions with alias hints in <code>hints_json.aliases</code>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Batch-friendly metadata: domain, type, and repeatability
            </div>
          </CardContent>
        </Card>
      </div>

      {currentBlueprint && (
        <Alert variant="success">
          <AlertDescription>
            Current blueprint: <span className="font-medium">{currentBlueprint.label}</span>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Available blueprints</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading blueprints...
            </div>
          ) : orderedBlueprints.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">No blueprints are available yet.</p>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {orderedBlueprints.map((blueprint) => {
                const isCurrent = currentBlueprint?.id === blueprint.id;

                return (
                  <Card key={blueprint.id} className="border-slate-200 bg-slate-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base text-slate-950">
                        <span>{blueprint.title}</span>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge value={blueprint.status} />
                          {blueprint.source_type && <Badge variant="info">{blueprint.source_type}</Badge>}
                          {isCurrent && <Badge variant="success">Current blueprint</Badge>}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Domain
                          </div>
                          <div className="mt-1 text-sm text-slate-900">
                            {blueprint.document_domain ?? "Not set"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Document type
                          </div>
                          <div className="mt-1 text-sm text-slate-900">
                            {blueprint.document_type ?? "Not set"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Batch capable
                          </div>
                          <div className="mt-1 text-sm text-slate-900">
                            {blueprint.supports_batch_generation ? "Yes" : "No"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Created
                          </div>
                          <div className="mt-1 text-sm text-slate-900">
                            {formatDateTime(blueprint.created_at)}
                          </div>
                        </div>
                      </div>

                      {blueprint.parse_error && (
                        <Alert variant="warning">
                          <AlertDescription>
                            Parse error: {blueprint.parse_error}. Review the field list manually.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            setCurrentBlueprint({
                              id: blueprint.id,
                              label: blueprint.title,
                            })
                          }
                          className={isCurrent ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : undefined}
                        >
                          {isCurrent ? "Selected" : "Set current"}
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/blueprints/${blueprint.id}`}>Open blueprint</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Create manual blueprint</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blueprint-title">Title</Label>
                <Input
                  id="blueprint-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Domain</Label>
                <Select value={documentDomain} onValueChange={setDocumentDomain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-type">Document type</Label>
                <Input
                  id="document-type"
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                  placeholder="e.g. payroll-summary or cash-flow-package"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={supportsBatchGeneration}
                  onChange={(event) => setSupportsBatchGeneration(event.target.checked)}
                />
                Supports controlled batch generation
              </label>

              <Button
                type="button"
                variant="outline"
                disabled={!title.trim() || !documentType.trim() || suggestMutation.isPending}
                onClick={() => suggestMutation.mutate()}
              >
                {suggestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Suggest field set
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <p>
                The optional AI helper seeds field definitions only. Operators still control the
                blueprint structure and aliases before saving.
              </p>
              <p className="mt-3">
                Alias values are stored in <code>hints_json.aliases</code> so noisy spreadsheet
                headers can map to stable field keys without adding a separate mapping flow.
              </p>
            </div>
          </div>

          <BlueprintFieldEditorTable rows={fieldRows} onChange={setFieldRows} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!title.trim() || createMutation.isPending}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              {createMutation.isPending ? "Creating..." : "Create blueprint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

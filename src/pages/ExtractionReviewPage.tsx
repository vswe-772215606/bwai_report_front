import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { getUploads } from "../api/uploads";
import { getBlueprints, getBlueprintFields } from "../api/blueprints";
import {
  getExtractionCandidates,
  getExtractionRun,
  runExtraction,
  selectExtractionCandidate,
} from "../api/extraction";
import { getLatestWorkbookIndexForUpload } from "../api/workbookIndex";
import { extractErrorMessage } from "../api/client";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { JsonDebugPanel } from "../components/workflow/JsonDebugPanel";
import { KeyValueList } from "../components/workflow/KeyValueList";
import { StatusBadge } from "../components/workflow/StatusBadge";
import { useWorkspaceStore } from "../store/workspaceStore";
import { formatDateTime } from "../utils/formatDate";
import type { BlueprintField } from "../types/blueprint";
import type { ExtractionCandidate } from "../types/extraction";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function renderEvidencePreview(value: unknown) {
  if (value == null) {
    return <div className="text-sm text-slate-500">Not available yet.</div>;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <div className="text-sm text-slate-800">{String(value)}</div>;
  }

  const record = asRecord(value);

  if (record) {
    return <KeyValueList value={record} />;
  }

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-700">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

type CandidateGroup = {
  field: BlueprintField;
  candidates: ExtractionCandidate[];
};

function CandidateCard({
  candidate,
  onSelect,
  selecting,
}: {
  candidate: ExtractionCandidate;
  onSelect: () => void;
  selecting: boolean;
}) {
  const lowConfidence = candidate.score != null && candidate.score < 0.75;

  return (
    <div className={`rounded-2xl border p-4 ${candidate.selected ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className="flex flex-wrap items-center gap-2">
        {candidate.selected && <Badge variant="success">Selected</Badge>}
        {lowConfidence && <Badge variant="warning">Low confidence</Badge>}
        {candidate.candidate_kind && <Badge variant="info">{candidate.candidate_kind}</Badge>}
        {candidate.score != null && (
          <Badge variant={lowConfidence ? "warning" : "muted"}>
            score {Math.round(candidate.score * 100)}%
          </Badge>
        )}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Source sheet</div>
          <div className="mt-1 text-sm text-slate-900">{candidate.source_sheet ?? "Not available yet"}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Source reference</div>
          <div className="mt-1 text-sm text-slate-900">{candidate.source_reference ?? "Not available yet"}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Rationale</div>
        <div className="mt-1 text-sm leading-6 text-slate-700">{candidate.rationale ?? "Not available yet"}</div>
      </div>

      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Evidence preview</div>
        <div className="mt-2 rounded-xl border bg-slate-50 p-3">
          {renderEvidencePreview(candidate.evidence_preview)}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={onSelect}
          disabled={candidate.selected || selecting}
          className={candidate.selected ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : undefined}
        >
          {candidate.selected ? "Selected" : selecting ? "Selecting..." : "Select candidate"}
        </Button>
      </div>

      <div className="mt-4">
        <JsonDebugPanel title="Candidate debug" value={candidate.raw_json ?? candidate} />
      </div>
    </div>
  );
}

export function ExtractionReviewPage() {
  const queryClient = useQueryClient();
  const currentUpload = useWorkspaceStore((state) => state.currentUpload);
  const currentBlueprint = useWorkspaceStore((state) => state.currentBlueprint);
  const currentExtractionRun = useWorkspaceStore((state) => state.currentExtractionRun);
  const setCurrentUpload = useWorkspaceStore((state) => state.setCurrentUpload);
  const setCurrentBlueprint = useWorkspaceStore((state) => state.setCurrentBlueprint);
  const setCurrentIndexRun = useWorkspaceStore((state) => state.setCurrentIndexRun);
  const setCurrentExtractionRun = useWorkspaceStore((state) => state.setCurrentExtractionRun);
  const [useLatestIndex, setUseLatestIndex] = useState(true);

  const uploadId = currentUpload?.id ?? "";
  const blueprintId = currentBlueprint?.id ?? "";

  const { data: uploads = [] } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  const { data: blueprints = [] } = useQuery({
    queryKey: ["blueprints"],
    queryFn: getBlueprints,
  });

  const { data: latestIndex } = useQuery({
    queryKey: ["workbook-index", "latest", uploadId],
    queryFn: () => getLatestWorkbookIndexForUpload(uploadId),
    enabled: Boolean(uploadId),
    retry: false,
  });

  const { data: blueprintFields = [] } = useQuery({
    queryKey: ["blueprint-fields", blueprintId],
    queryFn: () => getBlueprintFields(blueprintId),
    enabled: Boolean(blueprintId),
  });

  const activeRunId = currentExtractionRun?.id ?? null;

  const { data: extractionRun } = useQuery({
    queryKey: ["extraction-run", activeRunId],
    queryFn: () => getExtractionRun(activeRunId!),
    enabled: Boolean(activeRunId),
  });

  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ["extraction-candidates", activeRunId],
    queryFn: () => getExtractionCandidates(activeRunId!),
    enabled: Boolean(activeRunId),
  });

  const runMutation = useMutation({
    mutationFn: runExtraction,
    onSuccess: (run) => {
      setCurrentExtractionRun({
        id: run.id,
        label: `Run ${run.id}`,
      });
      if (run.workbook_index_run_id) {
        setCurrentIndexRun({
          id: run.workbook_index_run_id,
          label: `Run ${run.workbook_index_run_id}`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["extraction-run"] });
      queryClient.invalidateQueries({ queryKey: ["extraction-candidates"] });
    },
  });

  const selectMutation = useMutation({
    mutationFn: selectExtractionCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extraction-run", activeRunId] });
      queryClient.invalidateQueries({ queryKey: ["extraction-candidates", activeRunId] });
    },
  });

  const candidateGroups = useMemo<CandidateGroup[]>(() => {
    return blueprintFields.map((field) => ({
      field,
      candidates: candidates.filter(
        (candidate) =>
          candidate.blueprint_field_id === field.id ||
          candidate.field_key === field.field_key
      ),
    }));
  }, [blueprintFields, candidates]);

  const unresolvedFields = candidateGroups.filter(
    (group) => group.candidates.length === 0 || !group.candidates.some((candidate) => candidate.selected)
  ).length;

  const lowConfidenceFields = candidateGroups.filter((group) =>
    group.candidates.some((candidate) => !candidate.selected && candidate.score != null && candidate.score < 0.75)
  ).length;

  const canRunExtraction =
    Boolean(uploadId) &&
    Boolean(blueprintId) &&
    (!useLatestIndex || Boolean(latestIndex)) &&
    blueprintFields.length > 0;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="text-xl text-slate-950">Extraction Review</CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Run extraction for the current workbook and blueprint, then review extraction candidates by field. This workflow surfaces evidence-backed candidates, not final report values.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-800">Workbook upload</div>
            <Select
              value={uploadId}
              onValueChange={(value) => {
                const upload = uploads.find((item) => item.id === value);
                if (upload) {
                  setCurrentUpload({ id: upload.id, label: upload.original_filename });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workbook upload" />
              </SelectTrigger>
              <SelectContent>
                {uploads.map((upload) => (
                  <SelectItem key={upload.id} value={upload.id}>
                    {upload.original_filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-800">Blueprint</div>
            <Select
              value={blueprintId}
              onValueChange={(value) => {
                const blueprint = blueprints.find((item) => item.id === value);
                if (blueprint) {
                  setCurrentBlueprint({ id: blueprint.id, label: blueprint.title });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blueprint" />
              </SelectTrigger>
              <SelectContent>
                {blueprints.map((blueprint) => (
                  <SelectItem key={blueprint.id} value={blueprint.id}>
                    {blueprint.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 xl:col-span-2">
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-1"
                checked={useLatestIndex}
                onChange={(event) => setUseLatestIndex(event.target.checked)}
              />
              <span>
                Use the latest workbook index automatically when available.
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  If disabled, extraction runs without attaching the latest index run reference.
                </span>
              </span>
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant={latestIndex ? "success" : "warning"}>
                {latestIndex ? `Latest index run ${latestIndex.id}` : "No latest index run"}
              </Badge>
              {latestIndex && <StatusBadge value={latestIndex.status} />}
            </div>
          </div>

          <div className="xl:col-span-2">
            <Button
              onClick={() =>
                runMutation.mutate({
                  upload_id: uploadId,
                  blueprint_id: blueprintId,
                  workbook_index_run_id: useLatestIndex ? latestIndex?.id ?? null : null,
                })
              }
              disabled={!canRunExtraction || runMutation.isPending}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              {runMutation.isPending ? "Running extraction..." : "Run extraction"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!uploadId && (
        <Alert variant="warning">
          <AlertTitle>Current upload required</AlertTitle>
          <AlertDescription>
            Select the current workbook upload before running extraction.
          </AlertDescription>
        </Alert>
      )}

      {blueprintId && blueprintFields.length === 0 && (
        <Alert variant="warning">
          <AlertTitle>Blueprint fields required</AlertTitle>
          <AlertDescription>
            The selected blueprint has no fields yet. Add fields before running extraction.
          </AlertDescription>
        </Alert>
      )}

      {useLatestIndex && uploadId && !latestIndex && (
        <Alert variant="warning">
          <AlertDescription>
            No latest workbook index exists for the selected upload. Build an index first, or disable automatic index usage.
          </AlertDescription>
        </Alert>
      )}

      {runMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>{extractErrorMessage(runMutation.error)}</AlertDescription>
        </Alert>
      )}

      {extractionRun && (
        <Card className="border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base text-slate-950">
              <span>Extraction run summary</span>
              <StatusBadge value={extractionRun.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Run ID</div>
                <div className="mt-1 text-sm text-slate-900">{extractionRun.id}</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Created</div>
                <div className="mt-1 text-sm text-slate-900">{formatDateTime(extractionRun.created_at)}</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unresolved fields</div>
                <div className="mt-1 text-sm text-slate-900">
                  {extractionRun.unresolved_field_count ?? unresolvedFields}
                </div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Low-confidence fields</div>
                <div className="mt-1 text-sm text-slate-900">
                  {extractionRun.low_confidence_field_count ?? lowConfidenceFields}
                </div>
              </div>
            </div>

            {extractionRun.error_message && (
              <Alert variant="destructive">
                <AlertDescription>{extractionRun.error_message}</AlertDescription>
              </Alert>
            )}

            {(extractionRun.unresolved_field_count ?? unresolvedFields) > 0 && (
              <Alert variant="warning">
                <AlertDescription>
                  Review required: this extraction run still has unresolved fields.
                </AlertDescription>
              </Alert>
            )}

            {asRecord(extractionRun.summary_json) ? (
              <KeyValueList value={asRecord(extractionRun.summary_json)!} />
            ) : (
              <p className="text-sm text-slate-500">No structured summary is available yet.</p>
            )}

            <JsonDebugPanel title="Extraction summary debug" value={extractionRun.summary_json} />
          </CardContent>
        </Card>
      )}

      {activeRunId && (
        <Card className="border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">Extraction candidates</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCandidates ? (
              <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading extraction candidates...
              </div>
            ) : candidateGroups.length === 0 ? (
              <p className="py-8 text-sm text-slate-500">No blueprint fields are available for review.</p>
            ) : (
              <div className="space-y-5">
                {candidateGroups.map((group) => (
                  <Card key={group.field.id} className="border-slate-200 bg-slate-50">
                    <CardHeader>
                      <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base text-slate-950">
                        <span>{group.field.label}</span>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="muted">{group.field.field_key}</Badge>
                          {group.field.formula && <Badge variant="info">Formula-derived field</Badge>}
                          {group.candidates.length === 0 && <Badge variant="warning">No candidates</Badge>}
                          {group.candidates.some((candidate) => candidate.selected) && (
                            <Badge variant="success">Selected candidate</Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {group.field.formula && (
                        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Formula</div>
                          <div className="mt-1 font-mono text-xs text-sky-900">{group.field.formula}</div>
                        </div>
                      )}

                      {group.candidates.length === 0 ? (
                        <Alert variant="warning">
                          <AlertDescription>
                            No extraction candidates are available for this field yet.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          {group.candidates.map((candidate) => (
                            <CandidateCard
                              key={candidate.id}
                              candidate={candidate}
                              selecting={selectMutation.isPending && selectMutation.variables === candidate.id}
                              onSelect={() => selectMutation.mutate(candidate.id)}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

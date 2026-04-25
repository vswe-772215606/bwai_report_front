import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  createBlueprint,
  getBlueprints,
  uploadBlueprintDocx,
  uploadBlueprintPdf,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { StatusBadge } from "../components/workflow/StatusBadge";
import { useWorkspaceStore } from "../store/workspaceStore";
import { formatDateTime } from "../utils/formatDate";
import type { ReportType } from "../types/blueprint";

const reportTypeOptions: Array<{ value: ReportType; label: string }> = [
  { value: "pnl", label: "P&L / Income Statement" },
  { value: "cash_flow", label: "Cash Flow" },
  { value: "balance_sheet", label: "Balance Sheet" },
  { value: "kpi", label: "KPI" },
];

export function BlueprintsPage() {
  const queryClient = useQueryClient();
  const currentBlueprint = useWorkspaceStore((state) => state.currentBlueprint);
  const setCurrentBlueprint = useWorkspaceStore((state) => state.setCurrentBlueprint);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState<ReportType>("pnl");
  const [error, setError] = useState<string | null>(null);

  const { data: blueprints = [], isLoading } = useQuery({
    queryKey: ["blueprints"],
    queryFn: getBlueprints,
  });

  const createMutation = useMutation({
    mutationFn: createBlueprint,
    onSuccess: (blueprint) => {
      queryClient.invalidateQueries({ queryKey: ["blueprints"] });
      setCurrentBlueprint({ id: blueprint.id, label: blueprint.title });
      setCreateOpen(false);
      setTitle("");
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

  const pdfMutation = useMutation({
    mutationFn: uploadBlueprintPdf,
    onSuccess: (blueprint) => {
      queryClient.invalidateQueries({ queryKey: ["blueprints"] });
      setCurrentBlueprint({ id: blueprint.id, label: blueprint.title });
      setError(null);
    },
    onError: (mutationError) => setError(extractErrorMessage(mutationError)),
  });

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white/90">
        <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950">Blueprint Management</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Create manual blueprints or upload DOCX/PDF blueprint files. PDF upload currently creates a manual-review shell rather than a complete parsed structure.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
            Create manual blueprint
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {error && (
            <Alert variant="destructive" className="xl:col-span-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">Upload DOCX blueprint</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use backend parsing support for DOCX blueprint files.
            </p>
            <input
              type="file"
              accept=".docx"
              className="mt-4 block w-full text-sm text-slate-600"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  docxMutation.mutate(file);
                }
                event.target.value = "";
              }}
            />
            {docxMutation.isPending && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading DOCX blueprint...
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">Upload PDF blueprint</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              PDF upload is available, but parsed structure may still require manual blueprint review and field creation.
            </p>
            <input
              type="file"
              accept=".pdf"
              className="mt-4 block w-full text-sm text-slate-600"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  pdfMutation.mutate(file);
                }
                event.target.value = "";
              }}
            />
            {pdfMutation.isPending && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading PDF blueprint...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {currentBlueprint && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Current blueprint: <span className="font-medium">{currentBlueprint.label}</span>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Blueprints</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading blueprints...
            </div>
          ) : blueprints.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">No blueprints available yet.</p>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {blueprints.map((blueprint) => {
                const isCurrent = currentBlueprint?.id === blueprint.id;

                return (
                  <Card key={blueprint.id} className="border-slate-200 bg-slate-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base text-slate-950">
                        <span>{blueprint.title}</span>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge value={blueprint.status} />
                          {blueprint.source_type && (
                            <Badge variant="info">{blueprint.source_type}</Badge>
                          )}
                          {isCurrent && <Badge variant="success">Current blueprint</Badge>}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Report type</div>
                          <div className="mt-1 text-sm text-slate-900">{blueprint.report_type ?? "Not available yet"}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Created</div>
                          <div className="mt-1 text-sm text-slate-900">{formatDateTime(blueprint.created_at)}</div>
                        </div>
                      </div>

                      {blueprint.parse_error && (
                        <Alert variant="warning">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Parse error: {blueprint.parse_error}. Review the blueprint detail and add fields manually where needed.
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create manual blueprint</DialogTitle>
          </DialogHeader>

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
              <Label>Report type</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate({ title, report_type: reportType })}
              disabled={!title || createMutation.isPending}
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

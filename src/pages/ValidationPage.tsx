import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUploads } from "../api/uploads";
import { getUploadTables } from "../api/tables";
import { getTemplates } from "../api/templates";
import { runValidation, getValidationByUpload } from "../api/validation";
import { extractErrorMessage } from "../api/client";
import { ValidationSummary } from "../components/validation/ValidationSummary";
import { ValidationIssueList } from "../components/validation/ValidationIssueList";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Loader2, ShieldCheck } from "lucide-react";
import { formatDateTime } from "../utils/formatDate";
import type { ValidationResult } from "../types/validation";

export function ValidationPage() {
  const [uploadId, setUploadId] = useState("");
  const [tableId, setTableId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [opError, setOpError] = useState<string | null>(null);

  const { data: uploads = [] } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["tables", uploadId],
    queryFn: () => getUploadTables(uploadId),
    enabled: !!uploadId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const { data: existingResult, isLoading: loadingExisting } = useQuery({
    queryKey: ["validation", uploadId],
    queryFn: () => getValidationByUpload(uploadId),
    enabled: !!uploadId,
    retry: false,
  });

  const runMut = useMutation({
    mutationFn: () =>
      runValidation({ upload_id: uploadId, template_id: templateId, table_id: tableId }),
    onSuccess: (data) => {
      setResult(data);
      setOpError(null);
    },
    onError: (e) => setOpError(extractErrorMessage(e)),
  });

  const activeResult = result ?? existingResult ?? null;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Validation</h1>
        <p className="text-sm text-gray-500">
          Run financial correctness checks before generating a report.
        </p>
      </div>

      {opError && (
        <Alert variant="destructive">
          <AlertDescription>{opError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Run Validation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Upload</Label>
            <Select value={uploadId} onValueChange={(v) => { setUploadId(v); setResult(null); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select upload..." />
              </SelectTrigger>
              <SelectContent>
                {uploads.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.filename}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Table</Label>
            <Select value={tableId} onValueChange={setTableId} disabled={!uploadId}>
              <SelectTrigger>
                <SelectValue placeholder="Select table..." />
              </SelectTrigger>
              <SelectContent>
                {tables.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.sheet_name} · Table #{t.table_index}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => runMut.mutate()}
        disabled={!uploadId || !tableId || !templateId || runMut.isPending}
      >
        {runMut.isPending ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running validation...</>
        ) : (
          <><ShieldCheck className="h-4 w-4 mr-2" /> Run Validation</>
        )}
      </Button>

      {loadingExisting && !result && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading existing validation results...
        </div>
      )}

      {activeResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Validation Results</h2>
            <span className="text-xs text-gray-400">
              Run at {formatDateTime(activeResult.run_at)}
            </span>
          </div>

          <ValidationSummary result={activeResult} />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Issues ({activeResult.issues.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ValidationIssueList issues={activeResult.issues} uploadId={uploadId} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

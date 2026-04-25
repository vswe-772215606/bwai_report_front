import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUploads } from "../api/uploads";
import { getUploadTables, getTablePreview } from "../api/tables";
import { getTemplates } from "../api/templates";
import { suggestColumnMapping } from "../api/ai";
import { confirmMappings } from "../api/mappings";
import { extractErrorMessage } from "../api/client";
import {
  MappingReviewTable,
  suggestionsToRows,
  type MappingRow,
} from "../components/mapping/MappingReviewTable";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import type { ColumnInfo } from "../types/table";

export function MappingPage() {
  const [uploadId, setUploadId] = useState("");
  const [tableId, setTableId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [rows, setRows] = useState<MappingRow[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [aiRan, setAiRan] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);
  const [opSuccess, setOpSuccess] = useState<string | null>(null);

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

  const { data: preview } = useQuery({
    queryKey: ["table-preview", uploadId, tableId],
    queryFn: () => getTablePreview(uploadId, tableId),
    enabled: !!uploadId && !!tableId,
  });

  useEffect(() => {
    if (preview) {
      setColumns(preview.headers);
    }
  }, [preview]);

  useEffect(() => {
    setTableId("");
    setRows([]);
    setAiRan(false);
    setConfirmed(false);
  }, [uploadId]);

  const aiMut = useMutation({
    mutationFn: () =>
      suggestColumnMapping({ upload_id: uploadId, table_id: tableId, template_id: templateId }),
    onSuccess: (data) => {
      setRows(suggestionsToRows(data.suggestions));
      setAiRan(true);
      setConfirmed(false);
      setOpError(null);
    },
    onError: (e) => setOpError(extractErrorMessage(e)),
  });

  const confirmMut = useMutation({
    mutationFn: () =>
      confirmMappings({
        upload_id: uploadId,
        table_id: tableId,
        template_id: templateId,
        mappings: rows
          .filter((r) => r.source_column)
          .map((r) => ({
            field_key: r.field_key,
            source_sheet: r.source_sheet,
            source_column: r.source_column,
            source_column_index: r.source_column_index,
            aggregation_type: r.aggregation_type,
          })),
      }),
    onSuccess: () => {
      setConfirmed(true);
      setOpSuccess("Mappings confirmed. You may now proceed to validation or report generation.");
      setOpError(null);
    },
    onError: (e) => setOpError(extractErrorMessage(e)),
  });

  const missingRequired = rows.filter((r) => r.required && !r.source_column);
  const lowConfidence = rows.filter((r) => !r.user_overridden && (r.ai_confidence ?? 1) < 0.75 && r.source_column);
  const canConfirm = aiRan && missingRequired.length === 0;

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Column Mapping</h1>
        <p className="text-sm text-gray-500">
          Map Excel columns to template fields. AI suggestions must be manually confirmed.
        </p>
      </div>

      {opError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{opError}</AlertDescription>
        </Alert>
      )}
      {opSuccess && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{opSuccess}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Select Source & Template</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Upload</Label>
            <Select value={uploadId} onValueChange={setUploadId}>
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
            <Label>Raw Table</Label>
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

      <div className="flex items-center gap-3">
        <Button
          onClick={() => aiMut.mutate()}
          disabled={!uploadId || !tableId || !templateId || aiMut.isPending}
        >
          {aiMut.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running AI...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Suggest Mapping with AI</>
          )}
        </Button>

        {aiRan && (
          <p className="text-xs text-gray-500">
            AI suggestions loaded. Review and adjust before confirming.
          </p>
        )}
      </div>

      {aiRan && (
        <>
          {missingRequired.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {missingRequired.length} required field(s) have no mapping:{" "}
                {missingRequired.map((r) => r.field_label).join(", ")}
              </AlertDescription>
            </Alert>
          )}

          {lowConfidence.length > 0 && (
            <Alert variant="warning">
              <AlertDescription>
                {lowConfidence.length} field(s) have low AI confidence (&lt;75%). Please review carefully.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mapping Review</CardTitle>
            </CardHeader>
            <CardContent>
              <MappingReviewTable
                rows={rows}
                availableColumns={columns}
                onChange={setRows}
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => confirmMut.mutate()}
              disabled={!canConfirm || confirmMut.isPending || confirmed}
            >
              {confirmMut.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Confirming...</>
              ) : confirmed ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Confirmed</>
              ) : (
                "Confirm Mappings"
              )}
            </Button>
            {!canConfirm && aiRan && (
              <p className="text-xs text-red-600">
                Resolve all required fields before confirming.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

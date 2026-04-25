import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUpload } from "../api/uploads";
import { getUploadTables, normalizeTable } from "../api/tables";
import { suggestHeaderRow } from "../api/ai";
import { extractErrorMessage } from "../api/client";
import { SheetList } from "../components/tables/SheetList";
import { TableCandidates } from "../components/tables/TableCandidates";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import { formatDateTime } from "../utils/formatDate";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "muted" | "info"> = {
  uploaded: "info",
  parsing: "muted",
  parsed: "success",
  error: "destructive",
  duplicate: "warning",
};

export function UploadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [opError, setOpError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const { data: upload, isLoading: loadingUpload, error: uploadError } = useQuery({
    queryKey: ["upload", id],
    queryFn: () => getUpload(id!),
    enabled: !!id,
  });

  const { data: tables = [], isLoading: loadingTables } = useQuery({
    queryKey: ["tables", id],
    queryFn: () => getUploadTables(id!),
    enabled: !!id,
  });

  const normalizeMut = useMutation({
    mutationFn: (tableId: string) => normalizeTable(tableId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tables", id] });
      setOpError(null);
    },
    onError: (e) => setOpError(extractErrorMessage(e)),
  });

  const aiMut = useMutation({
    mutationFn: (tableId: string) =>
      suggestHeaderRow({ upload_id: id!, table_id: tableId }),
    onSuccess: (data) => {
      setAiSuggestion(
        `AI suggests header row ${data.suggested_header_row} (confidence: ${(data.confidence * 100).toFixed(0)}%). Reasoning: ${data.reasoning}`
      );
    },
    onError: (e) => setOpError(extractErrorMessage(e)),
  });

  if (loadingUpload) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading upload...
      </div>
    );
  }

  if (uploadError || !upload) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{extractErrorMessage(uploadError)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{upload.filename}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{formatDateTime(upload.created_at)}</p>
        </div>
        <Badge variant={statusVariant[upload.status] ?? "muted"} className="text-sm">
          {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
        </Badge>
      </div>

      {upload.duplicate_of && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This file appears to be a duplicate of upload{" "}
            <Link to={`/uploads/${upload.duplicate_of}`} className="underline">
              {upload.duplicate_of}
            </Link>.
          </AlertDescription>
        </Alert>
      )}

      {opError && (
        <Alert variant="destructive">
          <AlertDescription>{opError}</AlertDescription>
        </Alert>
      )}

      {aiSuggestion && (
        <Alert variant="info">
          <AlertDescription>{aiSuggestion}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detected Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <SheetList sheets={upload.sheets ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upload Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sheets</span>
              <span>{upload.sheet_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tables detected</span>
              <span>{upload.table_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Parse status</span>
              <Badge variant={statusVariant[upload.status] ?? "muted"} className="text-xs">
                {upload.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Table Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTables ? (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Detecting tables...
            </div>
          ) : (
            <TableCandidates
              tables={tables}
              selectedId={selectedTableId}
              onSelect={setSelectedTableId}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          asChild
        >
          <Link to={`/table-review/${id}`}>View Tables</Link>
        </Button>

        <Button
          disabled={!selectedTableId || normalizeMut.isPending}
          onClick={() => selectedTableId && normalizeMut.mutate(selectedTableId)}
        >
          {normalizeMut.isPending ? "Normalizing..." : "Normalize Selected Table"}
        </Button>

        <Button
          variant="outline"
          disabled={!selectedTableId || aiMut.isPending}
          onClick={() => selectedTableId && aiMut.mutate(selectedTableId)}
        >
          {aiMut.isPending ? "Running AI..." : "AI Header Suggestion"}
        </Button>
      </div>
    </div>
  );
}

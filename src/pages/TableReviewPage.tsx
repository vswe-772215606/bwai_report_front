import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUploadTables, getTablePreview, confirmTableHeader, normalizeTable } from "../api/tables";
import { extractErrorMessage } from "../api/client";
import { TableCandidates } from "../components/tables/TableCandidates";
import { DataPreviewTable } from "../components/tables/DataPreviewTable";
import { HeaderRowSelector } from "../components/tables/HeaderRowSelector";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import type { RawTable } from "../types/table";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "muted" | "info"> = {
  detected: "muted",
  header_confirmed: "info",
  normalized: "success",
  needs_review: "warning",
};

export function TableReviewPage() {
  const { id: uploadId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [opError, setOpError] = useState<string | null>(null);
  const [opSuccess, setOpSuccess] = useState<string | null>(null);

  const { data: tables = [], isLoading: loadingTables } = useQuery({
    queryKey: ["tables", uploadId],
    queryFn: () => getUploadTables(uploadId!),
    enabled: !!uploadId,
  });

  const selectedTable = tables.find((t: RawTable) => t.id === selectedTableId);

  const { data: preview, isLoading: loadingPreview } = useQuery({
    queryKey: ["table-preview", uploadId, selectedTableId],
    queryFn: () => getTablePreview(uploadId!, selectedTableId!),
    enabled: !!uploadId && !!selectedTableId,
  });

  const confirmHeaderMut = useMutation({
    mutationFn: ({ tableId, row }: { tableId: string; row: number }) =>
      confirmTableHeader(tableId, row),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tables", uploadId] });
      setOpError(null);
      setOpSuccess("Header row confirmed.");
    },
    onError: (e) => { setOpError(extractErrorMessage(e)); setOpSuccess(null); },
  });

  const normalizeMut = useMutation({
    mutationFn: (tableId: string) => normalizeTable(tableId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tables", uploadId] });
      setOpError(null);
      setOpSuccess("Table normalized successfully.");
    },
    onError: (e) => { setOpError(extractErrorMessage(e)); setOpSuccess(null); },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Table Review</h1>
        <p className="text-sm text-gray-500">Select and configure detected tables.</p>
      </div>

      {opError && (
        <Alert variant="destructive">
          <AlertDescription>{opError}</AlertDescription>
        </Alert>
      )}
      {opSuccess && (
        <Alert variant="success">
          <AlertDescription>{opSuccess}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Detected Tables</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTables ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading tables...
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

      {selectedTable && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Table: {selectedTable.sheet_name} #{selectedTable.table_index}
                <Badge variant={statusVariant[selectedTable.status] ?? "muted"}>
                  {selectedTable.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HeaderRowSelector
                currentHeaderRow={selectedTable.confirmed_header_row ?? selectedTable.detected_header_row}
                onConfirm={(row) => confirmHeaderMut.mutate({ tableId: selectedTable.id, row })}
                isLoading={confirmHeaderMut.isPending}
              />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => normalizeMut.mutate(selectedTable.id)}
                  disabled={normalizeMut.isPending || selectedTable.status === "normalized"}
                >
                  {normalizeMut.isPending ? "Normalizing..." : "Normalize Table"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPreview ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading preview...
                </div>
              ) : preview ? (
                <DataPreviewTable preview={preview} />
              ) : (
                <p className="text-sm text-gray-400">No preview available.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

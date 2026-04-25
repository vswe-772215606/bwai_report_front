import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { getUploads, uploadExcel } from "../api/uploads";
import { extractErrorMessage } from "../api/client";
import { ExcelUploadBox } from "../components/upload/ExcelUploadBox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useWorkspaceStore } from "../store/workspaceStore";
import { formatDateTime } from "../utils/formatDate";
import type { Upload } from "../types/upload";

function statusVariant(status: Upload["status"]): "info" | "success" | "destructive" {
  if (status === "parsed") return "success";
  if (status === "failed") return "destructive";
  return "info";
}

export function UploadsListPage() {
  const queryClient = useQueryClient();
  const currentUpload = useWorkspaceStore((state) => state.currentUpload);
  const setCurrentUpload = useWorkspaceStore((state) => state.setCurrentUpload);
  const [error, setError] = useState<string | null>(null);

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadExcel,
    onSuccess: (upload) => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      setCurrentUpload({
        id: upload.id,
        label: upload.original_filename,
      });
      setError(null);
    },
    onError: (uploadError) => setError(extractErrorMessage(uploadError)),
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Workbook Uploads</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Upload raw Excel workbooks, review status and duplicate flags, and set the current workbook that the rest of the workflow should use.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <ExcelUploadBox
              onFile={(file) => uploadMutation.mutate(file)}
              disabled={uploadMutation.isPending}
            />
            {uploadMutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading workbook...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">Current Workspace Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUpload ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Current workbook selected</span>
                </div>
                <p className="mt-2 text-sm text-emerald-900">{currentUpload.label}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <Link to="/workbook-index">Build workbook index</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/extraction">Use in extraction review</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Alert variant="warning">
                <AlertDescription>
                  No workbook is selected yet. Upload one or choose one from the list below.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Previous Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading uploads...
            </div>
          ) : uploads.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">No uploads yet.</p>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload) => {
                const isCurrent = currentUpload?.id === upload.id;

                return (
                  <div
                    key={upload.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-950">
                          {upload.original_filename}
                        </span>
                        <Badge variant={statusVariant(upload.status)}>{upload.status}</Badge>
                        {upload.is_duplicate && (
                          <Badge variant="warning">Duplicate flag</Badge>
                        )}
                        {isCurrent && <Badge variant="success">Current upload</Badge>}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Created {formatDateTime(upload.created_at)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          setCurrentUpload({
                            id: upload.id,
                            label: upload.original_filename,
                          })
                        }
                        className={isCurrent ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : undefined}
                      >
                        {isCurrent ? "Selected" : "Set current"}
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/uploads/${upload.id}`}>Legacy detail</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

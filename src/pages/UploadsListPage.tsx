import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { extractErrorMessage } from "../api/client";
import { getUploads, uploadExcel } from "../api/uploads";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { UploadRecordCard } from "../components/uploads/UploadRecordCard";
import { useWorkspaceStore } from "../store/workspaceStore";

type UploadQueueItem = {
  name: string;
  status: "queued" | "uploading" | "uploaded" | "failed";
  error?: string;
};

function sortUploads<T extends { created_at: string }>(uploads: T[]): T[] {
  return [...uploads].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );
}

export function UploadsListPage() {
  const queryClient = useQueryClient();
  const currentUpload = useWorkspaceStore((state) => state.currentUpload);
  const setCurrentUpload = useWorkspaceStore((state) => state.setCurrentUpload);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadExcel,
  });

  const orderedUploads = useMemo(() => sortUploads(uploads), [uploads]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);
    setError(null);
    setQueue(fileArray.map((file) => ({ name: file.name, status: "queued" })));

    for (const [index, file] of fileArray.entries()) {
      setQueue((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, status: "uploading" } : item
        )
      );

      try {
        const upload = await uploadMutation.mutateAsync(file);
        setCurrentUpload({
          id: upload.id,
          label: upload.original_filename,
        });
        setQueue((current) =>
          current.map((item, itemIndex) =>
            itemIndex === index ? { ...item, status: "uploaded" } : item
          )
        );
      } catch (uploadError) {
        const message = extractErrorMessage(uploadError);
        setQueue((current) =>
          current.map((item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  status: "failed",
                  error: message,
                }
              : item
          )
        );
        setError(message);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["uploads"] });
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Uploads
          </div>
          <CardTitle className="text-2xl text-slate-950">Excel data uploads</CardTitle>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Upload one or many Excel files, inspect detected sheets and tables, and keep the
            current upload available for downstream document runs. This screen stays fast and
            operational on purpose.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-emerald-400 hover:bg-emerald-50">
            <input
              type="file"
              accept=".xlsx,.xls"
              multiple
              className="hidden"
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <div className="text-sm font-semibold text-slate-900">
              Drop Excel files here or click to browse
            </div>
            <div className="mt-2 max-w-xl text-sm text-slate-500">
              The backend accepts one file per request. This screen submits the queue
              sequentially so operations users can process multiple workbooks without leaving the
              page.
            </div>
          </label>

          {queue.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">Current upload queue</div>
              <div className="space-y-2">
                {queue.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2"
                  >
                    <div className="text-sm text-slate-900">{item.name}</div>
                    <div className="flex items-center gap-2 text-xs">
                      {item.status === "uploading" && (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                      )}
                      <span className="uppercase tracking-wide text-slate-500">
                        {item.status}
                      </span>
                    </div>
                    {item.error && <div className="w-full text-xs text-red-600">{item.error}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base text-slate-950">Uploaded workbooks</CardTitle>
          <Button asChild variant="outline" size="sm">
            <a href="#top">Upload more files</a>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading uploads...
            </div>
          ) : orderedUploads.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">No uploads are available yet.</p>
          ) : (
            <div className="space-y-4">
              {orderedUploads.map((upload) => (
                <UploadRecordCard
                  key={upload.id}
                  upload={upload}
                  isCurrent={currentUpload?.id === upload.id}
                  onSetCurrent={() =>
                    setCurrentUpload({
                      id: upload.id,
                      label: upload.original_filename,
                    })
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, createTemplate, uploadDocxTemplate } from "../api/templates";
import { extractErrorMessage } from "../api/client";
import { TemplateList } from "../components/templates/TemplateList";
import { TemplateUploadBox } from "../components/templates/TemplateUploadBox";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Loader2, Plus } from "lucide-react";

export function TemplatesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [docxTemplateId, setDocxTemplateId] = useState<string | null>(null);
  const [docxError, setDocxError] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const createMut = useMutation({
    mutationFn: () => createTemplate({ name, report_type: reportType, description: description || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      setShowCreate(false);
      setName("");
      setReportType("");
      setDescription("");
      setCreateError(null);
    },
    onError: (e) => setCreateError(extractErrorMessage(e)),
  });

  const docxMut = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadDocxTemplate(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      setDocxTemplateId(null);
      setDocxError(null);
    },
    onError: (e) => setDocxError(extractErrorMessage(e)),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500">Manage report templates.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Template
        </Button>
      </div>

      {docxError && (
        <Alert variant="destructive">
          <AlertDescription>{docxError}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400 py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading templates...
        </div>
      ) : (
        <TemplateList templates={templates} />
      )}

      {templates.length > 0 && (
        <div className="border-t pt-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Upload DOCX Template</h2>
          <div className="space-y-3 max-w-sm">
            <div className="space-y-1.5">
              <Label>Select template to attach DOCX to</Label>
              <Select
                value={docxTemplateId ?? ""}
                onValueChange={setDocxTemplateId}
              >
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
            {docxTemplateId && (
              <TemplateUploadBox
                onFile={(file) => docxMut.mutate({ id: docxTemplateId, file })}
                disabled={docxMut.isPending}
              />
            )}
          </div>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {createError && (
              <Alert variant="destructive">
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label>Template Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income_statement">P&L / Income Statement</SelectItem>
                  <SelectItem value="cash_flow">Cash Flow Report</SelectItem>
                  <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                  <SelectItem value="kpi_summary">Management KPI Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={() => createMut.mutate()}
              disabled={createMut.isPending || !name || !reportType}
            >
              {createMut.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

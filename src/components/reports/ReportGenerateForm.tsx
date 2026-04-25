import { useState } from "react";
import type { Upload } from "../../types/upload";
import type { Template } from "../../types/template";
import type { RawTable } from "../../types/table";
import type { ReportOutputFormat } from "../../types/report";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";

interface Props {
  uploads: Upload[];
  templates: Template[];
  tables: RawTable[];
  selectedUploadId: string;
  selectedTableId: string;
  selectedTemplateId: string;
  onUploadChange: (id: string) => void;
  onTableChange: (id: string) => void;
  onTemplateChange: (id: string) => void;
  onGenerate: (format: ReportOutputFormat, name: string) => void;
  isLoading: boolean;
  canGenerate: boolean;
  blockReason?: string;
}

export function ReportGenerateForm({
  uploads,
  templates,
  tables,
  selectedUploadId,
  selectedTableId,
  selectedTemplateId,
  onUploadChange,
  onTableChange,
  onTemplateChange,
  onGenerate,
  isLoading,
  canGenerate,
  blockReason,
}: Props) {
  const [format, setFormat] = useState<ReportOutputFormat>("pdf");
  const [name, setName] = useState("");

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Report Name (optional)</Label>
        <Input
          placeholder="e.g. Q1 2024 Income Statement"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Source Upload</Label>
        <Select value={selectedUploadId} onValueChange={onUploadChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select upload..." />
          </SelectTrigger>
          <SelectContent>
            {uploads.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.filename}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Source Table</Label>
        <Select value={selectedTableId} onValueChange={onTableChange} disabled={!selectedUploadId}>
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
        <Label>Report Template</Label>
        <Select value={selectedTemplateId} onValueChange={onTemplateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select template..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Output Format</Label>
        <Select value={format} onValueChange={(v) => setFormat(v as ReportOutputFormat)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="docx">DOCX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {blockReason && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {blockReason}
        </div>
      )}

      <Button
        onClick={() => onGenerate(format, name)}
        disabled={isLoading || !canGenerate}
        className="w-full sm:w-auto"
      >
        {isLoading ? "Generating..." : "Generate Report"}
      </Button>
    </div>
  );
}

import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import type { Template } from "../../types/template";
import { Badge } from "../ui/badge";
import { formatDate } from "../../utils/formatDate";

const reportTypeLabel: Record<string, string> = {
  income_statement: "P&L / Income Statement",
  cash_flow: "Cash Flow Report",
  balance_sheet: "Balance Sheet",
  kpi_summary: "Management KPI Summary",
};

interface Props {
  templates: Template[];
}

export function TemplateList({ templates }: Props) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No templates yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((t) => (
        <Link key={t.id} to={`/templates/${t.id}`}>
          <div className="rounded-lg border bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer h-full">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-sm font-medium text-gray-800">{t.name}</span>
              </div>
              {t.has_docx && <Badge variant="info" className="text-[10px] shrink-0">DOCX</Badge>}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {reportTypeLabel[t.report_type] ?? t.report_type}
            </p>
            {t.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.description}</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{t.field_count} fields</span>
              <span className="text-xs text-gray-400">{formatDate(t.created_at)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

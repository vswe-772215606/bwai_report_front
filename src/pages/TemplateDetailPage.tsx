import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTemplate, getTemplateFields } from "../api/templates";
import { extractErrorMessage } from "../api/client";
import { TemplateFieldTable } from "../components/templates/TemplateFieldTable";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { formatDate } from "../utils/formatDate";

const reportTypeLabel: Record<string, string> = {
  income_statement: "P&L / Income Statement",
  cash_flow: "Cash Flow Report",
  balance_sheet: "Balance Sheet",
  kpi_summary: "Management KPI Summary",
};

const placeholders = [
  "{{company_name}}",
  "{{reporting_period}}",
  "{{total_revenue}}",
  "{{total_expense}}",
  "{{net_profit}}",
  "{{net_cash_flow}}",
  "{{total_assets}}",
  "{{total_liabilities}}",
  "{{total_equity}}",
];

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: template, isLoading: lt, error: te } = useQuery({
    queryKey: ["template", id],
    queryFn: () => getTemplate(id!),
    enabled: !!id,
  });

  const { data: fields = [], isLoading: lf } = useQuery({
    queryKey: ["template-fields", id],
    queryFn: () => getTemplateFields(id!),
    enabled: !!id,
  });

  if (lt) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-8">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }

  if (te || !template) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{extractErrorMessage(te)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link to="/templates" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to templates
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {reportTypeLabel[template.report_type] ?? template.report_type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {template.has_docx && <Badge variant="info">DOCX attached</Badge>}
            <Badge variant="muted">{template.field_count} fields</Badge>
          </div>
        </div>
        {template.description && (
          <p className="text-sm text-gray-600 mt-2">{template.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">Created {formatDate(template.created_at)}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Template Fields</CardTitle>
        </CardHeader>
        <CardContent>
          {lf ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading fields...
            </div>
          ) : (
            <TemplateFieldTable fields={fields} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Placeholder Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {placeholders.map((p) => (
              <code
                key={p}
                className="text-xs bg-gray-100 text-blue-700 rounded px-2 py-0.5 font-mono"
              >
                {p}
              </code>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            These placeholders can be used in DOCX templates to insert calculated values.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Upload, FileText, BookOpen, ShieldCheck } from "lucide-react";
import { getUploads } from "../api/uploads";
import { getTemplates } from "../api/templates";
import { getReports } from "../api/reports";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function DashboardPage() {
  const { data: uploads = [] } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
  });

  const failedValidations = reports.filter((r) => r.status === "failed").length;

  const stats = [
    {
      label: "Uploaded Files",
      value: uploads.length,
      icon: Upload,
      color: "text-blue-500",
    },
    {
      label: "Templates",
      value: templates.length,
      icon: FileText,
      color: "text-purple-500",
    },
    {
      label: "Generated Reports",
      value: reports.filter((r) => r.status === "generated").length,
      icon: BookOpen,
      color: "text-green-500",
    },
    {
      label: "Failed / Issues",
      value: failedValidations,
      icon: ShieldCheck,
      color: failedValidations > 0 ? "text-red-500" : "text-gray-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your financial reporting activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/uploads/new">
              <Upload className="h-4 w-4 mr-2" />
              Upload Excel
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/templates">
              <FileText className="h-4 w-4 mr-2" />
              Manage Templates
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/generate">
              <BookOpen className="h-4 w-4 mr-2" />
              Generate Report
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {uploads.length === 0 ? (
              <p className="text-sm text-gray-400">No uploads yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {uploads.slice(0, 5).map((u) => (
                  <li key={u.id}>
                    <Link
                      to={`/uploads/${u.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {u.filename}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-sm text-gray-400">No reports yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {reports.slice(0, 5).map((r) => (
                  <li key={r.id} className="text-sm text-gray-700">
                    {r.name} <span className="text-xs text-gray-400">({r.status})</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

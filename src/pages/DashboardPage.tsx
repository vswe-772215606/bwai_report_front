import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useWorkspaceStore } from "../store/workspaceStore";

const workflowSteps = [
  {
    title: "Upload workbook",
    description: "Bring raw financial spreadsheets into the workspace and choose the current workbook.",
    href: "/uploads",
  },
  {
    title: "Build workbook index",
    description: "Generate indexed sheet summaries, table summaries, row label candidates, and column profiles.",
    href: "/workbook-index",
  },
  {
    title: "Create or upload blueprint",
    description: "Define report blueprint shells manually or upload DOCX/PDF blueprint files for review.",
    href: "/blueprints",
  },
  {
    title: "Run extraction",
    description: "Create an extraction run for the selected workbook and blueprint, optionally using the latest workbook index.",
    href: "/extraction",
  },
];

function SelectionCard({
  title,
  value,
}: {
  title: string;
  value: string | null | undefined;
}) {
  return (
    <Card className="border-slate-200 bg-white/90">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-slate-900">{value ?? "Not selected"}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const currentUpload = useWorkspaceStore((state) => state.currentUpload);
  const currentBlueprint = useWorkspaceStore((state) => state.currentBlueprint);
  const currentIndexRun = useWorkspaceStore((state) => state.currentIndexRun);
  const currentExtractionRun = useWorkspaceStore((state) => state.currentExtractionRun);

  const completedCount = [
    currentUpload,
    currentIndexRun,
    currentBlueprint,
    currentExtractionRun,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#134e4a_100%)] text-white">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
              Finance Operations Workflow
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight">
              Turn inconsistent financial spreadsheets into validated, report-ready outputs.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
              Review detected workbook content, create blueprints, run AI-assisted extraction, and select the best evidence per field. The current backend supports candidate review workflows, not final automated report reconstruction.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="success" className="bg-emerald-300 text-slate-950">
                AI-assisted
              </Badge>
              <Badge variant="info" className="bg-sky-300 text-slate-950">
                Review required
              </Badge>
              <Badge variant="muted" className="bg-white/10 text-white">
                Blueprint-driven extraction
              </Badge>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-medium text-slate-100">Workspace Progress</div>
            <div className="mt-2 text-4xl font-semibold">{completedCount}/4</div>
            <p className="mt-2 text-sm text-slate-300">
              Current workspace selections determine which upload, blueprint, index run, and extraction run the review screens operate on.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-slate-950 hover:bg-slate-100">
                <Link to="/uploads">Start with uploads</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link to="/extraction">Open extraction review</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectionCard title="Current Upload" value={currentUpload?.label} />
        <SelectionCard title="Current Blueprint" value={currentBlueprint?.label} />
        <SelectionCard title="Current Index Run" value={currentIndexRun?.label} />
        <SelectionCard title="Current Extraction Run" value={currentExtractionRun?.label} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {workflowSteps.map((step, index) => (
          <Card key={step.title} className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base text-slate-950">
                <span>{index + 1}. {step.title}</span>
                <Button asChild size="sm" variant="outline">
                  <Link to={step.href}>Open</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-600">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useAuthStore } from "../../store/authStore";
import { useWorkspaceStore } from "../../store/workspaceStore";

function WorkspacePill({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-md border bg-white px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-gray-800">{value ?? "Not selected"}</div>
    </div>
  );
}

export function Header() {
  const user = useAuthStore((state) => state.user);
  const currentUpload = useWorkspaceStore((state) => state.currentUpload);
  const currentBlueprint = useWorkspaceStore((state) => state.currentBlueprint);
  const currentIndexRun = useWorkspaceStore((state) => state.currentIndexRun);
  const currentExtractionRun = useWorkspaceStore((state) => state.currentExtractionRun);

  return (
    <header className="border-b bg-white/90 backdrop-blur">
      <div className="flex flex-col gap-4 px-6 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Financial Report Preparation Workspace
          </div>
          <h1 className="mt-1 text-lg font-semibold text-slate-950">
            Reviewable workbook indexing and blueprint-driven extraction
          </h1>
        </div>

        <div className="text-sm text-slate-600">{user?.email ?? ""}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t bg-slate-50 px-6 py-4 md:grid-cols-2 2xl:grid-cols-4">
        <WorkspacePill label="Current Upload" value={currentUpload?.label} />
        <WorkspacePill label="Current Blueprint" value={currentBlueprint?.label} />
        <WorkspacePill label="Current Index Run" value={currentIndexRun?.label} />
        <WorkspacePill label="Current Extraction Run" value={currentExtractionRun?.label} />
      </div>
    </header>
  );
}

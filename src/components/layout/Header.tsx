import { useAuthStore } from "../../store/authStore";
import { useWorkspaceStore } from "../../store/workspaceStore";

function WorkspacePill({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-slate-900">
        {value ?? "Tanlanmagan"}
      </div>
    </div>
  );
}

export function Header() {
  const user = useAuthStore((state) => state.user);
  const currentUpload = useWorkspaceStore((state) => state.currentUpload);
  const currentBlueprint = useWorkspaceStore((state) => state.currentBlueprint);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Bosh panel
          </div>
          <h1 className="mt-1 text-lg font-semibold text-slate-950">
            Moliya hujjatlarini avtomatik to'ldirish tizimi
          </h1>
        </div>
        <div className="text-sm text-slate-600">{user?.email ?? ""}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 md:grid-cols-2">
        <WorkspacePill label="Joriy fayl" value={currentUpload?.label} />
        <WorkspacePill label="Joriy shablon" value={currentBlueprint?.label} />
      </div>
    </header>
  );
}

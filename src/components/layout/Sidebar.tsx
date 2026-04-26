import { NavLink } from "react-router-dom";
import {
  Bot,
  Boxes,
  Clock3,
  FileSpreadsheet,
  LayoutDashboard,
  Library,
  LogOut,
  FileText,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useWorkspaceStore } from "../../store/workspaceStore";

const primaryNav = [
  { to: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { to: "/uploads", label: "Ma'lumot fayllari", icon: FileSpreadsheet },
  { to: "/blueprints", label: "Shablonlar", icon: FileText },
  { to: "/document-ai-jobs", label: "Avtomatik to'ldirish", icon: Bot },
  { to: "/controlled-batches", label: "Hujjat yaratish", icon: Boxes },
  { to: "/history", label: "Amallar tarixi", icon: Clock3 },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const clearWorkspace = useWorkspaceStore((state) => state.clearWorkspace);

  return (
    <aside className="w-full shrink-0 border-b border-slate-800 bg-slate-950 text-slate-100 xl:min-h-screen xl:w-72 xl:border-b-0 xl:border-r">
      <div className="border-b border-slate-800 px-5 py-6">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">
          Moliya hujjatlari
        </div>
        <div className="mt-2 text-lg font-semibold text-white">
          Hujjat avtomatizatsiyasi
        </div>
      </div>

      <nav className="overflow-x-auto px-3 py-4">
        <div className="flex gap-2 xl:flex-col">
          {primaryNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex min-w-fit items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-800 px-3 py-4">
        <NavLink
          to="/document-types"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
        >
          <Library className="h-4 w-4 shrink-0" />
          Hujjat turlari
        </NavLink>

        <button
          onClick={() => {
            clearWorkspace();
            logout();
          }}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Rows3,
  FileText,
  SearchCheck,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useWorkspaceStore } from "../../store/workspaceStore";

const primaryNav = [
  { to: "/dashboard", label: "Workspace", icon: LayoutDashboard },
  { to: "/uploads", label: "Uploads", icon: Upload },
  { to: "/workbook-index", label: "Workbook Index", icon: Rows3 },
  { to: "/blueprints", label: "Blueprints", icon: FileText },
  { to: "/extraction", label: "Extraction Review", icon: SearchCheck },
];

const legacyNav = [
  { to: "/templates", label: "Legacy Templates" },
  { to: "/mapping", label: "Legacy Mapping" },
  { to: "/validation", label: "Legacy Validation" },
  { to: "/generate", label: "Legacy Reports" },
  { to: "/reports", label: "Report History" },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const clearWorkspace = useWorkspaceStore((state) => state.clearWorkspace);

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-6">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
          Finance Ops Console
        </div>
        <div className="mt-2 text-lg font-semibold text-white">SQB Financial</div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Upload raw workbooks, build a workbook index, review extraction candidates, and prepare report-ready outputs.
        </p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {primaryNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
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

        <div className="mt-8">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Legacy Routes
          </div>
          <div className="mt-2 space-y-1">
            {legacyNav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-slate-800 px-3 py-4">
        <button
          onClick={() => {
            clearWorkspace();
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

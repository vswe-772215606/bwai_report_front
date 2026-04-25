import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileText,
  GitMerge,
  ShieldCheck,
  FilePlus2,
  BookOpen,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/uploads", label: "Uploads", icon: Upload },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/mapping", label: "Mapping", icon: GitMerge },
  { to: "/validation", label: "Validation", icon: ShieldCheck },
  { to: "/generate", label: "Generate Report", icon: FilePlus2 },
  { to: "/reports", label: "Reports", icon: BookOpen },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-gray-900 text-gray-100 shrink-0">
      <div className="px-4 py-5 border-b border-gray-700">
        <span className="text-sm font-bold tracking-wide text-white">SQB Financial</span>
        <p className="text-xs text-gray-400 mt-0.5">Report Builder</p>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

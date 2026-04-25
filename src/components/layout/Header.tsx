import { useAuthStore } from "../../store/authStore";

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-12 border-b bg-white flex items-center justify-end px-6 shrink-0">
      <span className="text-sm text-gray-500">{user?.email ?? ""}</span>
    </header>
  );
}

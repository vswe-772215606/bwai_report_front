import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { getMe } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

export function AppLayout() {
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);

  const { data: me } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (me) {
      setUser(me);
    }
  }, [me, setUser]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faf7_0%,#edf2f7_100%)] xl:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

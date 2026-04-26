import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getMe, login, register } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { extractErrorMessage } from "../api/client";
import { mapErrorToUzbek } from "../utils/errorMessages";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function RegisterPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Parollar mos kelmadi.");
      return;
    }

    if (password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setLoading(true);

    try {
      await register({ email, password });
      const tokenResponse = await login({ email, password });
      localStorage.setItem("access_token", tokenResponse.access_token);
      const me = await getMe();
      setSession(tokenResponse.access_token, me);
      navigate("/dashboard");
    } catch (submissionError) {
      setError(mapErrorToUzbek(extractErrorMessage(submissionError)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#bfdbfe_0%,#f8fafc_38%,#e2e8f0_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-2xl backdrop-blur">
        <div className="hidden w-1/2 flex-col justify-between bg-[linear-gradient(160deg,#0f172a_0%,#1d4ed8_58%,#0f766e_100%)] p-10 text-slate-100 lg:flex">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200">
              Yangi hisob
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight">
              Moliya va HR hujjatlarini avtomatlashtiring.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-200">
              Ro'yxatdan o'tgandan so'ng, Excel fayllar asosida hujjat yaratishni
              darhol boshlashingiz mumkin.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-sm leading-7 text-slate-100">
            Hujjat yaratish, avtomatik to'ldirish va natijalarni yuklab olish —
            barchasi bir joyda.
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                Ro'yxatdan o'tish
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Yangi hisob yaratish
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ma'lumotlaringizni kiriting va tizimga kiring.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Elektron pochta</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Parolni tasdiqlang</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-400"
                disabled={loading}
              >
                {loading ? "Yuklanmoqda..." : "Ro'yxatdan o'tish"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              Hisobingiz bormi?{" "}
              <Link to="/login" className="font-medium text-sky-700 hover:text-sky-600">
                Kirish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

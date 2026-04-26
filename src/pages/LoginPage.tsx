import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { getMe, login } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { extractErrorMessage } from "../api/client";
import { mapErrorToUzbek } from "../utils/errorMessages";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const sessionExpired = searchParams.get("expired") === "1";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f99d_0%,#f8fafc_30%,#dbeafe_100%)] px-4 py-6 lg:py-10">
      <div className="mx-auto grid min-h-[88vh] max-w-7xl overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden bg-[linear-gradient(145deg,#052e2b_0%,#0f172a_40%,#0b5d51_100%)] p-6 text-slate-100 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.28),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.18),transparent_30%)]" />

          <div className="relative flex h-full flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100">
              <Building2 className="h-3.5 w-3.5" />
              Bank va investorlar uchun
            </div>

            <div className="mt-6 max-w-2xl">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Moliyaviy hujjatlarni investor darajasidagi tezlik, nazorat va aniqlik bilan tayyorlang.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                Platforma Excel ma&apos;lumotlarini tartiblaydi, blueprint asosida tekshiradi va
                AI-assisted jarayon orqali bank investorlari ko&apos;radigan hujjatlarni tezroq
                tayyorlashga yordam beradi.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Nazorat
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-100">
                  AI tavsiyalari doim foydalanuvchi tekshiruvi bilan yakunlanadi.
                </p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sky-200">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Tezlik
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-100">
                  Qo&apos;lda hujjat tayyorlash vaqtini qisqartirib, jamoa throughputini oshiradi.
                </p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-amber-200">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Tayyor natija
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-100">
                  DOCX, PDF va ZIP ko&apos;rinishidagi yakuniy paketlarni bir joyda boshqaring.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <BarChart3 className="h-4 w-4 text-emerald-200" />
                  Investorlar uchun asosiy signal
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-black/15 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
                      Standartlashtirish
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-100">
                      Turli formatdagi Excel fayllarni bir xil moliyaviy struktura bilan
                      ishlashga keltiradi.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/15 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
                      Audit izi
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-100">
                      Extraction candidate, status va yuklab olish tarixi orqali qaror jarayoni
                      kuzatiladi.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/15 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
                      Review workflow
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-100">
                      Final natijadan oldin maydonlar, blueprint va AI tanlovlari tekshiriladi.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/15 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
                      Tayyor paket
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-100">
                      Kredit, investitsiya yoki ichki risk jamoalari uchun hujjatlar tez
                      yig&apos;iladi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-emerald-300/18 bg-emerald-400/8 p-5 backdrop-blur-sm">
                <div className="text-sm font-semibold text-white">
                  Jarayon qanday ishlaydi
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/12 text-xs font-semibold text-white">
                      1
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        Ma&apos;lumotni yuklang
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-200">
                        Excel workbook, Word shablon yoki mavjud hujjat manbasini kiriting.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/12 text-xs font-semibold text-white">
                      2
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        Blueprint va AI yordamida tekshiring
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-200">
                        Tizim extraction candidate&apos;larni beradi, jamoa esa kerakli variantni
                        tasdiqlaydi.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/12 text-xs font-semibold text-white">
                      3
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        Investor-ready paketni oling
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-200">
                        Tayyor hujjatlarni ZIP arxiv sifatida yuklab olib, ko&apos;rib chiqishga
                        yuboring.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/12 bg-slate-950/20 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    Nima uchun muhim
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                      Tarqoq moliyaviy ma&apos;lumotlarni bitta boshqariladigan oqimga yig&apos;adi.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                      Qaror qabul qiluvchi jamoalar uchun ko&apos;rish, tekshirish va eksportni soddalashtiradi.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                      Qo&apos;lda takrorlanadigan tayyorlov ishlarini kamaytiradi.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-6 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                Kirish
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Tizimga kirish
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hisobingizga kirish uchun ma&apos;lumotlaringizni kiriting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {sessionExpired && !error && (
                <Alert variant="warning">
                  <AlertDescription>
                    Sessiya tugadi. Iltimos, qayta kiring.
                  </AlertDescription>
                </Alert>
              )}

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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                disabled={loading}
              >
                {loading ? "Yuklanmoqda..." : "Kirish"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              Hisobingiz yo&apos;qmi?{" "}
              <Link to="/register" className="font-medium text-emerald-700 hover:text-emerald-600">
                Ro&apos;yxatdan o&apos;ting
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

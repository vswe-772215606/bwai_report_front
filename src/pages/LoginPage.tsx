import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, getMe } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { extractErrorMessage } from "../api/client";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await login({ email, password });
      localStorage.setItem("access_token", token.access_token);
      const me = await getMe();
      setSession(token.access_token, me);
      navigate("/dashboard");
    } catch (submissionError) {
      setError(extractErrorMessage(submissionError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d1fae5_0%,#f8fafc_42%,#e2e8f0_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-2xl backdrop-blur">
        <div className="hidden w-1/2 flex-col justify-between bg-slate-950 p-10 text-slate-100 lg:flex">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">
              Finance Ops Console
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight">
              Prepare financial reports from inconsistent spreadsheets with structured review.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Upload raw workbooks, build a workbook index, create blueprints, run AI-assisted extraction, and review candidate evidence before anything becomes report-ready.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              From messy Excel to structured data
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              AI-assisted, user-controlled mapping and extraction review
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              Built-in financial validation and repeatable reporting workflows
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                Sign In
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Access the workspace</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use your account to continue workbook indexing, blueprint review, and extraction candidate selection.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              Need an account?{" "}
              <Link to="/register" className="font-medium text-emerald-700 hover:text-emerald-600">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

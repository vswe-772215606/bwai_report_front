import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, login, getMe } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { extractErrorMessage } from "../api/client";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register({ email, password });
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_38%,#e2e8f0_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-2xl backdrop-blur">
        <div className="hidden w-1/2 flex-col justify-between bg-slate-950 p-10 text-slate-100 lg:flex">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300">
              Report Workflow
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight">
              Create an account for workbook indexing, blueprint review, and extraction candidate selection.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              This product is a financial report preparation workspace, not a chat assistant or general dashboard. The UI is optimized for reviewability and traceable evidence.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm leading-7 text-slate-300">
            Turn inconsistent financial spreadsheets into validated, report-ready outputs. Review detected tables, confirm blueprints, run extraction, and inspect evidence with confidence.
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                Register
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registration creates your account, then the app signs you in using the current backend auth flow.
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
              </div>

              <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-400" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              Already registered?{" "}
              <Link to="/login" className="font-medium text-sky-700 hover:text-sky-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

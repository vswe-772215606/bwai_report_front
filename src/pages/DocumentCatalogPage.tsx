import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, Layers3, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { getDocumentTypes } from "../api/documentCatalog";
import { extractErrorMessage } from "../api/client";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

function getDomainLabel(value: string) {
  return value === "finance" ? "Moliya" : value === "hr" ? "HR" : value;
}

export function DocumentCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const domain = searchParams.get("domain") ?? "finance";
  const batchOnly = searchParams.get("batch") === "true";

  const { data: documentTypes = [], isLoading, error } = useQuery({
    queryKey: ["document-catalog", domain, batchOnly],
    queryFn: () =>
      getDocumentTypes({
        domain,
        supports_batch_generation: batchOnly ? true : undefined,
      }),
  });

  const counts = useMemo(
    () => ({
      finance: documentTypes.filter((item) => item.document_domain === "finance").length,
      hr: documentTypes.filter((item) => item.document_domain === "hr").length,
      batch: documentTypes.filter((item) => item.supports_batch_generation).length,
    }),
    [documentTypes]
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-white">
        <CardHeader className="relative gap-6 overflow-hidden bg-[linear-gradient(135deg,#ecfdf5_0%,#f8fafc_42%,#dbeafe_100%)] lg:flex-row lg:items-start lg:justify-between">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              <Layers3 className="h-3.5 w-3.5" />
              Hujjat turlari
            </div>
            <CardTitle className="mt-4 text-3xl leading-tight text-slate-950">
              Moliya oqimiga mos hujjat turini tanlang va nazorat qilinadigan ish jarayonini boshlang
            </CardTitle>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Bu bo&apos;lim backend qo&apos;llab-quvvatlaydigan haqiqiy hujjat turlarini ko&apos;rsatadi.
              Asosiy yo&apos;nalish moliya hujjatlari bo&apos;lib, HR turlari ham mavjud. Maqsad
              umumiy katalog emas, balki review talab qiladigan, takrorlanadigan va boshqariladigan
              hujjat oqimini tezroq boshlashdir.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Building2 className="h-4 w-4 text-emerald-700" />
                  Moliya birinchi o&apos;rinda
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Asosiy ish oqimi bank, investor va ichki moliya jamoalari ehtiyojiga moslanadi.
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-sky-700" />
                  Nazorat saqlanadi
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Hujjat turi, blueprint va ommaviy yaratish imkoniyati oldindan ko&apos;rinadi.
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Tez start
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Mos tur tanlang, blueprint yarating va nazoratli batch oqimiga o&apos;ting.
                </p>
              </div>
            </div>
          </div>

          <div className="relative grid min-w-[240px] gap-3 rounded-3xl border border-white/70 bg-white/75 p-5 text-sm text-slate-700 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Katalog ko&apos;rsatkichi
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-emerald-700">Moliya turlari</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-900">{counts.finance}</div>
            </div>
            <div className="rounded-2xl bg-sky-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-sky-700">HR turlari</div>
              <div className="mt-1 text-2xl font-semibold text-sky-900">{counts.hr}</div>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-amber-700">
                Ommaviy yaratish mumkin
              </div>
              <div className="mt-1 text-2xl font-semibold text-amber-900">{counts.batch}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Filtrlar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {["finance", "hr"].map((value) => (
            <Button
              key={value}
              variant={domain === value ? "default" : "outline"}
              className={domain === value ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : ""}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("domain", value);
                setSearchParams(next);
              }}
            >
              {value === "finance" ? "Moliya" : "HR"}
            </Button>
          ))}

          <label className="ml-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={batchOnly}
              onChange={(event) => {
                const next = new URLSearchParams(searchParams);
                if (event.target.checked) {
                  next.set("batch", "true");
                } else {
                  next.delete("batch");
                }
                setSearchParams(next);
              }}
            />
            Faqat ommaviy yaratish mumkin bo&apos;lgan turlar
          </label>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{extractErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Mavjud hujjat turlari</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Hujjat turlari yuklanmoqda...
            </div>
          ) : documentTypes.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">
              Joriy filtrlar bo&apos;yicha mos hujjat turi topilmadi.
            </p>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {documentTypes.map((item) => (
                <Card key={item.id} className="border-slate-200 bg-slate-50">
                  <CardHeader>
                    <CardTitle className="flex flex-wrap items-center gap-2 text-base text-slate-950">
                      <span>{item.title}</span>
                      <Badge variant={item.document_domain === "finance" ? "success" : "info"}>
                        {getDomainLabel(item.document_domain)}
                      </Badge>
                      {item.supports_batch_generation && (
                        <Badge variant="muted">Ommaviy yaratish mumkin</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-slate-600">
                      {item.description ?? "Backend tomondan tavsif kiritilmagan."}
                    </div>
                    <div className="font-mono text-xs text-slate-500">{item.document_type}</div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link
                          to={`/blueprints?documentType=${encodeURIComponent(
                            item.document_type
                          )}&documentDomain=${encodeURIComponent(item.document_domain)}`}
                        >
                          Blueprint yaratish
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link
                          to={`/controlled-batches?documentType=${encodeURIComponent(
                            item.document_type
                          )}`}
                        >
                          Nazoratli batchni boshlash
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

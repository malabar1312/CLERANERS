"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatEur } from "@/lib/booking/pricing";
import type { CleanerAanvraag } from "./aanvragen-view";
import type { CleanerStats } from "./overview";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

/** Status con cobro efectivo (cuentan para ingresos). */
const PAID_STATUSES = new Set(["paid", "accepted", "in_progress", "completed", "reviewed"]);

export function EarningsView({
  aanvragen = [],
  stats,
}: {
  aanvragen?: CleanerAanvraag[];
  stats: CleanerStats;
}) {
  const t = useTranslations("dashboard.cleaner.earnings");
  const locale = useLocale();

  // Chart (últimos 6 meses) + top clientes derivados de SUS aanvragen reales.
  const { chart, topClients, hasData } = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: d.toLocaleDateString(locale === "en" ? "en-US" : "nl-NL", { month: "short" }),
        cobros: 0,
      };
    });
    const idxByKey = new Map(months.map((m, i) => [m.key, i]));
    const clientCents = new Map<string, number>();
    let any = false;

    for (const a of aanvragen) {
      if (!PAID_STATUSES.has(a.status) || !a.amountCents || !a.scheduledDate) continue;
      any = true;
      const d = new Date(`${a.scheduledDate}T00:00:00`);
      const idx = idxByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (idx != null) months[idx]!.cobros += Math.round(a.amountCents / 100);
      clientCents.set(a.clientName, (clientCents.get(a.clientName) ?? 0) + a.amountCents);
    }

    const top = [...clientCents.entries()]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 3)
      .map(([name, cents]) => ({ name, cents }));

    return { chart: months, topClients: top, hasData: any };
  }, [aanvragen, locale]);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      key="earnings"
      className="w-full"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          {t("title")}
        </h2>
      </div>

      {/* Ingresos del mes (real) + Top clientes (real / vacío) */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col justify-center rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
            {t("monthRevenue")}
          </p>
          <h3 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            {formatEur(stats.revenueMonthCents)}
          </h3>
          <p className="mt-3 text-xs text-[var(--color-slate)]">
            {t("completedThisPeriod", { count: stats.completedCount })}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-bold text-[var(--color-ink)]">
            {t("topClients")}
          </h3>
          {topClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                <Users className="h-6 w-6 text-[var(--color-muted)]" />
              </div>
              <p className="text-sm text-[var(--color-slate)]">{t("noClientsYet")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {topClients.map((c) => (
                <div
                  key={c.name}
                  className="flex flex-col items-center rounded-xl border border-[var(--color-line)] p-4 text-center"
                >
                  <div className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-sm font-bold text-[var(--color-ink)]">
                    {c.name.charAt(0)}
                  </div>
                  <p className="text-sm font-bold text-[var(--color-ink)]">{c.name}</p>
                  <p className="font-display text-lg font-bold text-[var(--color-blue)]">
                    {formatEur(c.cents)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Evolución (real, 6 meses) + Saldo (Connect, binnenkort) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
          <h3 className="mb-6 font-display text-lg font-bold text-[var(--color-ink)]">
            {t("monthlyEvolution")}
          </h3>
          {hasData ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-line)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--color-slate)" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--color-slate)" }}
                    tickFormatter={(v) => `€${v}`}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-surface-2)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--color-line)",
                      boxShadow: "var(--shadow-ambient)",
                    }}
                  />
                  <Bar dataKey="cobros" fill="var(--color-blue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[250px] flex-col items-center justify-center text-center">
              <p className="text-sm text-[var(--color-slate)]">{t("noEarningsYet")}</p>
            </div>
          )}
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)] p-6 text-white shadow-xl">
          <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-[var(--color-muted-2)]">
              {t("availableFunds")}
            </p>
            <h3 className="mb-4 font-display text-4xl font-bold text-white sm:text-5xl">
              {formatEur(0)}
            </h3>
            <p className="text-xs text-[var(--color-muted-2)]">{t("payoutsSoon")}</p>
          </div>
          <button
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-xl bg-white/90 py-3 text-sm font-bold text-[var(--color-ink)] opacity-60 shadow-lg"
          >
            {t("withdraw")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const MOCK_DATA = [
  { name: "Jan", cobros: 820 },
  { name: "Feb", cobros: 980 },
  { name: "Mrt", cobros: 1140 },
  { name: "Apr", cobros: 1100 },
  { name: "Mei", cobros: 1240 },
  { name: "Jun", cobros: 1380 },
];

const TOP_CLIENTS = [
  { n: "Anna K.", type: "Dieptereiniging", val: "€320" },
  { n: "Jeroen B.", type: "Onderhoud", val: "€280" },
  { n: "BedrijfXYZ", type: "Kantoor", val: "€190" },
];

export function EarningsView() {
  const t = useTranslations("dashboard.cleaner.earnings");

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      key="earnings"
      className="w-full"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-6">
        <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          {t("title")}
        </h2>
        <div className="flex gap-2">
          <button className="rounded-lg bg-[var(--color-surface-2)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-3)]">
            {t("week")}
          </button>
          <button className="rounded-lg bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-xs)] transition-colors hover:bg-[var(--color-blue)]">
            {t("month")}
          </button>
          <button className="rounded-lg bg-[var(--color-surface-2)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-3)]">
            {t("year")}
          </button>
        </div>
      </div>

      {/* Goal + Top Clients */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] flex flex-col justify-center">
          <p className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wider mb-4">
            {t("monthlyGoal")}
          </p>
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
              €1.240
            </h3>
            <p className="text-sm font-bold text-[var(--color-slate)]">
              / €1.500
            </p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "82%" }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-[var(--color-blue)]"
            />
          </div>
          <p className="mt-3 text-xs text-[var(--color-slate)] flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
            {t("ofGoal", { pct: "82" })}
          </p>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-4">
            {t("topClients")}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TOP_CLIENTS.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--color-line)] p-4 flex flex-col items-center text-center"
              >
                <div className="flex h-10 w-10 mb-2 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-sm font-bold text-[var(--color-ink)]">
                  {c.n.charAt(0)}
                </div>
                <p className="font-bold text-sm text-[var(--color-ink)]">
                  {c.n}
                </p>
                <p className="text-xs text-[var(--color-slate)] mb-2">
                  {c.type}
                </p>
                <p className="font-display font-bold text-[var(--color-blue)] text-lg">
                  {c.val}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart + Available Balance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-6">
            {t("monthlyEvolution")}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_DATA}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-line)"
                />
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
                <Bar
                  dataKey="cobros"
                  fill="var(--color-blue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)] p-6 shadow-xl flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div>
            <p className="text-sm font-medium text-[var(--color-muted-2)] uppercase tracking-wider mb-2">
              {t("availableFunds")}
            </p>
            <h3 className="font-display text-4xl font-bold text-white mb-4 sm:text-5xl">
              €450,00
            </h3>
            <p className="text-xs text-[var(--color-muted-2)]">
              {t("nextPayout", { date: "Vrijdag 22" })}
            </p>
          </div>
          <button className="w-full py-3 rounded-xl bg-white text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors shadow-lg mt-4">
            {t("withdraw")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

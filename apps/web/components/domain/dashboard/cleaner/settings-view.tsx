"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { User, Bell, Lock, CreditCard, Camera, ShieldCheck } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export function SettingsView({
  profile,
}: {
  profile: { first_name: string };
}) {
  const t = useTranslations("dashboard.cleaner.settings");
  const [settingsTab, setSettingsTab] = useState("profile");
  const [toggles, setToggles] = useState({
    newBooking: true,
    messages: true,
    reminders: false,
    marketing: false,
  });

  const tabs = [
    { id: "profile", label: t("profile"), icon: User },
    { id: "notifications", label: t("notifications"), icon: Bell },
    { id: "security", label: t("security"), icon: Lock },
    { id: "billing", label: t("billing"), icon: CreditCard },
  ];

  const notificationItems = [
    {
      id: "newBooking",
      title: t("newBookings"),
      desc: t("newBookingsDesc"),
    },
    {
      id: "messages",
      title: t("directMessages"),
      desc: t("directMessagesDesc"),
    },
    {
      id: "reminders",
      title: t("reminders"),
      desc: t("remindersDesc"),
    },
    {
      id: "marketing",
      title: t("offersMarketing"),
      desc: t("offersMarketingDesc"),
    },
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      key="settings"
      className="w-full"
    >
      <h2 className="mb-8 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        {t("title")}
      </h2>
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar tabs */}
        <aside className="w-full md:w-60 shrink-0">
          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSettingsTab(id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  settingsTab === id
                    ? "bg-[var(--color-ink)] text-white shadow-[var(--shadow-xs)]"
                    : "text-[var(--color-slate)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {settingsTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                key="profile"
                className="space-y-6"
              >
                {/* Photo */}
                <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <div className="relative">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-soft)] text-2xl font-bold text-[var(--color-blue)] sm:h-24 sm:w-24 sm:text-3xl">
                      {profile.first_name.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[var(--color-ink)] p-1.5 text-white shadow-[var(--shadow-xs)] hover:bg-[var(--color-blue)] transition-colors sm:p-2">
                      <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                      {t("profilePhoto")}
                    </h3>
                    <p className="text-sm text-[var(--color-slate)] mb-3">
                      {t("photoRecommend")}
                    </p>
                    <div className="flex gap-3 justify-center sm:justify-start">
                      <button className="rounded-lg border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface-2)]">
                        {t("uploadNew")}
                      </button>
                      <button className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]">
                        {t("delete")}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
                  <h3 className="mb-6 font-display text-lg font-bold text-[var(--color-ink)]">
                    {t("personalInfo")}
                  </h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[
                      { label: t("firstName"), defaultVal: profile.first_name, type: "text" },
                      { label: t("lastName"), defaultVal: "Jansen", type: "text" },
                      { label: t("email"), defaultVal: "pro@cleaners.nl", type: "email" },
                      { label: t("phone"), defaultVal: "+31 6 1234 5678", type: "tel" },
                    ].map((field) => (
                      <div key={field.label} className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          defaultValue={field.defaultVal}
                          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-all focus:border-[var(--color-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/20 focus:shadow-[0_0_0_4px_rgba(0,102,255,0.08)]"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                        {t("aboutMe")}
                      </label>
                      <textarea
                        rows={4}
                        className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-ink)] transition-all focus:border-[var(--color-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/20 focus:shadow-[0_0_0_4px_rgba(0,102,255,0.08)]"
                        defaultValue="Specialist in ramenwas en delicate vloerenbehandeling met meer dan 5 jaar ervaring."
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end gap-3">
                    <button className="rounded-xl px-5 py-2.5 text-sm font-bold text-[var(--color-slate)] hover:bg-[var(--color-surface-2)]">
                      {t("discard")}
                    </button>
                    <button className="rounded-xl bg-[var(--color-blue)] px-6 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-xs)] hover:bg-[var(--color-blue-2)] transition-colors">
                      {t("saveChanges")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {settingsTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                key="notifications"
                className="space-y-6"
              >
                <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
                  <h3 className="mb-2 font-display text-lg font-bold text-[var(--color-ink)]">
                    {t("alertPrefs")}
                  </h3>
                  <p className="mb-6 text-sm text-[var(--color-slate)]">
                    {t("alertsDesc")}
                  </p>
                  <div className="space-y-6">
                    {notificationItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="pr-4">
                          <h4 className="font-bold text-sm text-[var(--color-ink)]">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[var(--color-slate)] mt-1">
                            {item.desc}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setToggles({
                              ...toggles,
                              [item.id]:
                                !toggles[item.id as keyof typeof toggles],
                            })
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                            toggles[item.id as keyof typeof toggles]
                              ? "bg-[var(--color-success)]"
                              : "bg-[var(--color-surface-3)]"
                          }`}
                          role="switch"
                          aria-checked={
                            toggles[item.id as keyof typeof toggles]
                          }
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                              toggles[item.id as keyof typeof toggles]
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-end border-t border-[var(--color-line)] pt-6">
                    <button className="rounded-xl bg-[var(--color-blue)] px-6 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-xs)] hover:bg-[var(--color-blue-2)] transition-colors">
                      {t("updatePrefs")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {(settingsTab === "security" || settingsTab === "billing") && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                key="placeholder"
                className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-line)] border-dashed bg-[var(--color-surface)] py-20 text-center"
              >
                <ShieldCheck className="mb-4 h-12 w-12 text-[var(--color-muted)]" />
                <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                  {t("moduleDev")}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] max-w-[250px]">
                  {t("moduleDevDesc")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  User,
  MapPin,
  FileText,
  Euro,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  Globe,
  AlertCircle,
} from "lucide-react";
import {
  AMSTERDAM_HOODS,
  CLEANER_SPECIALTIES,
  CLEANER_LANGUAGES,
  createCleanerProfileAction,
} from "@/app/[locale]/_actions/cleaner-profile";
import { cn } from "@/lib/utils";

const STEPS = ["profile", "details", "pricing"] as const;
type Step = (typeof STEPS)[number];

const stepIcons = {
  profile: User,
  details: FileText,
  pricing: Euro,
} as const;

const fadeSlide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

const inputCls =
  "w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] px-4 py-3 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition-all duration-200 focus:border-[var(--color-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/25";

export function CleanerWizard({
  userName,
}: {
  userName: string;
}) {
  const t = useTranslations("onboarding.cleaner");
  const router = useRouter();

  const [step, setStep] = useState<Step>("profile");
  const [direction, setDirection] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(userName);
  const [hood, setHood] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["Nederlands"]);
  const [pricePerHour, setPricePerHour] = useState(24);

  const stepIdx = STEPS.indexOf(step);
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;

  const goNext = () => {
    const next = STEPS[stepIdx + 1];
    if (!isLast && next) {
      setDirection(1);
      setStep(next);
      setError(null);
    }
  };

  const goBack = () => {
    const prev = STEPS[stepIdx - 1];
    if (!isFirst && prev) {
      setDirection(-1);
      setStep(prev);
      setError(null);
    }
  };

  // Step validation
  const isStepValid = (s: Step): boolean => {
    switch (s) {
      case "profile":
        return name.trim().length >= 2 && hood.length > 0;
      case "details":
        return bio.trim().length >= 20 && specialties.length >= 1 && languages.length >= 1;
      case "pricing":
        return pricePerHour >= 15 && pricePerHour <= 80;
    }
  };

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 8 ? [...prev, s] : prev,
    );
  };

  const toggleLanguage = (l: string) => {
    setLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : prev.length < 6 ? [...prev, l] : prev,
    );
  };

  const handleSubmit = () => {
    if (!isStepValid("pricing")) return;

    startTransition(async () => {
      setError(null);

      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("hood", hood);
      formData.set("pricePerHour", String(pricePerHour));
      formData.set("bio", bio.trim());
      specialties.forEach((s) => formData.append("specialties", s));
      languages.forEach((l) => formData.append("languages", l));

      const result = await createCleanerProfileAction(formData);

      if (result.ok) {
        // Success → redirect to profile or dashboard
        router.push(`/schoonmakers/${result.slug}`);
      } else {
        switch (result.error) {
          case "already_exists":
            setError(t("errorAlreadyExists"));
            break;
          case "not_cleaner":
            setError(t("errorNotCleaner"));
            break;
          case "unauthenticated":
            router.push("/login");
            break;
          default:
            setError(t("errorGeneric"));
        }
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress steps */}
      <nav className="mb-10 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = stepIcons[s];
          const isCurrent = s === step;
          const isDone = i < stepIdx;
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={cn(
                    "h-px w-8 transition-colors sm:w-12",
                    isDone ? "bg-[var(--color-blue)]" : "bg-[var(--color-line)]",
                  )}
                />
              )}
              <button
                type="button"
                disabled={i > stepIdx}
                onClick={() => {
                  const target = STEPS[i];
                  if (i < stepIdx && target) {
                    setDirection(-1);
                    setStep(target);
                  }
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                  isCurrent && "bg-[var(--color-blue)] text-white shadow-[var(--shadow-blue)]",
                  isDone && "bg-[var(--color-blue)]/10 text-[var(--color-blue)]",
                  !isCurrent && !isDone && "bg-[var(--color-surface-2)] text-[var(--color-muted)]",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={fadeSlide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {step === "profile" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
                  {t("step1Title")}
                </h2>
                <p className="mt-2 text-[var(--color-muted)]">{t("step1Lead")}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-ink)]">
                    {t("labelName")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("placeholderName")}
                    className={inputCls}
                    maxLength={120}
                  />
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{t("hintName")}</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-ink)]">
                    <MapPin className="mr-1.5 inline h-4 w-4 text-[var(--color-blue)]" />
                    {t("labelHood")}
                  </label>
                  <select
                    value={hood}
                    onChange={(e) => setHood(e.target.value)}
                    className={cn(inputCls, "appearance-none")}
                  >
                    <option value="">{t("placeholderHood")}</option>
                    {AMSTERDAM_HOODS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{t("hintHood")}</p>
                </div>
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
                  {t("step2Title")}
                </h2>
                <p className="mt-2 text-[var(--color-muted)]">{t("step2Lead")}</p>
              </div>

              <div className="space-y-5">
                {/* Bio */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-ink)]">
                    <FileText className="mr-1.5 inline h-4 w-4 text-[var(--color-blue)]" />
                    {t("labelBio")}
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder={t("placeholderBio")}
                    className={cn(inputCls, "resize-none")}
                  />
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {bio.length}/1000 · {t("hintBio")}
                  </p>
                </div>

                {/* Specialties */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                    <Sparkles className="mr-1.5 inline h-4 w-4 text-[var(--color-blue)]" />
                    {t("labelSpecialties")} ({specialties.length}/8)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CLEANER_SPECIALTIES.map((s) => {
                      const selected = specialties.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSpecialty(s)}
                          className={cn(
                            "rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                            selected
                              ? "border-[var(--color-blue)] bg-[var(--color-blue)]/10 text-[var(--color-blue)]"
                              : "border-[var(--color-line)] bg-[var(--color-white)] text-[var(--color-slate)] hover:border-[var(--color-blue)]/40",
                          )}
                        >
                          {selected && <Check className="mr-1 inline h-3 w-3" />}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                    <Globe className="mr-1.5 inline h-4 w-4 text-[var(--color-blue)]" />
                    {t("labelLanguages")} ({languages.length}/6)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CLEANER_LANGUAGES.map((l) => {
                      const selected = languages.includes(l);
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => toggleLanguage(l)}
                          className={cn(
                            "rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                            selected
                              ? "border-[var(--color-blue)] bg-[var(--color-blue)]/10 text-[var(--color-blue)]"
                              : "border-[var(--color-line)] bg-[var(--color-white)] text-[var(--color-slate)] hover:border-[var(--color-blue)]/40",
                          )}
                        >
                          {selected && <Check className="mr-1 inline h-3 w-3" />}
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "pricing" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
                  {t("step3Title")}
                </h2>
                <p className="mt-2 text-[var(--color-muted)]">{t("step3Lead")}</p>
              </div>

              {/* Price selector */}
              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-soft)]">
                <label className="mb-4 block text-sm font-semibold text-[var(--color-ink)]">
                  <Euro className="mr-1.5 inline h-4 w-4 text-[var(--color-blue)]" />
                  {t("labelPrice")}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={15}
                    max={80}
                    step={1}
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(Number(e.target.value))}
                    className="h-2 flex-1 appearance-none rounded-full bg-[var(--color-surface-2)] accent-[var(--color-blue)]"
                  />
                  <div className="flex h-14 w-24 items-center justify-center rounded-2xl border border-[var(--color-blue)] bg-[var(--color-blue)]/5 text-center">
                    <span className="font-display text-2xl font-bold text-[var(--color-blue)]">
                      €{pricePerHour}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-[var(--color-muted)]">
                  <span>€15</span>
                  <span>{t("hintPriceAvg")}</span>
                  <span>€80</span>
                </div>
              </div>

              {/* Earnings preview */}
              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
                  {t("earningsPreview")}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-display text-xl font-bold text-[var(--color-ink)]">
                      €{Math.round(pricePerHour * 0.85)}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">{t("netPerHour")}</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-[var(--color-ink)]">
                      €{Math.round(pricePerHour * 0.85 * 20)}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">{t("perWeek20h")}</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-[var(--color-ink)]">
                      €{Math.round(pricePerHour * 0.85 * 80).toLocaleString("nl-NL")}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">{t("perMonth")}</p>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs text-[var(--color-muted)]">
                  {t("earningsNote")}
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-soft)]">
                <h3 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">
                  {t("reviewTitle")}
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-muted)]">{t("labelName")}</dt>
                    <dd className="font-medium text-[var(--color-ink)]">{name || "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-muted)]">{t("labelHood")}</dt>
                    <dd className="font-medium text-[var(--color-ink)]">{hood || "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-muted)]">{t("labelPrice")}</dt>
                    <dd className="font-medium text-[var(--color-blue)]">€{pricePerHour}/u</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-muted)]">{t("labelSpecialties")}</dt>
                    <dd className="text-right font-medium text-[var(--color-ink)]">
                      {specialties.length > 0 ? specialties.slice(0, 3).join(", ") + (specialties.length > 3 ? ` +${specialties.length - 3}` : "") : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-muted)]">{t("labelLanguages")}</dt>
                    <dd className="font-medium text-[var(--color-ink)]">
                      {languages.join(", ") || "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={isFirst}
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all",
            isFirst
              ? "invisible"
              : "border border-[var(--color-line)] bg-[var(--color-white)] text-[var(--color-ink)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !isStepValid(step)}
            className="flex items-center gap-2 rounded-full bg-[var(--color-blue)] px-8 py-3 text-sm font-bold text-white shadow-[var(--shadow-blue)] transition-all hover:bg-[var(--color-blue-2)] disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isPending ? t("submitting") : t("submit")}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!isStepValid(step)}
            className="flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-8 py-3 text-sm font-bold text-white shadow-[var(--shadow-xs)] transition-all hover:bg-[var(--color-ink)]/90 disabled:opacity-50"
          >
            {t("next")}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

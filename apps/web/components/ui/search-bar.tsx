"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Calendar, Clock, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const LOCATIONS = [
  "Amsterdam Centrum",
  "Amsterdam Zuid",
  "Amsterdam West",
  "Amsterdam Oost",
  "Amsterdam Noord",
  "De Pijp",
  "Jordaan",
];

const TIMES = [
  "Flexibel",
  "Ochtend (08:00 - 12:00)",
  "Middag (12:00 - 17:00)",
  "Avond (17:00 - 20:00)",
];

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"location" | "date" | "time" | null>(null);
  
  // States
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("Flexibel");

  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentMonth(new Date());
  }, []);

  // Click outside / Escape to close active tab
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveTab(null);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveTab(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* Teclado: Enter/Space abren el panel del campo (los campos fecha/hora no son inputs) */
  const fieldKeyDown = (tab: "date" | "time") => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  const filteredLocations = LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(location.toLowerCase())
  );

  // Calendar logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert to Monday=0, Sunday=6
  };

  const daysInMonth = currentMonth ? getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) : 0;
  const firstDay = currentMonth ? getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) : 0;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDay }, (_, i) => i);
  const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

  /* La búsqueda navega al listado con el contexto en la URL.
     "Amsterdam X" → hood "X" (los hoods del catálogo no llevan prefijo);
     el listado valida contra el catálogo real antes de aplicar el filtro. */
  const handleSearch = () => {
    const params = new URLSearchParams();
    const hood = location.trim().replace(/^amsterdam\s+/i, "");
    if (hood) params.set("hood", hood);
    if (date) {
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      params.set("date", iso);
    }
    if (time && time !== "Flexibel") params.set("time", time);
    const qs = params.toString();
    router.push(`/schoonmakers${qs ? `?${qs}` : ""}`);
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    }
  };
  
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      <motion.div
        initial={compact ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
        className={cn(
          "relative z-20 flex flex-col items-center justify-between backdrop-blur-xl transition-all duration-300 sm:flex-row",
          compact
            ? "h-14 flex-row rounded-full border border-black/10 bg-white p-1.5 shadow-[0_8px_28px_rgba(10,10,10,0.14)] hover:shadow-[0_10px_36px_rgba(10,10,10,0.2)]"
            : "rounded-3xl border border-white/25 bg-white/85 p-2 shadow-[0_16px_48px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_64px_rgba(0,0,0,0.45)] sm:h-20 sm:rounded-full",
        )}
      >
        {/* Separators (desktop only) */}
        <div className={cn("absolute left-[38%] hidden w-px bg-black/10 sm:block", compact ? "inset-y-3" : "inset-y-4")} />
        <div className={cn("absolute left-[68%] hidden w-px bg-black/10 sm:block", compact ? "inset-y-3" : "inset-y-4")} />

        {/* --- Location --- */}
        <div
          className={cn(
            "group relative flex w-full flex-1 cursor-text items-center rounded-full transition-colors hover:bg-white/50 sm:h-full",
            compact ? "h-full gap-2 px-4 py-0 hover:bg-black/[0.04]" : "gap-3 px-6 py-3 sm:py-0",
            activeTab === "location" && "bg-white shadow-md ring-1 ring-black/5"
          )}
          onClick={() => setActiveTab("location")}
        >
          <div className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-black/5 text-[var(--color-blue)] transition-colors group-hover:bg-black/10",
            compact ? "h-8 w-8" : "h-10 w-10",
          )}>
            <MapPin className={compact ? "h-4 w-4" : "h-5 w-5"} />
          </div>
          <div className="flex w-full flex-col text-left">
            <label htmlFor={compact ? "location-input-compact" : "location-input"} className={cn("text-xs font-bold tracking-wider text-black/90 uppercase cursor-text", compact && "sr-only")}>Waar</label>
            <input
              id={compact ? "location-input-compact" : "location-input"}
              type="text"
              placeholder="Amsterdam Centrum"
              className="w-full bg-transparent p-0 text-sm font-medium text-black outline-none placeholder:text-black/30"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setActiveTab("location")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
          </div>

          {/* Location Dropdown */}
          <AnimatePresence>
            {activeTab === "location" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 top-[110%] w-full sm:w-[320px] rounded-2xl border border-black/5 bg-white p-2 shadow-2xl z-50"
              >
                <div className="max-h-60 overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setLocation(loc);
                          setActiveTab("date"); // auto advance
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-black/5"
                      >
                        <MapPin className="h-4 w-4 text-black/40" />
                        <span className="text-sm font-medium text-black/80">{loc}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-black/40">Geen resultaten gevonden</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={cn("h-px w-full bg-black/5 sm:hidden", compact && "hidden")} />

        {/* --- Date --- */}
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={activeTab === "date"}
          className={cn(
            "group relative flex w-full flex-1 cursor-pointer items-center rounded-full transition-colors hover:bg-white/50 sm:h-full",
            compact ? "h-full gap-2 px-4 py-0 hover:bg-black/[0.04]" : "gap-3 px-6 py-3 sm:py-0",
            activeTab === "date" && "bg-white shadow-md ring-1 ring-black/5"
          )}
          onClick={() => setActiveTab("date")}
          onKeyDown={fieldKeyDown("date")}
        >
          <div className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-black/5 text-[var(--color-blue)] transition-colors group-hover:bg-black/10",
            compact ? "h-8 w-8" : "h-10 w-10",
          )}>
            <Calendar className={compact ? "h-4 w-4" : "h-5 w-5"} />
          </div>
          <div className="flex w-full flex-col text-left">
            <span className={cn("text-xs font-bold tracking-wider text-black/90 uppercase", compact && "sr-only")}>Wanneer</span>
            <div className={cn("text-sm font-medium", date ? "text-black" : "text-black/30")}>
              {mounted && date ? date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : "Kies datum"}
            </div>
          </div>

          {/* Custom Date Picker Dropdown */}
          <AnimatePresence>
            {mounted && currentMonth && activeTab === "date" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-1/2 top-[110%] w-[340px] -translate-x-1/2 rounded-3xl border border-black/5 bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl z-50 sm:left-0 sm:translate-x-0"
              >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <button onClick={prevMonth} type="button" className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5">
                    <ChevronLeft className="h-4 w-4 text-black/70" />
                  </button>
                  <span className="text-sm font-bold text-black/90 capitalize">
                    {currentMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={nextMonth} type="button" className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5">
                    <ChevronRight className="h-4 w-4 text-black/70" />
                  </button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-black/40">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {blankDays.map(blank => (
                    <div key={`blank-${blank}`} className="h-10 w-10" />
                  ))}
                  {daysArray.map(day => {
                    const isSelected = date?.getDate() === day && date?.getMonth() === currentMonth.getMonth() && date?.getFullYear() === currentMonth.getFullYear();
                    const isPast = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < new Date(new Date().setHours(0,0,0,0));
                    
                    return (
                      <button
                        key={day}
                        disabled={isPast}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                          setActiveTab("time"); // auto advance
                        }}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all",
                          isPast ? "text-black/20 cursor-not-allowed" : "cursor-pointer hover:bg-black/5 text-black/80",
                          isSelected && "bg-[var(--color-blue)] text-white font-bold shadow-md hover:bg-[var(--color-blue-2)]"
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={cn("h-px w-full bg-black/5 sm:hidden", compact && "hidden")} />

        {/* --- Time --- */}
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={activeTab === "time"}
          className={cn(
            "group relative flex cursor-pointer items-center rounded-full transition-colors hover:bg-white/50 sm:h-full",
            compact
              ? "hidden h-full w-[140px] flex-none gap-2 px-4 py-0 hover:bg-black/[0.04] md:flex"
              : "w-[140px] flex-none gap-3 px-6 py-3 sm:w-[160px] sm:py-0",
            activeTab === "time" && "bg-white shadow-md ring-1 ring-black/5"
          )}
          onClick={() => setActiveTab("time")}
          onKeyDown={fieldKeyDown("time")}
        >
          <div className="flex w-full flex-col text-left">
            <span className={cn("text-xs font-bold tracking-wider text-black/90 uppercase", compact && "sr-only")}>Hoe laat</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black truncate">{time}</span>
              <ChevronDown className="h-3 w-3 text-black/40" />
            </div>
          </div>

          {/* Time Dropdown */}
          <AnimatePresence>
            {activeTab === "time" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-[110%] w-[240px] rounded-2xl border border-black/5 bg-white p-2 shadow-2xl z-50"
              >
                {TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTime(t);
                      setActiveTab(null);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-black/5"
                  >
                    <span className={cn("text-sm font-medium", time === t ? "text-[var(--color-blue)]" : "text-black/80")}>
                      {t}
                    </span>
                    {time === t && <Clock className="h-4 w-4 text-[var(--color-blue)]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Search Button --- */}
        <div className={cn("w-full sm:w-auto", compact ? "mt-0 w-auto pl-1.5" : "mt-2 sm:mt-0 sm:pl-2")}>
          <button
            type="button"
            aria-label="Zoeken"
            onClick={handleSearch}
            className={cn(
              "flex items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[var(--color-blue-2)] hover:shadow-xl",
              compact ? "h-11 w-11 px-0" : "h-14 w-full px-8 sm:h-16",
            )}
          >
            <Search className="h-5 w-5" aria-hidden />
            {!compact && <span className="sm:hidden">Zoeken</span>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

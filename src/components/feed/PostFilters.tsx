"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "ID_CARDS", label: "ID Cards" },
  { value: "BOOKS", label: "Books & Study Material" },
  { value: "KEYS", label: "Keys" },
  { value: "BAGS", label: "Bags & Backpacks" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "WALLET", label: "Wallets & Purses" },
  { value: "OTHER", label: "Other" },
];

const LOCATIONS = [
  { value: "", label: "All Locations" },
  { value: "LIBRARY", label: "Central Library" },
  { value: "CANTEEN", label: "Campus Canteen" },
  { value: "BLOCK_A", label: "Block A" },
  { value: "BLOCK_B", label: "Block B" },
  { value: "BLOCK_C", label: "Block C" },
  { value: "SPORTS_GROUND", label: "Sports Ground" },
  { value: "AUDITORIUM", label: "Main Auditorium" },
  { value: "HOSTEL_BOYS", label: "Boys Hostel" },
  { value: "HOSTEL_GIRLS", label: "Girls Hostel" },
  { value: "MAIN_GATE", label: "Main Gate" },
  { value: "PARKING", label: "Parking Area" },
  { value: "OTHER", label: "Other Area" },
];

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "CLAIM_IN_PROGRESS", label: "Claim in Progress" },
  { value: "RETURNED", label: "Returned" },
  { value: "CLOSED", label: "Closed" },
];

export function PostFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentStatus = searchParams.get("status") || "";

  const hasActiveFilters = Boolean(
    currentType || currentCategory || currentLocation || currentStatus
  );

  const activeFilterCount = [
    Boolean(currentType),
    Boolean(currentCategory),
    Boolean(currentLocation),
    Boolean(currentStatus),
  ].filter(Boolean).length;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("cursor");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    params.delete("category");
    params.delete("location");
    params.delete("status");
    params.delete("cursor");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-3">
      {/* Row 1 on mobile: Type pill toggles & Clear button */}
      <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
        <div className="inline-flex rounded-full border-2 sm:border-2.5 border-ink bg-surface p-0.5 sm:p-1 shadow-hard-sm sm:shadow-hard-btn">
          <button
            onClick={() => updateParam("type", "")}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition ${
              !currentType ? "bg-ink text-paper" : "text-ink hover:bg-paper"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => updateParam("type", "LOST")}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition ${
              currentType === "LOST"
                ? "bg-yellow text-ink border-2 border-ink"
                : "text-ink hover:bg-paper"
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => updateParam("type", "FOUND")}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition ${
              currentType === "FOUND"
                ? "bg-sage text-ink border-2 border-ink"
                : "text-ink hover:bg-paper"
            }`}
          >
            Found
          </button>
        </div>

        {/* Clear button on mobile */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="sm:hidden inline-flex items-center gap-1 text-xs font-bold text-coral bg-coral/10 hover:bg-coral hover:text-white border-2 border-coral px-2.5 py-1 rounded-full shadow-hard-sm transition shrink-0"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* Row 2 on mobile / inline on desktop: Dropdowns in horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible sm:flex-wrap py-0.5">
        {/* Category selector */}
        <div className="relative shrink-0">
          <select
            value={currentCategory}
            onChange={(e) => updateParam("category", e.target.value)}
            className={`appearance-none pl-3 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full sm:rounded-input border-2 sm:border-2.5 border-ink cursor-pointer shadow-hard-sm sm:shadow-hard-btn transition focus:outline-none focus:ring-2 focus:ring-sky ${
              currentCategory
                ? "bg-ink text-paper"
                : "bg-surface text-ink hover:bg-paper"
            }`}
          >
            {CATEGORIES.map((c) => (
              <option
                key={c.value}
                value={c.value}
                className="bg-surface text-ink font-normal"
              >
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 stroke-[2.5] ${
              currentCategory ? "text-paper" : "text-ink"
            }`}
          />
        </div>

        {/* Location selector */}
        <div className="relative shrink-0">
          <select
            value={currentLocation}
            onChange={(e) => updateParam("location", e.target.value)}
            className={`appearance-none pl-3 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full sm:rounded-input border-2 sm:border-2.5 border-ink cursor-pointer shadow-hard-sm sm:shadow-hard-btn transition focus:outline-none focus:ring-2 focus:ring-sky ${
              currentLocation
                ? "bg-ink text-paper"
                : "bg-surface text-ink hover:bg-paper"
            }`}
          >
            {LOCATIONS.map((l) => (
              <option
                key={l.value}
                value={l.value}
                className="bg-surface text-ink font-normal"
              >
                {l.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 stroke-[2.5] ${
              currentLocation ? "text-paper" : "text-ink"
            }`}
          />
        </div>

        {/* Status selector */}
        <div className="relative shrink-0">
          <select
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value)}
            className={`appearance-none pl-3 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full sm:rounded-input border-2 sm:border-2.5 border-ink cursor-pointer shadow-hard-sm sm:shadow-hard-btn transition focus:outline-none focus:ring-2 focus:ring-sky ${
              currentStatus
                ? "bg-ink text-paper"
                : "bg-surface text-ink hover:bg-paper"
            }`}
          >
            {STATUSES.map((s) => (
              <option
                key={s.value}
                value={s.value}
                className="bg-surface text-ink font-normal"
              >
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 stroke-[2.5] ${
              currentStatus ? "text-paper" : "text-ink"
            }`}
          />
        </div>

        {/* Reset button shown at end of filter row on desktop */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-coral bg-coral/10 hover:bg-coral hover:text-white border-2 border-coral px-3 py-1.5 rounded-full shadow-hard-sm transition shrink-0"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Reset filters ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}

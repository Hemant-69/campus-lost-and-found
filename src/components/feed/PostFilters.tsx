"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

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
  { value: "", label: "All Campus Locations" },
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

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Type pill toggles */}
      <div className="inline-flex rounded-full border-2.5 border-ink bg-surface p-1 shadow-hard-btn">
        <button
          onClick={() => updateParam("type", "")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
            !currentType ? "bg-ink text-paper" : "text-ink hover:bg-paper"
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => updateParam("type", "LOST")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
            currentType === "LOST" ? "bg-yellow text-ink border-2 border-ink" : "text-ink hover:bg-paper"
          }`}
        >
          Lost
        </button>
        <button
          onClick={() => updateParam("type", "FOUND")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
            currentType === "FOUND" ? "bg-sage text-ink border-2 border-ink" : "text-ink hover:bg-paper"
          }`}
        >
          Found
        </button>
      </div>

      {/* Category selector */}
      <select
        value={currentCategory}
        onChange={(e) => updateParam("category", e.target.value)}
        className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-surface border-2.5 border-ink rounded-input text-ink shadow-hard-btn min-h-[44px] focus:outline-none focus:ring-2 focus:ring-sky"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {/* Location selector */}
      <select
        value={currentLocation}
        onChange={(e) => updateParam("location", e.target.value)}
        className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-surface border-2.5 border-ink rounded-input text-ink shadow-hard-btn min-h-[44px] focus:outline-none focus:ring-2 focus:ring-sky"
      >
        {LOCATIONS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      {/* Status selector */}
      <select
        value={currentStatus}
        onChange={(e) => updateParam("status", e.target.value)}
        className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-surface border-2.5 border-ink rounded-input text-ink shadow-hard-btn min-h-[44px] focus:outline-none focus:ring-2 focus:ring-sky"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

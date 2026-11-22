"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const [term, setTerm] = useState(initialSearch);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        params.set("search", term.trim());
      } else {
        params.delete("search");
      }
      params.delete("cursor");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(handler);
  }, [term, router, pathname, searchParams]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink pointer-events-none stroke-[2.5]" />
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search items, keywords, or campus spots..."
        className="w-full pl-10 pr-10 min-h-[42px] sm:min-h-[48px] text-xs sm:text-base font-medium bg-surface border-2 sm:border-2.5 border-ink rounded-input placeholder:text-ink-soft/60 text-ink shadow-hard-sm sm:shadow-hard-btn focus:outline-none focus:ring-2 focus:ring-sky transition"
      />
      {term && (
        <button
          onClick={() => setTerm("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink hover:text-coral p-1 rounded-sm transition"
          aria-label="Clear search"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}

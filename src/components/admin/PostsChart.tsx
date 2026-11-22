"use client";

import React from "react";

export function PostsChart({
  data,
}: {
  data: { date: string; lost: number; found: number }[];
}) {
  const maxVal = Math.max(1, ...data.map((d) => d.lost + d.found));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-ink text-lg">Weekly Activity</h3>
          <p className="text-xs text-ink-soft">Items posted over the past 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-ink">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-yellow border border-ink inline-block" />
            <span>Lost</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-sage border border-ink inline-block" />
            <span>Found</span>
          </div>
        </div>
      </div>

      <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b-2 border-paper">
        {data.map((d) => {
          const lostHeight = (d.lost / maxVal) * 100;
          const foundHeight = (d.found / maxVal) * 100;
          const dayName = new Date(d.date).toLocaleDateString(undefined, {
            weekday: "short",
          });

          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full max-w-[28px] flex flex-col items-center gap-1 h-full justify-end">
                {d.found > 0 && (
                  <div
                    style={{ height: `${foundHeight}%` }}
                    className="w-full bg-sage border border-ink rounded-t-xs transition-all duration-300 min-h-[4px]"
                    title={`Found: ${d.found}`}
                  />
                )}
                {d.lost > 0 && (
                  <div
                    style={{ height: `${lostHeight}%` }}
                    className="w-full bg-yellow border border-ink rounded-t-xs transition-all duration-300 min-h-[4px]"
                    title={`Lost: ${d.lost}`}
                  />
                )}
                {d.lost === 0 && d.found === 0 && (
                  <div className="w-full h-1.5 bg-paper rounded-full border border-ink/40" />
                )}
              </div>
              <span className="text-xs font-semibold text-ink-soft truncate">
                {dayName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

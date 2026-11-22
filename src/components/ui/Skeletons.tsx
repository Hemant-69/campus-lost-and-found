import React from "react";

export function PostCardSkeleton() {
  return (
    <div className="bg-surface rounded-card border-2.5 border-ink overflow-hidden shadow-hard-card animate-pulse">
      <div className="aspect-square sm:aspect-[4/3] bg-[#EADFC8] border-b-2.5 border-ink" />
      <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-3">
        <div className="h-3 sm:h-4 bg-[#EADFC8] rounded w-1/3" />
        <div className="h-4 sm:h-6 bg-[#EADFC8] rounded w-4/5" />
        <div className="h-3 sm:h-3.5 bg-[#EADFC8] rounded w-2/3" />
        <div className="hidden sm:flex pt-2 border-t-2 border-ink/10 justify-between">
          <div className="h-3 bg-[#EADFC8] rounded w-1/4" />
          <div className="h-3 bg-[#EADFC8] rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="aspect-[16/9] bg-[#EADFC8] rounded-card border-2.5 border-ink shadow-hard-card" />
      <div className="bg-surface rounded-card border-2.5 border-ink p-6 shadow-hard-card space-y-4">
        <div className="h-8 bg-[#EADFC8] rounded w-2/3" />
        <div className="h-4 bg-[#EADFC8] rounded w-1/3" />
        <div className="h-20 bg-[#EADFC8] rounded" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b-2 border-ink/20">
      <td className="p-4"><div className="h-4 bg-[#EADFC8] rounded w-24" /></td>
      <td className="p-4"><div className="h-4 bg-[#EADFC8] rounded w-32" /></td>
      <td className="p-4"><div className="h-4 bg-[#EADFC8] rounded w-16" /></td>
      <td className="p-4"><div className="h-4 bg-[#EADFC8] rounded w-20" /></td>
      <td className="p-4"><div className="h-8 bg-[#EADFC8] rounded w-16" /></td>
    </tr>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="p-5 rounded-card border-2.5 border-ink bg-surface shadow-hard-card animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 bg-[#EADFC8] rounded w-24" />
        <div className="w-8 h-8 rounded-full bg-[#EADFC8] border-1.5 border-ink/20" />
      </div>
      <div className="h-8 bg-[#EADFC8] rounded w-12" />
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface rounded-card border-2.5 border-ink overflow-hidden shadow-hard-card animate-pulse">
      <div className="p-4 bg-paper border-b-2.5 border-ink flex items-center justify-between">
        <div className="h-5 bg-[#EADFC8] rounded w-48" />
        <div className="h-8 bg-[#EADFC8] rounded w-28" />
      </div>
      <div className="divide-y-2 divide-paper">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-[#EADFC8] rounded w-1/3" />
              <div className="h-3 bg-[#EADFC8] rounded w-1/4" />
            </div>
            <div className="h-4 bg-[#EADFC8] rounded w-24 hidden sm:block" />
            <div className="h-8 bg-[#EADFC8] rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-9 bg-[#EADFC8] rounded-card w-64 border-2 border-ink/10" />
      <div className="h-4 bg-[#EADFC8] rounded w-96 max-w-full" />
    </div>
  );
}

export function ListItemSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-surface rounded-card border-2.5 border-ink shadow-hard-btn flex items-center justify-between gap-4"
        >
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-[#EADFC8] rounded w-2/5" />
            <div className="h-3 bg-[#EADFC8] rounded w-3/5" />
          </div>
          <div className="h-8 bg-[#EADFC8] rounded w-16" />
        </div>
      ))}
    </div>
  );
}

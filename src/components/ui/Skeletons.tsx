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

import React from "react";
import { Loader2, Pin } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-yellow border-2.5 border-ink flex items-center justify-center shadow-hard-btn animate-bounce">
          <Pin className="w-7 h-7 text-ink -rotate-45 fill-coral stroke-ink" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-ink font-serif font-bold text-lg">
        <Loader2 className="w-4 h-4 animate-spin text-coral stroke-[3]" />
        <span>Loading...</span>
      </div>
      <p className="font-hand text-sm text-coral -mt-2">Pinning notice to board...</p>
    </div>
  );
}

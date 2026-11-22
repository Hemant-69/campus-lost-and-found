import { Database, AlertTriangle, HardDrive } from "lucide-react";
import { formatByteSize } from "@/lib/imageCompress";

export function StorageMetricCard({
  totalBytes,
  totalCount,
  freeTierLimitBytes = 500 * 1024 * 1024, // 500 MB typical Neon free tier limit
}: {
  totalBytes: number;
  totalCount: number;
  freeTierLimitBytes?: number;
}) {
  const percentage = Math.min(100, Math.round((totalBytes / freeTierLimitBytes) * 100));
  const isNearLimit = percentage >= 80;

  return (
    <div className="bg-surface rounded-card border-2.5 border-ink p-6 shadow-hard-card space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink">
          <Database className="w-5 h-5 text-ink stroke-[2.5]" />
          <h3 className="font-serif font-bold text-lg">PostgreSQL Storage Usage</h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow border-1.5 border-ink text-ink">
          {totalCount} images
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm font-semibold">
          <span className="text-ink-soft">Current Database Volume</span>
          <span className="text-ink font-bold">
            {formatByteSize(totalBytes)} / {formatByteSize(freeTierLimitBytes)} ({percentage}%)
          </span>
        </div>
        <div className="w-full h-4 bg-paper rounded-full border-2 border-ink overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isNearLimit ? "bg-coral" : "bg-ink"
            }`}
            style={{ width: `${Math.max(2, percentage)}%` }}
          />
        </div>
      </div>

      {isNearLimit && (
        <div className="p-3.5 bg-blush border-2 border-ink rounded-input text-ink text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-coral shrink-0 mt-0.5 stroke-[2.5]" />
          <p className="font-medium">
            Database storage is approaching the free tier ceiling. Clean up or archive binaries if necessary.
          </p>
        </div>
      )}

      <div className="pt-3 border-t-2 border-paper flex items-center justify-between text-xs font-semibold text-ink-soft">
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-ink shrink-0" />
          <span>Automatic daily cleanup purges abandoned and old images</span>
        </div>
        <span className="font-mono text-ink">Neon DB</span>
      </div>
    </div>
  );
}

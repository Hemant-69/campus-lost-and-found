import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      <span className="text-xs font-medium text-slate-500">Loading page content...</span>
    </div>
  );
}

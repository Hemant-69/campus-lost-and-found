import Link from "next/link";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { AccountStatus } from "@prisma/client";

export interface VerificationBannerProps {
  status: AccountStatus;
  rejectionReason?: string;
}

export function VerificationBanner({ status, rejectionReason }: VerificationBannerProps) {
  if (status === "VERIFIED") return null;

  if (status === "PENDING") {
    return (
      <aside
        aria-label="Account status notification"
        className="bg-yellow border-b-2.5 border-ink px-[40px] sm:px-[48px] lg:px-[64px] py-2.5 text-ink text-xs sm:text-sm font-semibold"
      >
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
            <span>
              Your account is waiting for verification. You can browse posts, but posting, commenting, and claiming require administrator approval.
            </span>
          </div>
          <Link
            href="/profile"
            className="underline hover:text-coral shrink-0 font-bold"
          >
            Check status
          </Link>
        </div>
      </aside>
    );
  }

  if (status === "REJECTED") {
    return (
      <aside
        aria-label="Account rejected notification"
        className="bg-blush border-b-2.5 border-ink px-[40px] sm:px-[48px] lg:px-[64px] py-2.5 text-ink text-xs sm:text-sm font-semibold"
      >
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-coral shrink-0 stroke-[2.5]" />
            <span>
              ID verification was rejected{rejectionReason ? `: ${rejectionReason}` : ""}. Please re-upload your student ID photograph to restore access.
            </span>
          </div>
          <Link
            href="/verify-pending"
            className="underline hover:text-coral shrink-0 font-bold"
          >
            Re-upload ID
          </Link>
        </div>
      </aside>
    );
  }

  return null;
}

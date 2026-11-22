import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReuploadIdForm } from "./ReuploadIdForm";
import { Clock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IdCardIllustration } from "@/components/illustrations/Illustrations";

export default async function VerifyPendingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      rollNumber: true,
      department: true,
      status: true,
      idVerification: {
        select: {
          status: true,
          rejectionReason: true,
          reviewedAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.status === "VERIFIED") {
    return (
      <div className="max-w-xl mx-auto px-[40px] sm:px-[48px] lg:px-[64px] py-16 text-center space-y-6">
        <div className="bg-surface border-2.5 border-ink rounded-card p-8 shadow-hard-card space-y-6">
          <div className="w-16 h-16 rounded-full bg-sage border-2.5 border-ink text-ink flex items-center justify-center mx-auto shadow-hard-btn">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-ink">Account Verified</h1>
            <p className="text-sm text-ink-soft max-w-md mx-auto">
              Your campus student identity has been verified. You have full access to create posts, submit claims, comment, and message.
            </p>
          </div>
          <Link href="/posts">
            <Button variant="accent" size="lg">Browse Lost &amp; Found Feed</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-6">
      <div className="bg-surface border-2.5 border-ink rounded-card p-6 sm:p-8 shadow-hard-card space-y-6">
        {user.status === "PENDING" && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <IdCardIllustration size={72} />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                Account Waiting for Verification
              </h1>
              <p className="text-sm text-ink-soft">
                Thank you, <span className="font-bold text-ink">{user.name}</span>. Your ID card has been submitted to the campus administrator for verification.
              </p>
            </div>

            <div className="p-4 bg-paper border-2 border-ink rounded-input text-left text-xs space-y-2.5 text-ink-soft">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ink">Roll Number:</span>
                <span className="font-mono font-bold text-ink">{user.rollNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ink">Department:</span>
                <span className="font-medium text-ink">{user.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ink">Submitted:</span>
                <span className="text-ink">{new Date(user.idVerification?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-xs text-ink-soft leading-relaxed">
              While waiting, you can browse all active lost and found items. Once verified, you will be notified and granted access to post, comment, claim, and chat.
            </p>

            <div className="pt-2">
              <Link href="/posts">
                <Button variant="outline" className="w-full sm:w-auto">Browse Public Feed</Button>
              </Link>
            </div>
          </div>
        )}

        {user.status === "REJECTED" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-blush border-2.5 border-ink text-coral flex items-center justify-center mx-auto shadow-hard-btn">
                <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                Verification Needs Attention
              </h1>
              <p className="text-sm text-ink-soft">
                The administrator was unable to verify your student identity with the submitted photo.
              </p>
            </div>

            {user.idVerification?.rejectionReason && (
              <div className="p-4 bg-blush border-2 border-ink rounded-input space-y-1">
                <span className="text-xs font-bold text-coral uppercase tracking-wider block">Administrator Note:</span>
                <p className="text-sm text-ink font-medium">
                  {user.idVerification.rejectionReason}
                </p>
              </div>
            )}

            <div className="pt-4 border-t-2 border-paper">
              <ReuploadIdForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

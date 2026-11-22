"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { VerificationModal } from "@/components/admin/VerificationModal";
import { SafeImage } from "@/components/image/SafeImage";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserCheck } from "lucide-react";

export function VerificationQueueList({ initialQueue }: { initialQueue: any[] }) {
  const router = useRouter();
  const [selectedVerification, setSelectedVerification] = useState<any | null>(null);

  if (initialQueue.length === 0) {
    return (
      <EmptyState
        title="Verification queue is clear"
        description="All submitted student ID cards have been reviewed. New student registrations will appear here."
      />
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-surface rounded-card border-2.5 border-ink overflow-hidden shadow-hard-card">
        <table className="w-full text-left text-sm text-ink divide-y-2 border-ink">
          <thead className="bg-paper font-serif font-bold text-ink border-b-2.5 border-ink">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Roll Number</th>
              <th className="p-4">Department &amp; Year</th>
              <th className="p-4">ID Photo Preview</th>
              <th className="p-4">Submitted</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-paper">
            {initialQueue.map((item) => (
              <tr key={item.id} className="hover:bg-paper/40 transition">
                <td className="p-4 font-bold text-ink">
                  <div>{item.user.name}</div>
                  <div className="font-mono text-xs text-ink-soft font-normal">
                    {item.user.email}
                  </div>
                </td>
                <td className="p-4 font-mono font-bold text-ink">
                  {item.user.rollNumber}
                </td>
                <td className="p-4 font-medium">
                  {item.user.department} (Year {item.user.year})
                </td>
                <td className="p-4">
                  <div className="w-14 h-10 rounded-input bg-paper overflow-hidden border-2 border-ink shadow-hard-btn">
                    <SafeImage imageId={item.imageId} variant="thumb" alt="ID card preview" />
                  </div>
                </td>
                <td className="p-4 text-ink-soft font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setSelectedVerification(item)}
                  >
                    Review ID
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="md:hidden space-y-4">
        {initialQueue.map((item) => (
          <div key={item.id} className="bg-surface rounded-card border-2.5 border-ink p-5 shadow-hard-card space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">{item.user.name}</h3>
                <span className="font-mono text-xs text-ink-soft block">{item.user.email}</span>
                <span className="font-mono text-xs font-bold text-ink block mt-1">Roll: {item.user.rollNumber}</span>
              </div>
              <div className="w-16 h-12 rounded-input bg-paper overflow-hidden border-2 border-ink shadow-hard-btn shrink-0">
                <SafeImage imageId={item.imageId} variant="thumb" alt="ID card preview" />
              </div>
            </div>

            <div className="text-xs font-medium text-ink-soft flex justify-between pt-2 border-t border-paper">
              <span>{item.user.department} &bull; Year {item.user.year}</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>

            <Button
              variant="accent"
              size="sm"
              className="w-full"
              onClick={() => setSelectedVerification(item)}
            >
              Review Student ID
            </Button>
          </div>
        ))}
      </div>

      {selectedVerification && (
        <VerificationModal
          isOpen={!!selectedVerification}
          onClose={() => setSelectedVerification(null)}
          verification={selectedVerification}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { LostNoteScene } from "@/components/illustrations/Illustrations";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error caught by root boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-5">
      <LostNoteScene size={140} className="mx-auto" />
      <h2 className="font-serif text-3xl font-bold text-ink">Something went wrong</h2>
      <p className="text-sm text-ink-soft max-w-sm mx-auto">
        An unexpected error occurred while rendering this page. You can try reloading or returning to the notice board.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button variant="outline" onClick={() => (window.location.href = "/posts")}>
          Return to Notice Board
        </Button>
        <Button variant="accent" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

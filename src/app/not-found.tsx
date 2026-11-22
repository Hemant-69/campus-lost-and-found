import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LostNoteScene } from "@/components/illustrations/Illustrations";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-5">
      <LostNoteScene size={140} className="mx-auto" />
      <span className="font-serif text-5xl font-bold text-coral">404</span>
      <h2 className="font-serif text-3xl font-bold text-ink">Note Not Found</h2>
      <p className="text-sm text-ink-soft max-w-sm mx-auto">
        The item, claim, or notice you are looking for has been moved, returned, or unpinned from the board.
      </p>
      <div className="pt-2">
        <Link href="/posts">
          <Button variant="accent">
            Back to Notice Board
          </Button>
        </Link>
      </div>
    </div>
  );
}

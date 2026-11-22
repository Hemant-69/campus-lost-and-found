import Link from "next/link";
import { BrandLogoMark } from "../illustrations/Illustrations";

export function Footer() {
  return (
    <footer
      className="bg-paper border-t-3 border-ink mt-auto py-10 text-ink text-sm bg-cover bg-center"
      style={{ backgroundImage: "url('/images/paper-bg.webp')" }}
    >
      <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <BrandLogoMark size={28} />
          <div>
            <p className="font-serif font-bold text-base text-ink">Campus Lost &amp; Found</p>
            <p className="text-xs text-ink-soft">Made by students, for students. Zero spam.</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold text-ink">
          <Link href="/posts" className="hover:text-coral transition">
            Browse items
          </Link>
          <Link href="/posts/new" className="hover:text-coral transition">
            Post item
          </Link>
          <Link href="/profile" className="hover:text-coral transition">
            Account
          </Link>
        </div>
      </div>
    </footer>
  );
}

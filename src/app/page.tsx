import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/feed/PostCard";
import { Button } from "@/components/ui/Button";
import {
  KeyIllustration,
  WalletIllustration,
  PhoneIllustration,
  BagIllustration,
  IdCardIllustration,
  UmbrellaIllustration,
  BottleIllustration,
  BooksIllustration,
  LaptopIllustration,
  ClothingIllustration,
} from "@/components/illustrations/Illustrations";
import { StepsSlider } from "@/components/home/StepsSlider";
import { HeroSection } from "@/components/home/HeroSection";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

const MARQUEE_ITEMS = [
  { label: "Keys", href: "/posts?category=KEYS", Component: KeyIllustration },
  { label: "Wallets", href: "/posts?category=WALLET", Component: WalletIllustration },
  { label: "Phones", href: "/posts?category=ELECTRONICS", Component: PhoneIllustration },
  { label: "Bags", href: "/posts?category=BAGS", Component: BagIllustration },
  { label: "ID cards", href: "/posts?category=ID_CARDS", Component: IdCardIllustration },
  { label: "Laptops", href: "/posts?category=ELECTRONICS", Component: LaptopIllustration },
  { label: "Books", href: "/posts?category=BOOKS", Component: BooksIllustration },
  { label: "Clothing", href: "/posts?category=CLOTHING", Component: ClothingIllustration },
  { label: "Umbrellas", href: "/posts?category=OTHER", Component: UmbrellaIllustration },
  { label: "Bottles", href: "/posts?category=OTHER", Component: BottleIllustration },
];

// Repeat 4x per track to ensure each track spans > 5,000px, eliminating any blank gap on any screen up to 4K
const REPEATED_ITEMS = [
  ...MARQUEE_ITEMS,
  ...MARQUEE_ITEMS,
  ...MARQUEE_ITEMS,
  ...MARQUEE_ITEMS,
];

export default async function LandingPage() {
  let recentPosts: any[] = [];

  try {
    const posts = await prisma.post.findMany({
      where: { isAutoHidden: false, status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        type: true,
        title: true,
        category: true,
        location: true,
        locationDetail: true,
        dateLostOrFound: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, department: true } },
        images: {
          select: { imageId: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });
    recentPosts = posts;
  } catch (err) {
    // Fallback for build time static generation when DB is not connected
  }

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 overflow-x-hidden">
      {/* Hero Section - Hand-drawn Vector Artwork & Responsive Container Query Layout */}
      <section className="w-full">
        <HeroSection />
      </section>

      {/* Strip: Things students lose (Infinite Continuous Marquee on PC & Mobile) */}
      <section className="bg-yellow border-y-3 border-ink py-6 overflow-hidden select-none" aria-label="Things students lose">
        <div className="w-full overflow-hidden">
          <div className="animate-marquee flex items-center">
            {/* Primary Track */}
            <div className="flex items-center gap-10 sm:gap-14 pr-10 sm:pr-14 shrink-0">
              {REPEATED_ITEMS.map((item, idx) => (
                <Link
                  key={`primary-${idx}`}
                  href={item.href}
                  className="flex flex-col items-center gap-2 group shrink-0 focus-visible:outline-ink"
                >
                  <item.Component size={56} className="group-hover:scale-110 group-active:scale-95 transition-transform" />
                  <span className="font-semibold text-sm text-ink group-hover:underline whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Cloned Track for Seamless Infinite Loop */}
            <div className="flex items-center gap-10 sm:gap-14 pr-10 sm:pr-14 shrink-0" aria-hidden="true">
              {REPEATED_ITEMS.map((item, idx) => (
                <Link
                  key={`clone-${idx}`}
                  href={item.href}
                  tabIndex={-1}
                  className="flex flex-col items-center gap-2 group shrink-0"
                >
                  <item.Component size={56} className="group-hover:scale-110 group-active:scale-95 transition-transform" />
                  <span className="font-semibold text-sm text-ink group-hover:underline whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works protocol */}
      <section className="w-full px-[40px] sm:px-[48px] lg:px-[64px] space-y-12" id="how">
        <div className="space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-ink leading-tight">
            Three steps, and it is back with its owner
          </h2>
          <p className="text-base sm:text-lg text-ink-soft max-w-xl">
            No guessing games and no arguing in the comments.
          </p>
        </div>

        <StepsSlider />
      </section>

      {/* Dark Section: Built to keep spam out */}
      <section className="bg-dark-bg text-paper border-y-3 border-ink py-16 sm:py-24">
        <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 sm:gap-16 items-center">
            {/* 3 Taped Sticky Notes */}
            <div className="relative min-h-[380px] hidden sm:flex flex-col justify-center" aria-hidden="true">
              {/* Note 1 */}
              <div className="absolute top-2 left-4 w-64 p-6 bg-note-yellow text-ink rounded-note border-2.5 border-ink shadow-hard-card -rotate-4">
                <div className="tape-strip" />
                <p className="font-hand text-2xl leading-tight font-semibold">
                  Found a black wallet near Block A
                </p>
                <span className="block font-sans text-xs text-ink-soft mt-3 font-medium">
                  Posted by a student, Mechanical
                </span>
              </div>

              {/* Note 2 */}
              <div className="absolute top-16 left-64 w-64 p-6 bg-sage text-ink rounded-note border-2.5 border-ink shadow-hard-card rotate-3">
                <div className="tape-strip" />
                <p className="font-hand text-2xl leading-tight font-semibold">
                  Lost: grey umbrella, canteen
                </p>
                <span className="block font-sans text-xs text-ink-soft mt-3 font-medium">
                  Asked one question to confirm
                </span>
              </div>

              {/* Note 3 */}
              <div className="absolute top-64 left-24 w-64 p-6 bg-blush text-ink rounded-note border-2.5 border-ink shadow-hard-card -rotate-2">
                <div className="tape-strip" />
                <p className="font-hand text-2xl leading-tight font-semibold">
                  Returned. Thank you!
                </p>
                <span className="block font-sans text-xs text-ink-soft mt-3 font-medium">
                  Handed over at the Library desk
                </span>
              </div>
            </div>

            {/* Mobile simplified notes */}
            <div className="sm:hidden space-y-4">
              <div className="p-5 bg-note-yellow text-ink rounded-note border-2.5 border-ink shadow-hard-card">
                <p className="font-hand text-2xl leading-tight font-semibold">
                  Found a black wallet near Block A
                </p>
                <span className="block font-sans text-xs text-ink-soft mt-2">
                  Posted by a student, Mechanical
                </span>
              </div>
              <div className="p-5 bg-sage text-ink rounded-note border-2.5 border-ink shadow-hard-card">
                <p className="font-hand text-2xl leading-tight font-semibold">
                  Lost: grey umbrella, canteen
                </p>
                <span className="block font-sans text-xs text-ink-soft mt-2">
                  Asked one question to confirm
                </span>
              </div>
            </div>

            {/* Features Copy */}
            <div className="space-y-6">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-paper leading-tight">
                Built to keep spam and scams out
              </h2>
              <p className="text-base sm:text-lg text-[#D9D0C0] max-w-xl">
                Boards like this fall apart when anyone can post anything. This one does not.
              </p>

              <div className="space-y-6 pt-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-yellow">
                    Only checked students
                  </h3>
                  <p className="text-base text-[#D9D0C0] leading-relaxed">
                    New accounts cannot post, comment or message until an admin has looked at their ID.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-yellow">
                    Chat only through a post
                  </h3>
                  <p className="text-base text-[#D9D0C0] leading-relaxed">
                    You cannot message strangers. Every conversation starts from a specific item.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-yellow">
                    Report anything odd
                  </h3>
                  <p className="text-base text-[#D9D0C0] leading-relaxed">
                    Flag a post, comment or person in one tap. Admins can take it down or disable the account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      {recentPosts.length > 0 && (
        <section className="w-full px-[40px] sm:px-[48px] lg:px-[64px] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Recently Reported</h2>
              <p className="text-sm text-ink-soft mt-1">Latest active items on campus</p>
            </div>
            <Link
              href="/posts"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-coral transition-colors"
            >
              <span>View all feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post as any} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom Call to Action Card */}
      <section className="w-full px-[40px] sm:px-[48px] lg:px-[64px]">
        <div className="bg-yellow border-3 border-ink rounded-[32px] p-8 sm:p-14 shadow-hard-cta flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-ink leading-tight">
              Lost your keys this morning? Start by looking.
            </h2>
            <p className="text-base sm:text-lg text-ink font-medium">
              Someone may have already handed them in.
            </p>
          </div>
          <Link href="/posts" className="shrink-0">
            <Button variant="primary" size="lg">
              Browse the feed
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

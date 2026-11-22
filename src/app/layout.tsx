import type { Metadata } from "next";
import { Inter, Fraunces, Caveat } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { VerificationBanner } from "@/components/layout/VerificationBanner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "Campus Lost & Found - Pin it here",
  description: "The college lost and found board, moved online. Verified student network.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let rejectionReason: string | undefined;
  if (session?.user?.id && session.user.status === "REJECTED") {
    const v = await prisma.idVerification.findUnique({
      where: { userId: session.user.id },
      select: { rejectionReason: true },
    });
    rejectionReason = v?.rejectionReason || undefined;
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${caveat.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-paper text-ink antialiased pb-20 md:pb-0">
        <Navbar user={session?.user || null} />
        {session?.user && (
          <VerificationBanner
            status={session.user.status}
            rejectionReason={rejectionReason}
          />
        )}
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav isLoggedIn={!!session?.user} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

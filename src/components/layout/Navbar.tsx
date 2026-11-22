"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, MessageSquare, Shield, LogOut } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { signOut } from "next-auth/react";
import { BrandLogoMark } from "../illustrations/Illustrations";
import { Button } from "../ui/Button";
import clsx from "clsx";

export interface NavbarProps {
  user?: {
    id: string;
    name?: string | null;
    role: "STUDENT" | "ADMIN";
    status: "PENDING" | "VERIFIED" | "REJECTED" | "DISABLED";
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-30 bg-paper border-b-3 border-ink bg-cover bg-center"
      style={{ backgroundImage: "url('/images/paper-bg.webp')" }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-[64px] h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand with Official Notice Board Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0" aria-label="Campus Lost and Found Home">
          <BrandLogoMark size={36} className="shrink-0 transition-transform group-hover:rotate-[-4deg]" />
          <div className="hidden sm:flex flex-col shrink-0">
            <span className="font-serif font-bold text-ink leading-tight text-base sm:text-lg lg:text-xl whitespace-nowrap">
              Campus Lost &amp; Found
            </span>
            <span className="font-hand text-xs sm:text-sm text-coral -mt-0.5 font-semibold hidden xl:block">
              Pin it here.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm xl:text-[15px] font-semibold text-ink whitespace-nowrap">
          <Link
            href="/posts"
            className={clsx(
              "hover:text-coral transition pb-0.5 whitespace-nowrap",
              pathname === "/posts" ? "border-b-2.5 border-ink text-coral" : ""
            )}
          >
            Browse items
          </Link>
          {user && (
            <>
              <Link
                href="/my-posts"
                className={clsx(
                  "hover:text-coral transition pb-0.5 whitespace-nowrap",
                  pathname === "/my-posts" ? "border-b-2.5 border-ink text-coral" : ""
                )}
              >
                My Posts
              </Link>
              <Link
                href="/my-claims"
                className={clsx(
                  "hover:text-coral transition pb-0.5 whitespace-nowrap",
                  pathname === "/my-claims" ? "border-b-2.5 border-ink text-coral" : ""
                )}
              >
                My Claims
              </Link>
            </>
          )}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={clsx(
                "inline-flex items-center gap-1.5 text-ink font-semibold px-3 py-1 rounded-full bg-sky border-2 border-ink shadow-hard-btn hover:bg-sky-hover active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap",
                pathname.startsWith("/admin") ? "ring-2 ring-ink" : ""
              )}
            >
              <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Admin Board</span>
            </Link>
          )}
        </nav>

        {/* Action Controls & Auth */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          {user ? (
            <>
              <Link href="/posts/new">
                <Button variant="accent" size="sm" className="hidden sm:inline-flex whitespace-nowrap">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Post item</span>
                </Button>
              </Link>

              <Link
                href="/messages"
                className="p-2 rounded-full border-2 border-ink bg-surface text-ink hover:bg-yellow active:translate-x-[1px] active:translate-y-[1px] shadow-hard-btn transition relative"
                aria-label="Messages"
              >
                <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <NotificationBell />

              <div className="h-6 w-[2px] bg-ink/20 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-full border-2 border-ink bg-surface text-ink hover:bg-paper active:translate-x-[1px] active:translate-y-[1px] transition text-xs font-semibold shadow-hard-btn"
                  title="My Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-yellow text-ink border-1.5 border-ink flex items-center justify-center font-serif font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden lg:inline pr-2">{user.name ? user.name.split(" ")[0] : "Student"}</span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="p-2 text-ink border-2 border-ink rounded-full bg-surface hover:bg-blush active:translate-x-[1px] active:translate-y-[1px] shadow-hard-btn transition"
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[15px] font-semibold text-ink hover:text-coral transition px-2 py-1"
              >
                Sign in
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

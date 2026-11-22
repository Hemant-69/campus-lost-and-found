"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, MessageSquare, User } from "lucide-react";
import clsx from "clsx";

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        // If visual viewport height is significantly less than window innerHeight, keyboard is open
        const isKeyboard = window.innerHeight - window.visualViewport.height > 150;
        setIsKeyboardOpen(isKeyboard);
      }
    };

    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      return () => window.visualViewport?.removeEventListener("resize", handleResize);
    }
  }, []);

  if (!isLoggedIn || isKeyboardOpen) return null;

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Browse", href: "/posts", icon: Compass },
    { label: "Post", href: "/posts/new", icon: PlusCircle },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t-3 border-ink pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] px-3 flex items-center justify-around"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] px-2 py-1 rounded-xl text-xs font-semibold transition-all select-none",
              isActive
                ? "bg-yellow text-ink border-2 border-ink shadow-[2px_2px_0_#231F20]"
                : "text-ink-soft hover:text-ink hover:bg-paper"
            )}
          >
            <Icon className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

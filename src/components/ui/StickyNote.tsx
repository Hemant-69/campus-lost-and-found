import React from "react";
import clsx from "clsx";

export interface StickyNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "yellow" | "sage" | "blush";
  rotate?: -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4;
  showTape?: boolean;
}

export function StickyNote({
  color = "yellow",
  rotate = -2,
  showTape = true,
  className,
  children,
  ...props
}: StickyNoteProps) {
  const colorClasses = {
    yellow: "bg-note-yellow",
    sage: "bg-note-sage",
    blush: "bg-note-blush",
  };

  const desktopRotations: Record<number, string> = {
    [-4]: "sm:rotate-[-4deg]",
    [-3]: "sm:rotate-[-3deg]",
    [-2]: "sm:rotate-[-2deg]",
    [-1]: "sm:rotate-[-1deg]",
    [0]: "sm:rotate-0",
    [1]: "sm:rotate-[1deg]",
    [2]: "sm:rotate-[2deg]",
    [3]: "sm:rotate-[3deg]",
    [4]: "sm:rotate-[4deg]",
  };

  return (
    <div
      className={clsx(
        "relative border-2.5 border-ink rounded-note shadow-hard-note p-6 transition-transform rotate-0",
        colorClasses[color],
        desktopRotations[rotate] || "sm:rotate-0",
        className
      )}
      {...props}
    >
      {showTape && <div className="tape-strip" aria-hidden="true" />}
      {children}
    </div>
  );
}

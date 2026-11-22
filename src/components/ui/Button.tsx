import React from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold rounded-full border-2.5 transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none active:translate-x-[2px] active:translate-y-[2px]";

    const variantClasses = {
      // Primary: Ink background, paper text, coral hard shadow
      primary:
        "bg-ink text-paper border-ink shadow-hard-btn-primary hover:bg-[#151213] active:shadow-hard-btn-pressed",
      // Accent: Yellow background, ink text, ink hard shadow
      accent:
        "bg-yellow text-ink border-ink shadow-hard-btn hover:bg-yellow-hover active:shadow-hard-btn-pressed",
      // Outline: White background, ink text, ink hard shadow
      outline:
        "bg-surface text-ink border-ink shadow-hard-btn hover:bg-[#F2ECE1] active:shadow-hard-btn-pressed",
      // Danger: White background, coral border, ink text, ink hard shadow
      danger:
        "bg-surface text-ink border-coral shadow-hard-btn hover:bg-[#FDF0ED] active:shadow-hard-btn-pressed",
      // Ghost: Plain text with soft ink hover
      ghost:
        "bg-transparent text-ink border-transparent shadow-none hover:bg-black/5 active:bg-black/10 active:translate-none",
    };

    const sizeClasses = {
      sm: "text-xs px-4 py-2 min-h-[40px] gap-1.5",
      md: "text-base px-6 py-2.5 min-h-[48px] gap-2",
      lg: "text-lg px-8 py-3.5 min-h-[54px] gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

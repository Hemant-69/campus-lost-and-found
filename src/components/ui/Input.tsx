import React from "react";
import { AlertCircle } from "lucide-react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            "w-full px-4 py-3 min-h-[48px] text-base rounded-input border-2.5 bg-surface text-ink placeholder:text-ink-soft/50 transition-colors focus:outline-none focus:ring-0 focus-visible:outline-3 focus-visible:outline-sky focus-visible:outline-offset-2 disabled:bg-paper disabled:text-ink-soft/60",
            error ? "border-coral" : "border-ink",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
        {error && (
          <div className="flex items-center gap-1.5 pl-2.5 border-l-2.5 border-coral text-xs font-semibold text-ink">
            <AlertCircle className="w-3.5 h-3.5 text-coral shrink-0" strokeWidth={2.5} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

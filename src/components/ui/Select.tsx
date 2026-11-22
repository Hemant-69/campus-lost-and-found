import React from "react";
import { AlertCircle } from "lucide-react";
import clsx from "clsx";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, options, children, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            "w-full px-4 py-3 min-h-[48px] text-base rounded-input border-2.5 bg-surface text-ink transition-colors focus:outline-none focus:ring-0 focus-visible:outline-3 focus-visible:outline-sky focus-visible:outline-offset-2 disabled:bg-paper disabled:text-ink-soft/60",
            error ? "border-coral" : "border-ink",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
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

Select.displayName = "Select";

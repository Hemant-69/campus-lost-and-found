import React from "react";
import clsx from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Card({
  as: Component = "div",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={clsx(
        "bg-surface border-2.5 border-ink rounded-card shadow-hard-card p-6",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

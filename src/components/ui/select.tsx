import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "./cn";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-800",
        "focus:outline-none focus:ring-2 focus:ring-neutral-400",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

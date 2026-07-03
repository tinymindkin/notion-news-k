import type { ReactNode } from "react";
import { cn } from "./cn";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn("relative inline-block group", className)}>
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-800 px-2 py-1 text-xs text-white opacity-0 shadow group-hover:opacity-100 transition-opacity">
        {content}
      </span>
    </span>
  );
}

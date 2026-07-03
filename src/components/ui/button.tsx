import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "default" | "outline" | "ghost";
type Size = "default" | "sm" | "icon";

const variants: Record<Variant, string> = {
  default: "bg-neutral-900 text-white hover:bg-neutral-700",
  outline: "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100",
  ghost: "text-neutral-700 hover:bg-neutral-100",
};
const sizes: Record<Size, string> = {
  default: "h-9 px-3 text-sm rounded-md",
  sm: "h-8 px-2 text-xs rounded-md",
  icon: "h-8 w-8 rounded-md text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

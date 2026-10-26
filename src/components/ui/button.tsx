"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The button contract (Session-6 re-measured on the live reference):
// standard actions are the glass family — `glass-button` (neutral) or
// `glass-button-primary` (primary CTA) — on the padding-driven px-4 py-2.5
// (42px) size. The glass-* classes are UNLAYERED plain CSS in tokens.css:
// their border/color always beat same-element utilities (the v4 cascade
// law), so inert classes like border-0/text-* on glass buttons compute
// nothing — the glass class owns the surface.
// The focus ring below is the clone's a11y SUPERSET: the reference ships no
// custom button focus ring (browser outline only); we keep the visible
// keyboard ring (the same superset posture as the drawer + readable
// heading colors).

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "glass-button rounded-xl",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-[#e5e5e5] bg-card text-[#0a0a0a] shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-card dark:text-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Session-5 (measured live): the reference's standard buttons are
        // px-4 py-2.5 (padding-driven 42px height) — no fixed h-9.
        default: "px-4 py-2.5",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

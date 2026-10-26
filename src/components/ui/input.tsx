"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The S5 form-control palette: GRAY ramp (gray-200 borders, gray-950 text,
// gray-400 placeholders), h-9, transparent background.
// Session-5 (measured live): the reference's Input base computes
// rounded-xl (12px), border-input (#262a36), bg-transparent, ring-1 focus
// (no offset), text-base md:text-sm, shadow-sm.

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

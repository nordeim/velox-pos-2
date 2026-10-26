"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// Session-5 (measured live on the reference's receipt-footer field): the
// textarea base — rounded-xl, border-input (#262a36), bg-transparent,
// min-h-[60px], px-3 py-2, ring-1 focus, resize vertical (browser default).

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[60px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors md:text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

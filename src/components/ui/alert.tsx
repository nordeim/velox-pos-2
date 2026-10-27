import * as React from "react";

import { cn } from "@/lib/utils";

// Session-12 (F-76, measured live on the reference 2026-10-27): the login
// card's error state is a bordered Alert PANEL — rounded-xl (12px) + a 1px
// red-200 border + a red-50/70 background + p-4 (16px), with the message in
// an inner 14px red-700 block and NO icon. The success tone is the symmetric
// emerald: the reference's success state is unmeasurable (its writes are
// restricted), so the clone pairs the family by construction — a documented
// superset. `role` stays overridable (the notice site passes role="status").

const alertTones = {
  error: "border-red-200 bg-red-50/70",
  success: "border-emerald-200 bg-emerald-50/70",
} as const;

const alertTextTones = {
  error: "text-red-700",
  success: "text-emerald-700",
} as const;

type AlertTone = keyof typeof alertTones;

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }
>(({ tone = "error", className, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn("rounded-xl border p-4", alertTones[tone], className)}
    {...props}
  >
    <div className={cn("text-sm", alertTextTones[tone])}>{children}</div>
  </div>
));
Alert.displayName = "Alert";

export { Alert };

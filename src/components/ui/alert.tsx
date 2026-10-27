import * as React from "react";

import { cn } from "@/lib/utils";

// Session-12 (F-76, measured live on the reference 2026-10-27): the login
// card's error state is a bordered Alert PANEL — rounded-xl (12px) + a 1px
// red-200 border + a red-50/70 background + p-4 (16px), with the message in
// an inner 14px red-700 block and NO icon. The success tone is the symmetric
// emerald: the reference's success state is unmeasurable (its writes are
// restricted), so the clone pairs the family by construction — a documented
// superset. `role` stays overridable (the notice site passes role="status").
//
// Session-13 (F-92, measured live 2026-10-27): the reset-password surface
// ships its OWN alert family — the stock shadcn rounded-lg (8px) +
// bg-red-50/50 (0.5 alpha) + an inner 14px red-800 (#991b1b, measured
// rgb(153,27,27) — NOT the login's 12px/0.7/red-700 panel; the reference
// itself uses two distinct alert treatments on its two auth surfaces).

const alertTones = {
  error: "rounded-xl border-red-200 bg-red-50/70",
  "error-soft": "rounded-lg border-red-200 bg-red-50/50",
  success: "rounded-xl border-emerald-200 bg-emerald-50/70",
} as const;

const alertTextTones = {
  error: "text-red-700",
  "error-soft": "text-red-800",
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
    className={cn("border p-4", alertTones[tone], className)}
    {...props}
  >
    <div className={cn("text-sm", alertTextTones[tone])}>{children}</div>
  </div>
));
Alert.displayName = "Alert";

export { Alert };

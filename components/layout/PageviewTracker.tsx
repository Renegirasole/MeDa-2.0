"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { posthogEnabled, trackPageview } from "@/lib/analytics";

/** Visitas para PostHog (solo si está configurado). Vercel Analytics cuenta las suyas por su cuenta. */
export function PageviewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (posthogEnabled) trackPageview();
  }, [pathname]);
  return null;
}

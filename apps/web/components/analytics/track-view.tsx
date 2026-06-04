"use client";

import { useEffect } from "react";
import { trackCleanerView } from "@/lib/analytics";

/** Fire-and-forget cleaner_view event. Mount once per profile page. */
export function TrackCleanerView({ cleanerId }: { cleanerId: string }) {
  useEffect(() => {
    trackCleanerView(cleanerId);
  }, [cleanerId]);
  return null;
}

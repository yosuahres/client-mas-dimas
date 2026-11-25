"use client";

import { Toaster } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";

// On phones the save bars sit at the bottom of the screen, so messages drop in from the top instead of covering Save.
export function AdminToaster() {
  const isMobile = useIsMobile();
  return <Toaster position={isMobile ? "top-center" : "bottom-right"} richColors closeButton />;
}

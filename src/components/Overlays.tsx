'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Tactic 104: Isolate Client-Side Overlays to prevent SSR crashes
const CartOverlay = dynamic(() => import("./CartOverlay"), { ssr: false });
const AccountOverlay = dynamic(() => import("./AccountOverlay"), { ssr: false });
const LocationOverlay = dynamic(() => import("./LocationOverlay"), { ssr: false });

export default function Overlays() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <CartOverlay />
      <AccountOverlay />
      <LocationOverlay />
    </>
  );
}

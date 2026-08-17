// PROTOTYPE - throwaway (wayfinder #96).
// Three media-block variants mounted inside the real /projects page, switchable
// via ?variant= : A slider of short clips, B one long clip + stills, C caption-led rows.
"use client";

import { useSearchParams } from "next/navigation";
import { PrototypeSwitcher } from "./PrototypeSwitcher";
import { VariantA, variantAName } from "./VariantA";
import { VariantB, variantBName } from "./VariantB";
import { VariantC, variantCName } from "./VariantC";

const VARIANTS = [
  { key: "A", name: variantAName },
  { key: "B", name: variantBName },
  { key: "C", name: variantCName },
] as const;

export function MediaBlockVariants() {
  const params = useSearchParams();
  const variant = params?.get("variant") ?? "A";

  return (
    <>
      {variant === "A" && <VariantA />}
      {variant === "B" && <VariantB />}
      {variant === "C" && <VariantC />}
      <PrototypeSwitcher variants={VARIANTS} current={variant} />
    </>
  );
}

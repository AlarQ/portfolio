import { Card, CardContent } from "@/components/ui/card";

/**
 * Bespoke molecule for a static ad-slot placeholder. No props - this is a
 * pure presentational placeholder box (YAGNI: no `slotId`/`variant`/ad-network
 * wiring). Composes the shadcn `Card` primitive for the bordered box rather
 * than a hand-rolled div-with-border. Binds only to semantic Tailwind classes
 * - no raw hex/palette lookups (`no-direct-palette-import`).
 */
export function AdsSpace() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Advertisement
      </CardContent>
    </Card>
  );
}

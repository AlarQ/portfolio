import { Meter } from "./meter";

/**
 * Type-only fixture (never imported at runtime) proving `legend` is a
 * required prop on `Meter` (meter-legend-required) - omitting it is a
 * TypeScript compile error, not a silently-hardcoded fallback string.
 * Checked via the whole-project `tsc --noEmit` - this fixture has no
 * dedicated runner of its own; any sibling `*.typetest.test.ts` (e.g.
 * `statusDotVariants.typetest.test.ts`) spawns `tsc --noEmit` over the
 * whole project, which type-checks this file transitively along with it.
 */
// @ts-expect-error - "legend" is a required prop; omitting it must not compile
void Meter({ value: 50 });

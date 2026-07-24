// Excalidraw builder spec for the hyperion-foundation diagram (see
// `scripts/prerender-diagrams.ts`). Ported 1:1 from the retired
// `content/diagrams/hyperion-foundation.mmd`: four app binaries in a top row,
// each pointing down to a single shared base, with a rule note attached below
// it. Roles only, no colour literals.

import type { Builder } from "../../scripts/diagram-lib/builder.ts";

export const name = "hyperion-foundation";
export const alt =
  "Four app binaries - budget-app, gtd-app, repeat-app, and job-offer-app - sit in a top row, each pointing down to a single shared base node. The base, poured once, holds the shared, user, mailing, and ai crates and provides auth, sessions, RBAC, config, the DB pool, email, and OpenAPI. A rule note attached to the base reads: apps depend on the base, never the reverse; domain crates meet only through shared traits; the compiler refuses to build a crossed edge.";

export function build(b: Builder): void {
  const apps = ["budget-app", "gtd-app", "repeat-app", "job-offer-app"];
  const boxW = 170;
  const boxH = 70;
  const gap = 30;

  const container = b.container(
    20,
    20,
    apps.length * boxW + (apps.length - 1) * gap + 40,
    boxH + 60,
    "Apps - one domain crate each, written per app"
  );
  void container;
  const appBoxes = apps.map((appName, i) =>
    b.box(40 + i * (boxW + gap), 60, boxW, boxH, appName, "build")
  );

  const base = b.box(
    280,
    230,
    apps.length * boxW + (apps.length - 1) * gap - 240,
    120,
    "The shared base - poured once\nshared · user · mailing · ai\nauth, sessions, RBAC, config, DB pool, email, OpenAPI",
    "plan"
  );
  for (const app of appBoxes) b.arrow(app, base);

  const rule = b.box(
    280,
    390,
    apps.length * boxW + (apps.length - 1) * gap - 240,
    100,
    "Apps depend on the base, never the reverse.\nDomain crates meet only through shared traits.\nThe compiler refuses to build a crossed edge.",
    "verify"
  );
  b.arrow(base, rule, { bind: true });
}

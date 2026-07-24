// Excalidraw builder spec for the feature-flow diagram (see
// `scripts/prerender-diagrams.ts`). Ported 1:1 from the retired
// `content/diagrams/feature-flow.mmd`: a fixed Plan → Build → Verify → Ship
// chain, one subgraph container per phase. Roles only, no colour literals -
// `scripts/diagram-lib/palette.ts` resolves role → colour per theme.

import type { Builder } from "../../scripts/diagram-lib/builder.ts";

export const name = "feature-flow";
export const alt =
  "The feature flow: a fixed Plan → Build → Verify → Ship chain. Plan holds explore then propose; Build holds implement; Verify holds validate, review-and-ship, then learn-from-reports; Ship holds validate-impl. Shipping is an inline step on the validate and review-and-ship paths. The phases run left to right in that order.";

export function build(b: Builder): void {
  const boxW = 210;
  const boxH = 70;
  const pad = 20;

  // Plan
  const planContainer = b.container(40, 40, boxW + pad * 2, boxH * 2 + pad * 2 + 20, "Plan");
  const explore = b.box(
    40 + pad,
    40 + pad + 20,
    boxW,
    boxH,
    "explore\ncapture requirements, size the work",
    "plan"
  );
  const propose = b.box(
    40 + pad,
    40 + pad + 20 + boxH + 10,
    boxW,
    boxH,
    "propose\nturn intent into a contract",
    "plan"
  );

  // Build
  const buildX = 40 + boxW + pad * 2 + 60;
  const buildContainer = b.container(buildX, 40, boxW + pad * 2, boxH + pad * 2 + 20, "Build");
  const implement = b.box(
    buildX + pad,
    40 + pad + 20,
    boxW,
    boxH,
    "implement\nbuild one task, test-first",
    "build"
  );

  // Verify
  const verifyX = buildX + boxW + pad * 2 + 60;
  const verifyContainer = b.container(
    verifyX,
    40,
    boxW + pad * 2,
    boxH * 3 + pad * 2 + 40,
    "Verify"
  );
  const validate = b.box(
    verifyX + pad,
    40 + pad + 20,
    boxW,
    boxH,
    "validate\nstop trusting one perspective",
    "verify"
  );
  const review = b.box(
    verifyX + pad,
    40 + pad + 20 + boxH + 10,
    boxW,
    boxH,
    "review-and-ship\nrule on findings, ship inline",
    "verify"
  );
  const learn = b.box(
    verifyX + pad,
    40 + pad + 20 + (boxH + 10) * 2,
    boxW,
    boxH,
    "learn-from-reports\nnever the same mistake twice",
    "verify"
  );

  // Ship
  const shipX = verifyX + boxW + pad * 2 + 60;
  const shipContainer = b.container(shipX, 40, boxW + pad * 2, boxH + pad * 2 + 20, "Ship");
  const audit = b.box(
    shipX + pad,
    40 + pad + 20,
    boxW,
    boxH,
    "validate-impl\nfinal spec-completion audit",
    "ship"
  );

  void planContainer;
  void buildContainer;
  void verifyContainer;
  void shipContainer;

  b.arrow(explore, propose);
  b.arrow(propose, implement);
  b.arrow(implement, validate);
  b.arrow(validate, review);
  b.arrow(review, learn);
  b.arrow(learn, audit);
}

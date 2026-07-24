// Excalidraw builder spec for the hyperion-monorepo-migration diagram (see
// `scripts/prerender-diagrams.ts`). Ported 1:1 from the retired
// `content/diagrams/hyperion-monorepo-migration.mmd`: two side-by-side
// subgraphs - the old microservices shape (left) and the current Cargo
// workspace (right). The Kafka node is role `loop`; edges into it are dotted.
// Roles only, no colour literals.

import type { Builder } from "../../scripts/diagram-lib/builder.ts";

export const name = "hyperion-monorepo-migration";
export const alt =
  "Two side-by-side diagrams. On the left, the old microservices shape: a frontend calls a BFF gateway, which fans out to a user service, a subscription service, and an AI service, all communicating over a Kafka event bus. On the right, the current Cargo workspace: four app binaries - budget-app, gtd-app, repeat-app, and job-offer-app - each depend on a single Hyperion Core.";

export function build(b: Builder): void {
  // Before - Microservices
  const beforeContainer = b.container(
    20,
    20,
    340,
    420,
    "Before - Microservices (learning project)"
  );
  void beforeContainer;
  const fe = b.box(60, 60, 140, 60, "Frontend", "gate");
  const gw = b.box(60, 150, 140, 60, "BFF Gateway", "gate");
  const us = b.box(240, 90, 100, 50, "User Service", "build");
  const ss = b.box(240, 170, 100, 50, "Subscription Service", "build");
  const ais = b.box(240, 250, 100, 50, "AI Service", "build");
  const kafka = b.box(120, 340, 140, 60, "Kafka\nevent bus", "loop");

  b.arrow(fe, gw);
  b.arrow(gw, us);
  b.arrow(gw, ss);
  b.arrow(gw, ais);
  b.arrow(us, kafka, { dashed: true });
  b.arrow(ss, kafka, { dashed: true });
  b.arrow(ais, kafka, { dashed: true });

  // After - Cargo Workspace Monorepo
  const afterContainer = b.container(420, 20, 340, 420, "After - Cargo Workspace Monorepo");
  void afterContainer;
  const apps = ["budget-app", "gtd-app", "repeat-app", "job-offer-app"];
  const appBoxes = apps.map((appName, i) => b.box(460, 60 + i * 80, 140, 60, appName, "build"));
  const base = b.box(640, 220, 100, 100, "Hyperion Core\nlib", "plan");
  for (const app of appBoxes) b.arrow(app, base);
}

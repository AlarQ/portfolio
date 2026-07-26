// Excalidraw builder spec for the validate-panel diagram (see
// `scripts/prerender-diagrams.ts`). Three phase containers - Phase 1
// deterministic gates, Phase 2 advisory agents, Phase 3 coverage audit -
// shown side by side with no flow arrows. Roles only, no colour literals.

import type { Builder } from "../../scripts/diagram-lib/builder.ts";

export const name = "validate-panel";
export const alt =
  "The validate phase runs three phases in parallel. Phase 1, deterministic gates: lint, type-check, tests, format. Phase 2, advisory agents: Security Engineer, Code-Quality Pragmatist, Software Architect. Phase 3, coverage audit: Odium checking the diff against acceptance criteria.";

export function build(b: Builder): void {
  const boxW = 170;
  const boxH = 60;
  const gap = 20;

  const outer = b.container(20, 20, 700, 420, "validate");
  void outer;

  const p1 = b.container(40, 60, 200, 340, "Phase 1 - deterministic gates");
  void p1;
  b.box(55, 100, boxW, boxH, "lint", "gate");
  b.box(55, 100 + (boxH + gap), boxW, boxH, "type-check", "gate");
  b.box(55, 100 + (boxH + gap) * 2, boxW, boxH, "tests", "gate");
  b.box(55, 100 + (boxH + gap) * 3, boxW, boxH, "format", "gate");

  const p2 = b.container(260, 60, 200, 260, "Phase 2 - advisory agents");
  void p2;
  b.box(275, 100, boxW, boxH, "Security Engineer", "agent");
  b.box(275, 100 + (boxH + gap), boxW, boxH, "Code-Quality\nPragmatist", "agent");
  b.box(275, 100 + (boxH + gap) * 2, boxW, boxH, "Software Architect", "agent");

  const p3 = b.container(480, 60, 200, 140, "Phase 3 - coverage audit");
  void p3;
  b.box(495, 100, boxW, 90, "Odium\ndiff vs acceptance criteria", "audit");
}

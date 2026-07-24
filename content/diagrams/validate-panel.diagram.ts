// Excalidraw builder spec for the validate-panel diagram (see
// `scripts/prerender-diagrams.ts`). Ported 1:1 from the retired
// `content/diagrams/validate-panel.mmd`: three phase containers - Phase 1
// deterministic gates, Phase 2 advisory agents, Phase 3 coverage audit - all
// feeding review-and-ship. Roles only, no colour literals.

import type { Builder } from "../../scripts/diagram-lib/builder.ts";

export const name = "validate-panel";
export const alt =
  "The validate phase runs three phases in parallel, all feeding review-and-ship. Phase 1, deterministic gates: lint, type-check, tests, format. Phase 2, advisory agents: Security Engineer, Code-Quality Pragmatist, Software Architect. Phase 3, coverage audit: Odium checking the diff against acceptance criteria. Every node flows into review-and-ship.";

export function build(b: Builder): void {
  const boxW = 170;
  const boxH = 60;
  const gap = 20;

  const outer = b.container(20, 20, 700, 420, "validate");
  void outer;

  const p1 = b.container(40, 60, 200, 340, "Phase 1 - deterministic gates");
  void p1;
  const lint = b.box(55, 100, boxW, boxH, "lint", "gate");
  const types = b.box(55, 100 + (boxH + gap), boxW, boxH, "type-check", "gate");
  const tests = b.box(55, 100 + (boxH + gap) * 2, boxW, boxH, "tests", "gate");
  const fmt = b.box(55, 100 + (boxH + gap) * 3, boxW, boxH, "format", "gate");

  const p2 = b.container(260, 60, 200, 260, "Phase 2 - advisory agents");
  void p2;
  const sec = b.box(275, 100, boxW, boxH, "Security Engineer", "agent");
  const cq = b.box(275, 100 + (boxH + gap), boxW, boxH, "Code-Quality Pragmatist", "agent");
  const arch = b.box(275, 100 + (boxH + gap) * 2, boxW, boxH, "Software Architect", "agent");

  const p3 = b.container(480, 60, 200, 120, "Phase 3 - coverage audit");
  void p3;
  const odium = b.box(495, 100, boxW, boxH, "Odium\ndiff vs acceptance criteria", "audit");

  const findings = b.box(300, 500, 200, boxH, "review-and-ship", "sink");

  for (const node of [lint, types, tests, fmt, sec, cq, arch, odium]) {
    b.arrow(node, findings);
  }
}

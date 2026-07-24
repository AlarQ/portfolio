// Excalidraw builder spec for the task-states diagram (see
// `scripts/prerender-diagrams.ts`). Ported 1:1 from the retired
// `content/diagrams/task-states.mmd`: a task's state machine from todo/blocked
// through in-progress, implemented, review, to done. Roles only, no colour
// literals.

import type { Builder } from "../../scripts/diagram-lib/builder.ts";

export const name = "task-states";
export const alt =
  "A task's state machine: from the start a task enters todo or blocked; blocked moves to todo once its dependency is done; todo moves to in-progress when implement starts; in-progress moves to implemented when tests pass; implemented moves to review if gates find issues or straight to done if all gates pass; review moves to done once findings are resolved; reaching done ships the task inline on both paths; done is terminal.";

export function build(b: Builder): void {
  const boxW = 160;
  const boxH = 60;

  const blocked = b.box(40, 40, boxW, boxH, "blocked", "plan");
  const todo = b.box(40, 140, boxW, boxH, "todo", "plan");
  const inProgress = b.box(280, 140, boxW, boxH, "in-progress", "build");
  const implemented = b.box(520, 140, boxW, boxH, "implemented", "verify");
  const review = b.box(520, 40, boxW, boxH, "review", "verify");
  const done = b.box(760, 140, boxW, boxH, "done", "verify");

  b.arrow(blocked, todo);
  b.arrow(todo, inProgress);
  b.arrow(inProgress, implemented);
  b.arrow(implemented, review, { dashed: true });
  b.arrow(implemented, done);
  b.arrow(review, done);

  b.caption(40, 100, boxW, "dependency done");
  b.caption(280, 100, boxW, "implement starts");
  b.caption(520, 100, boxW, "tests green");
  b.caption(650, 90, 160, "gates found issues");
  b.caption(650, 190, 160, "all gates pass, ships inline");
  b.caption(640, 40, 160, "findings resolved, ships inline");
}

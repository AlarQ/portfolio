// Excalidraw builder spec for the learning-loop diagram (see
// `scripts/prerender-diagrams.ts`). Ported 1:1 from the retired
// `content/diagrams/learning-loop.mmd`: a single closed loop, every node role
// `loop`. Roles only, no colour literals.

import type { Builder } from "../../scripts/diagram-lib/builder.ts";

export const name = "learning-loop";
export const alt =
  "The learning loop: LLM actions are recorded to .monitor.jsonl and reports/*.yaml; those feed review-and-ship (accept or reject); review-and-ship feeds learn-from-reports; that promotes KB rules; and the KB rules feed back into LLM actions so the same mistake is caught earlier next run.";

export function build(b: Builder): void {
  const boxW = 180;
  const boxH = 70;
  const y = 60;
  const gap = 60;

  const [acts, log, review, learn, kb] = b.row(40, y, gap, [
    { label: "LLM actions", role: "loop", w: boxW, h: boxH },
    { label: ".monitor.jsonl\nreports/*.yaml", role: "loop", w: boxW, h: boxH },
    { label: "review-and-ship\naccept / reject", role: "loop", w: boxW, h: boxH },
    { label: "learn-from-reports", role: "loop", w: boxW, h: boxH },
    { label: "KB rules", role: "loop", w: boxW, h: boxH },
  ]);

  b.arrow(acts, log);
  b.arrow(log, review);
  b.arrow(review, learn);
  b.arrow(learn, kb);

  // kb -> acts closes the loop; routed below the row and dashed to read as
  // the feedback edge rather than another forward step.
  b.arrow(kb, acts, { dashed: true, bind: false });
  b.caption(40, y + boxH + 30, kb.x + kb.w - 40, "caught earlier next run");
}

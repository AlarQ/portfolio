// Excalidraw scene builder for the diagram pipeline (see
// `scripts/prerender-diagrams.ts`). Folds in the `Builder` class prototyped in
// `scripts/prototype-excalidraw-author.ts` (element JSON shape, box/caption/
// arrow), but resolves colour from `scripts/diagram-lib/palette.ts` (role →
// hex, per theme) instead of literal hex strings, so a
// `content/diagrams/<name>.diagram.ts` spec tags shapes with a semantic ROLE
// only - never a colour - mirroring the `.mmd` role convention it replaces.

import { containerSwatch, frameColors, type Role, roleSwatch, type ThemeName } from "./palette.ts";

export interface Rect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const BASE = {
  angle: 0,
  fillStyle: "solid",
  strokeWidth: 2,
  strokeStyle: "solid",
  roughness: 1,
  opacity: 100,
  groupIds: [] as string[],
  seed: 1,
  version: 1,
  versionNonce: 1,
  isDeleted: false,
  updated: 1,
  link: null,
  locked: false,
};

export class Builder {
  private seq = 1;
  private readonly elements: Record<string, unknown>[] = [];
  private readonly theme: ThemeName;

  constructor(theme: ThemeName) {
    this.theme = theme;
  }

  private id(prefix: string): string {
    return `${prefix}-${this.seq++}`;
  }

  /** A labelled rectangle, coloured by its semantic role for this theme. */
  box(x: number, y: number, w: number, h: number, label: string, role: Role): Rect {
    const { stroke, fill, text } = roleSwatch(role, this.theme);
    const rid = this.id("rect");
    const tid = this.id("text");
    this.elements.push({
      ...BASE,
      id: rid,
      type: "rectangle",
      x,
      y,
      width: w,
      height: h,
      strokeColor: stroke,
      backgroundColor: fill,
      roundness: { type: 3 },
      boundElements: [{ type: "text", id: tid }],
    });
    this.elements.push({
      ...BASE,
      id: tid,
      type: "text",
      x: x + 8,
      y: y + h / 2 - 12,
      width: w - 16,
      height: 24,
      strokeColor: text,
      backgroundColor: "transparent",
      strokeWidth: 1,
      roundness: null,
      boundElements: [],
      text: label,
      fontSize: 16,
      fontFamily: 1, // Virgil (hand-drawn)
      textAlign: "center",
      verticalAlign: "middle",
      containerId: rid,
      originalText: label,
      lineHeight: 1.25,
    });
    return { id: rid, x, y, w, h };
  }

  /** A subgraph frame: an unfilled container box with a label, in the theme's container hue. */
  container(x: number, y: number, w: number, h: number, label: string): Rect {
    const { stroke, fill, text } = containerSwatch(this.theme);
    const rid = this.id("container");
    const tid = this.id("caption");
    this.elements.push({
      ...BASE,
      id: rid,
      type: "rectangle",
      x,
      y,
      width: w,
      height: h,
      strokeColor: stroke,
      backgroundColor: fill,
      strokeWidth: 1,
      roundness: { type: 3 },
      boundElements: [],
    });
    this.elements.push({
      ...BASE,
      id: tid,
      type: "text",
      x: x + 12,
      y: y + 8,
      width: w - 24,
      height: 20,
      strokeColor: text,
      backgroundColor: "transparent",
      strokeWidth: 1,
      roundness: null,
      boundElements: [],
      text: label,
      fontSize: 14,
      fontFamily: 1,
      textAlign: "left",
      verticalAlign: "top",
      containerId: null,
      originalText: label,
      lineHeight: 1.25,
    });
    return { id: rid, x, y, w, h };
  }

  /** Free-floating caption, coloured by the theme's line colour. */
  caption(x: number, y: number, w: number, text: string): void {
    const { line } = frameColors(this.theme);
    this.elements.push({
      ...BASE,
      id: this.id("cap"),
      type: "text",
      x,
      y,
      width: w,
      height: 22,
      strokeColor: line,
      backgroundColor: "transparent",
      strokeWidth: 1,
      roundness: null,
      boundElements: [],
      text,
      fontSize: 16,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: null,
      originalText: text,
      lineHeight: 1.25,
    });
  }

  /** Straight arrow between two rects, entering/exiting on the nearer face. */
  arrow(from: Rect, to: Rect, opts?: { dashed?: boolean; bind?: boolean }): void {
    const { line } = frameColors(this.theme);
    const bind = opts?.bind ?? true;
    const c = (r: Rect, ax: number, ay: number): [number, number] => [
      r.x + r.w * ax,
      r.y + r.h * ay,
    ];
    const dx = to.x + to.w / 2 - (from.x + from.w / 2);
    const dy = to.y + to.h / 2 - (from.y + from.h / 2);
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const [sx, sy] = horizontal ? c(from, dx > 0 ? 1 : 0, 0.5) : c(from, 0.5, dy > 0 ? 1 : 0);
    const [ex, ey] = horizontal ? c(to, dx > 0 ? 0 : 1, 0.5) : c(to, 0.5, dy > 0 ? 0 : 1);
    this.elements.push({
      ...BASE,
      id: this.id("arrow"),
      type: "arrow",
      x: sx,
      y: sy,
      width: ex - sx,
      height: ey - sy,
      strokeColor: line,
      backgroundColor: "transparent",
      strokeStyle: opts?.dashed ? "dashed" : "solid",
      roundness: { type: 2 },
      points: [
        [0, 0],
        [ex - sx, ey - sy],
      ],
      startBinding: bind ? { elementId: from.id, focus: 0, gap: 4 } : null,
      endBinding: bind ? { elementId: to.id, focus: 0, gap: 4 } : null,
      startArrowhead: null,
      endArrowhead: "arrow",
    });
  }

  /** Lay out a horizontal row of same-baseline boxes starting at (x, y), `gap` px apart. */
  row(
    x: number,
    y: number,
    gap: number,
    boxes: { label: string; role: Role; w: number; h: number }[]
  ): Rect[] {
    const rects: Rect[] = [];
    let cursor = x;
    for (const spec of boxes) {
      rects.push(this.box(cursor, y, spec.w, spec.h, spec.label, spec.role));
      cursor += spec.w + gap;
    }
    return rects;
  }

  /** The finished scene, ready for `renderSceneToSvg`. */
  scene(): object {
    return {
      type: "excalidraw",
      version: 2,
      source: "prerender-diagrams",
      elements: this.elements,
      appState: { viewBackgroundColor: "transparent", gridSize: null },
      files: {},
    };
  }
}

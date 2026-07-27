// Derives a dark-theme Excalidraw scene from a light-authored one. A
// `.excalidraw` file is authored once, in the light palette; this is the
// only new concept the native-JSON pipeline adds over the old `Builder`
// (which used to emit both themes' colours directly). See
// `scripts/diagram-lib/palette.ts` for the swap tables and the off-palette
// gate this relies on.

import { darkenHex } from "./palette.ts";

interface ExcalidrawElement {
  type?: string;
  backgroundColor?: string;
  strokeColor?: string;
  [key: string]: unknown;
}

interface ExcalidrawScene {
  elements?: ExcalidrawElement[];
  [key: string]: unknown;
}

/**
 * Deep-clone `scene` and rewrite every element's `backgroundColor` /
 * `strokeColor` to its dark-theme equivalent. Geometry, ids, bindings, and
 * `files` are left untouched. Throws if any colour is off-palette (see
 * `darkenHex`).
 */
export function toDarkScene(scene: object): object {
  const clone = structuredClone(scene) as ExcalidrawScene;
  for (const el of clone.elements ?? []) {
    if (el.backgroundColor !== undefined) {
      el.backgroundColor = darkenHex(el.backgroundColor, "fill");
    }
    if (el.strokeColor !== undefined) {
      el.strokeColor = darkenHex(el.strokeColor, el.type === "text" ? "text" : "stroke");
    }
  }
  return clone;
}

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { clampMeterValue, Meter } from "./meter";

/**
 * FR-6, D-8: the MVP-Progress meter fill binds `bg-primary`, deliberately NOT
 * a Status hue, so MVP Progress and Status read as two independent signals
 * (spec.md meter-legend-label). Token color is not visually testable in
 * Storybook alone, hence this behavior-level assertion (task 002 approach).
 */
describe("meter fill uses bg-primary, not a status hue (FR-6, D-8)", () => {
  it.each([0, 50, 100])("at value %d, the fill carries bg-primary", (value) => {
    const html = renderToStaticMarkup(<Meter value={value} />);

    expect(html).toMatch(/data-slot="meter-fill"[^>]*class="[^"]*\bbg-primary\b/);
  });

  it.each([0, 50, 100])("at value %d, the fill never carries a status-hue class", (value) => {
    const html = renderToStaticMarkup(<Meter value={value} />);

    expect(html).not.toMatch(/bg-badge-/);
    expect(html).not.toMatch(/bg-destructive/);
  });

  it("reflects the clamped value via aria-valuenow", () => {
    const html = renderToStaticMarkup(<Meter value={50} />);

    expect(html).toMatch(/aria-valuenow="50"/);
  });

  it.each([
    [-10, 0],
    [0, 0],
    [50, 50],
    [100, 100],
    [150, 100],
  ])("clampMeterValue(%d) clamps to %d", (input, expected) => {
    expect(clampMeterValue(input)).toBe(expected);
  });
});

/**
 * spec.md meter-legend-label: the meter shows a legend/label framing the
 * value as progress toward first usable release, at 0, a mid value, and 100.
 */
describe("meter shows a progress-to-first-usable-release legend (meter-legend-label)", () => {
  it.each([
    [0, "0% to first usable release"],
    [50, "50% to first usable release"],
    [100, "100% to first usable release"],
  ])("at value %d, the legend reads %j", (value, expectedText) => {
    const html = renderToStaticMarkup(<Meter value={value} />);

    expect(html).toContain(expectedText);
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { clampMeterValue, Meter } from "./meter";

/**
 * FR-6, FR-10: the Milestone Progress meter fill binds `bg-primary`,
 * deliberately NOT a Status hue, so Milestone Progress and Feature Status
 * read as two independent signals.
 */
describe("meter fill uses bg-primary, not a status hue (FR-6, FR-10)", () => {
  it.each([0, 50, 100])("at value %d, the fill carries bg-primary", (value) => {
    const html = renderToStaticMarkup(<Meter value={value} legend="test legend" />);

    expect(html).toMatch(/data-slot="meter-fill"[^>]*class="[^"]*\bbg-primary\b/);
  });

  it.each([0, 50, 100])("at value %d, the fill never carries a status-hue class", (value) => {
    const html = renderToStaticMarkup(<Meter value={value} legend="test legend" />);

    expect(html).not.toMatch(/bg-badge-/);
    expect(html).not.toMatch(/bg-destructive/);
  });

  it("reflects the clamped value via aria-valuenow", () => {
    const html = renderToStaticMarkup(<Meter value={50} legend="test legend" />);

    expect(html).toMatch(/aria-valuenow="50"/);
  });

  it("gives the progressbar an accessible name via aria-label and aria-valuetext (finding 6)", () => {
    const html = renderToStaticMarkup(<Meter value={50} legend="50% to MVP" />);

    expect(html).toMatch(/aria-label="50% to MVP"/);
    expect(html).toMatch(/aria-valuetext="50% to MVP"/);
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

describe("meter renders the caller-authored legend, with no hardcoded copy", () => {
  it.each([
    ["0% to MVP"],
    ["50% to MVP"],
    ["Maturity reached"],
  ])("renders the legend %j verbatim", ([legendText]) => {
    const html = renderToStaticMarkup(<Meter value={50} legend={legendText as string} />);

    expect(html).toContain(legendText);
  });

  it("renders the bar and legend in one inline row", () => {
    const html = renderToStaticMarkup(<Meter value={50} legend="50% to MVP" />);

    expect(html).toMatch(/data-slot="meter-group"[^>]*class="[^"]*\bflex\b[^"]*\bitems-center\b/);
  });
});

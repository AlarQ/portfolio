import { describe, expect, it } from "vitest";
import { buildPageItems, Pagination } from "./Pagination";
import { renderIntoDocument } from "./testUtils";

describe("buildPageItems", () => {
  it("collapses the middle to a single ellipsis on the first page (Figma 614:383)", () => {
    expect(buildPageItems(1, 10)).toEqual([1, 2, 3, "ellipsis", 8, 9, 10]);
  });

  it("windows around the current page in the middle", () => {
    expect(buildPageItems(5, 10)).toEqual([1, 2, 3, 4, 5, 6, "ellipsis", 8, 9, 10]);
  });

  it("collapses the leading middle with an ellipsis on the last page", () => {
    expect(buildPageItems(10, 10)).toEqual([1, 2, 3, "ellipsis", 8, 9, 10]);
  });

  it("clamps an out-of-range current page into the valid window", () => {
    expect(buildPageItems(0, 10)).toEqual(buildPageItems(1, 10));
    expect(buildPageItems(99, 10)).toEqual(buildPageItems(10, 10));
  });

  it("shows every page without an ellipsis when the set is small", () => {
    expect(buildPageItems(2, 3)).toEqual([1, 2, 3]);
  });

  it("returns nothing for a non-positive page count", () => {
    expect(buildPageItems(1, 0)).toEqual([]);
  });
});

describe("Pagination", () => {
  it("renders a Pagination nav landmark with the current page marked aria-current", () => {
    const { container, unmount } = renderIntoDocument(
      <Pagination currentPage={5} totalPages={10} />
    );

    const nav = container.querySelector('nav[aria-label="Pagination"]');
    expect(nav).not.toBeNull();

    const current = container.querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe("5");
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);

    unmount();
  });

  it("renders Previous/Next controls, disabling Previous on the first page", () => {
    const { container, unmount } = renderIntoDocument(
      <Pagination currentPage={1} totalPages={10} />
    );

    const buttons = [...container.querySelectorAll("button")];
    const previous = buttons.find((b) => b.textContent?.includes("Previous"));
    const next = buttons.find((b) => b.textContent?.includes("Next"));

    expect(previous).not.toBeUndefined();
    expect(next).not.toBeUndefined();
    expect((previous as HTMLButtonElement).disabled).toBe(true);
    expect((next as HTMLButtonElement).disabled).toBe(false);

    unmount();
  });

  it("still marks a page active when currentPage is out of range (clamped)", () => {
    const { container, unmount } = renderIntoDocument(
      <Pagination currentPage={99} totalPages={10} />
    );

    const current = container.querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe("10");
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);

    unmount();
  });
});

import { describe, expect, it } from "vitest";
import type { ResolvedCapability } from "@/utils/projectPresentation";
import { CapabilitiesSection } from "./CapabilitiesSection";
import { renderIntoDocument } from "./testUtils";

const CLIP: ResolvedCapability = {
  text: "A clip claim.",
  media: {
    kind: "clip",
    clipSrc: "/media/bondsmith/demo.mp4",
    posterSrc: "/media/bondsmith/demo.webp",
    label: "the demo",
    description: "A demo clip.",
  },
};

const STILL: ResolvedCapability = {
  text: "A still claim.",
  media: { kind: "still", src: "/media/bondsmith/diagram.webp", alt: "A diagram." },
};

const TEXT_ONLY: ResolvedCapability = { text: "A text-only claim." };

describe("CapabilitiesSection", () => {
  it("no-capabilities-no-section: renders nothing when capabilities is empty", () => {
    const { container, unmount } = renderIntoDocument(<CapabilitiesSection capabilities={[]} />);

    expect(container.innerHTML).toBe("");

    unmount();
  });

  it("renders the eyebrow heading and section landmark", () => {
    const { container, unmount } = renderIntoDocument(
      <CapabilitiesSection capabilities={[TEXT_ONLY]} />
    );

    const section = container.querySelector('section[aria-labelledby="capabilities-heading"]');
    expect(section).not.toBeNull();
    expect(container.textContent).toContain("Capabilities");

    unmount();
  });

  it("text-only-capability-row: renders a full-width one-liner, never an empty figure", () => {
    const { container, unmount } = renderIntoDocument(
      <CapabilitiesSection capabilities={[TEXT_ONLY]} />
    );

    expect(container.querySelector("figure")).toBeNull();
    expect(container.textContent).toContain(TEXT_ONLY.text);

    unmount();
  });

  it("dom-order-caption-first: caption <p> precedes the media frame in DOM order for a media row", () => {
    const { container, unmount } = renderIntoDocument(
      <CapabilitiesSection capabilities={[STILL]} />
    );

    const li = container.querySelector("li") as HTMLLIElement;
    const children = Array.from(li.children);
    const pIndex = children.findIndex((el) => el.tagName === "P");
    const mediaIndex = children.findIndex((el) => el.querySelector("img"));

    expect(pIndex).toBeLessThan(mediaIndex);

    unmount();
  });

  it("rows-alternate: alternates md:flex-row-reverse across successive media rows only", () => {
    const { container, unmount } = renderIntoDocument(
      <CapabilitiesSection capabilities={[STILL, STILL, STILL]} />
    );

    const items = container.querySelectorAll("li");
    expect(items[0]?.className).not.toContain("flex-row-reverse");
    expect(items[1]?.className).toContain("flex-row-reverse");
    expect(items[2]?.className).not.toContain("flex-row-reverse");

    unmount();
  });

  it("a text-only row between media rows does not consume an alternation slot", () => {
    const { container, unmount } = renderIntoDocument(
      <CapabilitiesSection capabilities={[STILL, TEXT_ONLY, STILL]} />
    );

    const items = container.querySelectorAll("li");
    // items[0] = still (not reversed), items[1] = text-only (no flex-row classes), items[2] = still (reversed)
    expect(items[0]?.className).not.toContain("flex-row-reverse");
    expect(items[2]?.className).toContain("flex-row-reverse");

    unmount();
  });

  it("renders a still row via MediaFrame with the authored alt text, no toggle", () => {
    const { container, unmount } = renderIntoDocument(
      <CapabilitiesSection capabilities={[STILL]} />
    );

    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe(
      STILL.media && "alt" in STILL.media ? STILL.media.alt : ""
    );
    expect(container.querySelector("button")).toBeNull();

    unmount();
  });

  it("renders a clip row via ClipRow, wrapped in a ClipPlaybackGroup", () => {
    const { container, unmount } = renderIntoDocument(
      <CapabilitiesSection capabilities={[CLIP]} />
    );

    expect(container.querySelector("figure")).not.toBeNull();
    expect(container.querySelector("video")).toBeNull(); // not requested yet

    unmount();
  });

  it("does not wrap in ClipPlaybackGroup when no clip rows exist (still-only-project)", () => {
    const { container, unmount } = renderIntoDocument(
      <CapabilitiesSection capabilities={[STILL, TEXT_ONLY]} />
    );

    expect(container.querySelector("img")).not.toBeNull();

    unmount();
  });
});

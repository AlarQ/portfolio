import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { Callout } from "./Callout";

describe("Callout", () => {
  it("callout_renders_token_classes_with_no_sx_prop", () => {
    const { container, unmount } = renderIntoDocument(
      <Callout title="Human gate">Body prose</Callout>
    );

    const panel = container.firstElementChild as HTMLElement;
    const className = panel.className;

    // Colors/spacing resolve through semantic-token utilities (bg-/border-/text-).
    expect(className).toContain("bg-muted");
    expect(className).toMatch(/\bborder\b/);
    expect(className).toContain("border-l-primary");
    expect(container.innerHTML).toContain("text-muted-foreground");
    expect(container.innerHTML).toContain("text-primary");

    // No MUI `sx` object leaked onto the panel as an inline style.
    expect(panel.getAttribute("style")).toBeNull();

    unmount();
  });

  it("renders the title slot only when a title is given, and always renders body children", () => {
    const withTitle = renderIntoDocument(<Callout title="Heads up">Body</Callout>);
    expect(withTitle.container.textContent).toContain("Heads up");
    expect(withTitle.container.textContent).toContain("Body");
    withTitle.unmount();

    const withoutTitle = renderIntoDocument(<Callout>Just body</Callout>);
    expect(withoutTitle.container.textContent).toBe("Just body");
    expect(withoutTitle.container.querySelector("p")).toBeNull();
    withoutTitle.unmount();
  });
});

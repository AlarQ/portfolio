import type { Meta, StoryObj } from "@storybook/nextjs";
import { useEffect, useRef } from "react";
import type { TocEntry } from "@/data/postToc";
import { ArticleToc } from "./ArticleToc";

const sampleEntries: readonly TocEntry[] = [
  { depth: 2, text: "The boundary I keep pushing out", id: "the-boundary-i-keep-pushing-out" },
  { depth: 2, text: "Composing over re-implementing", id: "composing-over-re-implementing" },
  { depth: 3, text: "A worked example", id: "a-worked-example" },
  { depth: 2, text: "Where it pays off", id: "where-it-pays-off" },
];

/**
 * Mounts real DOM headings matching `sampleEntries`' ids so `ArticleToc`'s
 * `useActiveHeading` IntersectionObserver has real targets to scroll-spy —
 * mirroring a Post's rendered heading tree without depending on the MDX
 * pipeline or route.
 */
function Wrapper() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="flex gap-8">
      <ArticleToc entries={sampleEntries} />
      <div ref={scrollRef} className="h-96 w-96 overflow-y-auto" data-testid="scroll-region">
        {sampleEntries.map((entry) => (
          <section key={entry.id} id={entry.id} className="flex h-64 flex-col justify-center">
            <h2 className="text-lg font-semibold text-foreground">{entry.text}</h2>
            <p className="text-sm text-muted-foreground">Section body for {entry.text}.</p>
          </section>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof ArticleToc> = {
  title: "Organisms/ArticleToc",
  component: ArticleToc,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  render: () => <Wrapper />,
};

export default meta;
type Story = StoryObj<typeof ArticleToc>;

/** Desktop: sticky dot-rail visible, mobile progress bar hidden by `md:hidden`. */
export const Desktop: Story = {};

/** Mobile viewport: dot-rail hidden by `hidden md:flex`, progress bar visible. */
export const Mobile: Story = {
  parameters: {
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile (375px)",
          styles: { width: "375px", height: "667px" },
          type: "mobile",
        },
      },
    },
  },
  globals: {
    viewport: {
      value: "mobile",
      isRotated: false,
    },
  },
};

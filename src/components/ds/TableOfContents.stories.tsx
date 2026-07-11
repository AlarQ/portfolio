import type { Meta, StoryObj } from "@storybook/nextjs";
import type { TocEntry } from "@/data/postToc";
import { TableOfContents } from "./TableOfContents";

/**
 * Page-agnostic fixture: a heading tree shaped like a real Post's ToC (## and
 * ### entries), local to the story so no route/loader dependency leaks in.
 */
const sampleEntries: readonly TocEntry[] = [
  { depth: 2, text: "The boundary I keep pushing out", id: "the-boundary-i-keep-pushing-out" },
  { depth: 2, text: "Composing over re-implementing", id: "composing-over-re-implementing" },
  { depth: 3, text: "A worked example", id: "a-worked-example" },
  { depth: 3, text: "Reading it back", id: "reading-it-back" },
  { depth: 2, text: "Where it pays off", id: "where-it-pays-off" },
];

const meta: Meta<typeof TableOfContents> = {
  title: "Molecules/TableOfContents",
  component: TableOfContents,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 260 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TableOfContents>;

export const Default: Story = {
  args: { entries: sampleEntries },
};

export const Empty: Story = {
  args: { entries: [] },
};

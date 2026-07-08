import type { Meta, StoryObj } from "@storybook/nextjs";
import { Pagination } from "./Pagination";

// Dark is a toolbar concern, not a separate story: flip the Theme toolbar.
const meta: Meta<typeof Pagination> = {
  title: "Molecules/Pagination",
  component: Pagination,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[1216px] px-6 py-6">
        <Story />
      </div>
    ),
  ],
  args: { totalPages: 10 },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

/** First page — Previous is disabled; trailing `…` collapses the middle. */
export const FirstPage: Story = {
  args: { currentPage: 1 },
};

/** Middle page — `…` truncation on the leading side, window around current. */
export const MiddlePage: Story = {
  args: { currentPage: 5 },
};

/** Last page — Next is disabled; leading `…` collapses the middle. */
export const LastPage: Story = {
  args: { currentPage: 10 },
};

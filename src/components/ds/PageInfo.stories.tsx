import type { Meta, StoryObj } from "@storybook/nextjs";
import { samplePost } from "@/stories/fixtures/posts";
import { PageInfo } from "./PageInfo";

const meta: Meta<typeof PageInfo> = {
  title: "Molecules/PageInfo",
  component: PageInfo,
};

export default meta;
type Story = StoryObj<typeof PageInfo>;

export const Default: Story = {
  args: {
    formattedDate: samplePost.formattedDate,
    readingTimeMinutes: samplePost.readingTimeMinutes,
    category: "Design Systems",
  },
};

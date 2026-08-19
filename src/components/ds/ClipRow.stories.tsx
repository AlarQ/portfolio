import type { Meta, StoryObj } from "@storybook/nextjs";
import { userEvent, within } from "storybook/test";
import { clipSrc, posterSrc } from "@/components/storybook-fixtures/projects";
import { ClipPlaybackGroup, ClipRow } from "./ClipRow";

const meta: Meta<typeof ClipRow> = {
  title: "Molecules/ClipRow",
  component: ClipRow,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <ClipPlaybackGroup>
        <Story />
      </ClipPlaybackGroup>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ClipRow>;

/** Idle - poster shown, `<video>` not yet mounted (zero-video-bytes-until-play). */
export const Poster: Story = {
  args: {
    id: "flow-chain",
    clipSrc,
    posterSrc,
    label: "the Plan to Ship flow chain",
    description: "Walking through a feature moving from Plan to Ship in the flowctl CLI.",
    index: 1,
    total: 1,
  },
};

/** First row in a group - eligible for `priority` poster loading. */
export const Priority: Story = {
  args: {
    ...Poster.args,
    priority: true,
  },
};

/** Reduced motion: `matchMedia('(prefers-reduced-motion: reduce)')` mocked to
 *  match - no autoplay, no loop, `ended` returns the label to Play. */
export const ReducedMotion: Story = {
  args: Poster.args,
  parameters: {
    // Storybook addon or manual mock consumers can key off this flag; the
    // component itself reads prefers-reduced-motion via matchMedia.
    reducedMotion: true,
  },
  decorators: [
    (Story) => {
      if (typeof window !== "undefined") {
        window.matchMedia = ((query: string) => ({
          matches: query.includes("prefers-reduced-motion"),
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        })) as typeof window.matchMedia;
      }
      return (
        <ClipPlaybackGroup>
          <Story />
        </ClipPlaybackGroup>
      );
    },
  ],
};

/** Play requested - the `<video>` mounts and, while it loads, the toggle is
 *  `aria-busy`. */
export const Loading: Story = {
  args: Poster.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Play/ }));
  },
};

/** Playing - the toggle's accessible name flips to `Pause …` once playback
 *  starts (or is requested, in the Storybook browser's best-effort case). */
export const Playing: Story = {
  args: Poster.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Play/ }));
    await canvas.findByRole("button", { name: /^Pause/ }).catch(() => {});
  },
};

/** Hand-paused: clicked Play then Pause - the row stays paused even though
 *  it is still the most-visible row in the group (sticky-pause). */
export const HandPaused: Story = {
  args: Poster.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Play/ }));
    const pauseButton = await canvas.findByRole("button", { name: /^Pause/ });
    await userEvent.click(pauseButton);
  },
};

/** Comparison: a still Capability row has no play toggle at all - see
 *  `Atoms/MediaFrame` and `Molecules/CapabilitiesSection`'s "still rows"
 *  story for the still-only shape (no toggle, `alt` text). */
export const StillComparisonNote: Story = {
  args: Poster.args,
  parameters: {
    docs: {
      description: {
        story: "A still Capability row omits `ClipRow` entirely and renders `MediaFrame` alone.",
      },
    },
  },
};

/** Three rows sharing one `ClipPlaybackGroup` - only the most-visible row
 *  autoplays; a hand-paused row stays paused even if it becomes most visible. */
export const Group: Story = {
  render: () => (
    <ClipPlaybackGroup>
      <div className="flex flex-col gap-10">
        <ClipRow
          id="row-1"
          clipSrc={clipSrc}
          posterSrc={posterSrc}
          label="the first clip"
          description="First clip in the group."
          index={1}
          total={3}
          priority
        />
        <ClipRow
          id="row-2"
          clipSrc={clipSrc}
          posterSrc={posterSrc}
          label="the second clip"
          description="Second clip in the group."
          index={2}
          total={3}
        />
        <ClipRow
          id="row-3"
          clipSrc={clipSrc}
          posterSrc={posterSrc}
          label="the third clip"
          description="Third clip in the group."
          index={3}
          total={3}
        />
      </div>
    </ClipPlaybackGroup>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  bondsmithFixture,
  clipSrc,
  emptyCapabilitiesFixture,
  hyperionFixture,
  posterSrc,
} from "@/components/storybook-fixtures/projects";
import { resolveCapabilityMedia } from "@/utils/projectPresentation";
import { CapabilitiesSection } from "./CapabilitiesSection";

const meta: Meta<typeof CapabilitiesSection> = {
  title: "Organisms/CapabilitiesSection",
  component: CapabilitiesSection,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof CapabilitiesSection>;

/** Clip-led Capabilities (Bondsmith fixture) - alternating clip rows. */
export const ClipRows: Story = {
  args: {
    capabilities: resolveCapabilityMedia(bondsmithFixture).filter((c) => c.media?.kind === "clip"),
  },
};

/** Still-led Capabilities (Hyperion fixture). */
export const StillRows: Story = {
  args: {
    capabilities: resolveCapabilityMedia(hyperionFixture),
  },
};

/** Text-only Capability rows - full-width one-liners, never an empty slot. */
export const TextOnly: Story = {
  args: {
    capabilities: [
      { text: "The flowctl CLI is a thin clap shell over bondsmith-core." },
      { text: "There is no assert-and-warn escape hatch on a failed postcondition." },
    ],
  },
};

/** Mixed clip, still, and text-only rows (full Bondsmith fixture). */
export const Mixed: Story = {
  args: {
    capabilities: resolveCapabilityMedia(bondsmithFixture),
  },
};

/** Empty Capabilities - the section renders nothing (no-capabilities-no-section). */
export const Empty: Story = {
  args: {
    capabilities: resolveCapabilityMedia(emptyCapabilitiesFixture),
  },
};

/** Fixture sanity story pinning the fixture media URLs used above. */
export const FixtureMediaNote: Story = {
  args: {
    capabilities: [
      {
        text: "Fixture clip row.",
        media: {
          kind: "clip",
          clipSrc,
          posterSrc,
          label: "the fixture clip",
          description: "A fixture clip used only in Storybook/tests.",
        },
      },
    ],
  },
};

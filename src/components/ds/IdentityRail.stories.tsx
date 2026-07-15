import type { Meta, StoryObj } from "@storybook/nextjs";
import type { GalleryPhoto } from "@/data/profile";
import { mobileViewportParameters } from "@/stories/mobileViewport";
import { IdentityRail } from "./IdentityRail";

const PORTRAIT = { src: "/images/profile.jpg", alt: "Ernest Bednarczyk" };

/** All placeholder tiles — the state photo slots ship in before their files land. */
const PLACEHOLDER_GALLERY: readonly GalleryPhoto[] = [
  { alt: "My dog on a trail" },
  { alt: "Second pet portrait" },
  { alt: "Outdoors / hiking" },
];

/** Gallery entries carrying a real `src` — proves the real-image branch. */
const PHOTO_GALLERY: readonly GalleryPhoto[] = [
  { src: "/images/profile.jpg", alt: "My dog on a trail" },
  { src: "/images/profile.jpg", alt: "Second pet portrait" },
  { src: "/images/profile.jpg", alt: "Outdoors / hiking" },
];

const meta: Meta<typeof IdentityRail> = {
  title: "Organisms/IdentityRail",
  component: IdentityRail,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    portrait: PORTRAIT,
    galleryPhotos: PLACEHOLDER_GALLERY,
    name: "Ernest Bednarczyk",
    title: "SOFTWARE ENGINEER",
    subtitle: "TEAM LEADER",
  },
};

export default meta;
type Story = StoryObj<typeof IdentityRail>;

/** All placeholder gallery tiles (no `src`). */
export const Default: Story = {};

/** No gallery photos at all — the grid renders empty, portrait + identity stand alone. */
export const EmptyGallery: Story = {
  args: { galleryPhotos: [] },
};

/** Gallery entries with real `src` — the `<Image>` branch renders instead of tiles. */
export const WithPhotos: Story = {
  args: { galleryPhotos: PHOTO_GALLERY },
};

/** Long name/title — checks the identity text wraps without clipping. */
export const LongName: Story = {
  args: {
    name: "Ernest Aleksander Bednarczyk-Kowalski",
    title: "SENIOR STAFF SOFTWARE ENGINEER",
    subtitle: "ENGINEERING TEAM LEADER",
  },
};

/** Figma "iPhone 15" mobile frame (390x844) — the rail before it goes sticky. */
export const Mobile: Story = {
  parameters: mobileViewportParameters,
};

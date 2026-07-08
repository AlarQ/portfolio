import type { Meta, StoryObj } from "@storybook/nextjs";
import type { FooterLink } from "@/data/footerLinks";
import { Footer } from "./Footer";

const meta: Meta<typeof Footer> = {
  title: "Organisms/Footer",
  component: Footer,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Footer>;

/** Wide viewport: single left-aligned row (Figma 614:668). */
export const Default: Story = {};

/** Narrow container: menu stacks and centers, copyright drops below (614:2227). */
export const Narrow: Story = {
  decorators: [
    (StoryFn) => (
      <div style={{ maxWidth: 390 }}>
        <StoryFn />
      </div>
    ),
  ],
};

const customLinks: readonly FooterLink[] = [
  { label: "GitHub", href: "https://github.com/example", icon: "linkedin" },
  { label: "Email", href: "mailto:hello@example.com", icon: "email" },
];

/** Proves the menu is prop-driven, not hardcoded. */
export const CustomLinks: Story = {
  args: { links: customLinks, copyrightName: "Jane Doe" },
};

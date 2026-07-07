/**
 * Story `parameters` fragment selecting the Figma "iPhone 15" mobile frame
 * (390x844, declared in `.storybook/preview.tsx`) for a story's `Mobile`
 * export. Shared by the Pages pack (task 007) so every page's mobile variant
 * points at the same named viewport instead of four independent literals.
 */
export const mobileViewportParameters = {
  viewport: {
    defaultViewport: "iphone15",
  },
} as const;

import { brand, withAlpha } from "@/theme/theme";

/**
 * Single seam for how the navigation is presented. The brand gradients and nav
 * link colors live here once, so the two nav adapters (`DesktopNav`,
 * `MobileNav`) consume the same source and cannot drift apart. Built from
 * `brand` tokens, never raw hex.
 */

/** Background gradient for the logo tile (light → mid → dark sky). */
export const logoGradient = `linear-gradient(135deg, ${brand.skyLight} 0%, ${brand.sky} 50%, ${brand.skyDark} 100%)`;

/** Glow shadow cast under the logo tile. */
export const logoShadow = `0 4px 12px ${brand.skyGlow}`;

/** Foreground color of the logo monogram, shared by both nav adapters. */
export const logoTextColor = brand.white;

/** Elevation shadow under the floating nav bar. */
export const navBarShadow = `0 8px 32px ${brand.scrim}, 0 2px 8px ${withAlpha(brand.black, 0.3)}`;

/** Elevation shadow cast by the open mobile drawer. */
export const drawerShadow = `-8px 0 32px ${brand.scrim}`;

/** Gradient for the site-name wordmark (white → light slate). */
export const nameGradient = `linear-gradient(135deg, ${brand.white} 0%, ${brand.slateLight} 100%)`;

/** Foreground color of a nav link, by active state. */
export function navLinkColor(isActive: boolean): string {
  return isActive ? brand.skyLight : brand.sky;
}

/** Foreground color of a nav link on hover. */
export const navLinkHoverColor = brand.skyLighter;

/** Background tint shown behind the hamburger button on hover. */
export const navHoverBg = brand.skyTint;

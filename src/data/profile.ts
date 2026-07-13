/**
 * One narrative competence area shown on `/author` (e.g. team leadership,
 * software engineering). Deliberately **narrative prose** — this is author
 * copy, NOT the CONTEXT.md "Domain Area" concept (a field evidenced by
 * Achievements and rated by Skills); the surface overlap in wording is
 * incidental and must not be reconciled into that model. Prose + short
 * highlight chips — no icons/colors here; any visual resolution belongs in a
 * presentation seam.
 */
export interface ExperienceArea {
  heading: string;
  body: string;
  highlights: string[];
}

/**
 * A photo slot in the `/author` gallery. `src` is optional: a slot without a
 * file yet renders as a labeled placeholder tile until the image lands under
 * `public/images/`.
 */
export interface GalleryPhoto {
  src?: string;
  alt: string;
}

export interface OwnerProfile {
  /**
   * The owner's display name — the single source of the human identity shown
   * on `/author` (FR-6). Kept distinct from `imageAlt`: identity must not leak
   * through an alt-text field, so consumers read `name`, never `imageAlt`.
   */
  name: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  /** Short first-person introduction for the `/author` About section. */
  bio: string;
  experienceAreas: ExperienceArea[];
  /** Secondary photos (pets, outdoors) shown as thumbnails under the portrait. */
  galleryPhotos: GalleryPhoto[];
}

export const ownerProfile: OwnerProfile = {
  name: "Ernest Bednarczyk",
  imageSrc: "/images/profile.jpg",
  imageAlt: "Ernest Bednarczyk",
  title: "SOFTWARE ENGINEER",
  subtitle: "TEAM LEADER",
  bio: "I'm a software engineer and team leader based in Poland. Outside of work you'll usually find me outdoors with my dogs — hiking, trail running, or just getting lost somewhere green. This page is the person behind the code: who I am, how I lead, and how I build.",
  experienceAreas: [
    {
      heading: "Leading teams",
      body: "Three-plus years leading engineering teams of up to 14 people. I care about clear ownership, short feedback loops, and growing engineers into people who don't need me. Roadmaps, 1:1s, hiring, and keeping delivery honest without burning anyone out.",
      highlights: [
        "14 engineers led across product teams",
        "Hiring, onboarding & growth paths",
        "Delivery planning that survives contact with reality",
      ],
    },
    {
      heading: "Building software",
      body: "Six-plus years shipping web software, currently deep in the TypeScript/React/Next.js world. I like small pure functions, explicit seams, and codebases a new hire can navigate in a day. Strong opinions on testing, loosely held on everything else.",
      highlights: [
        "TypeScript, React, Next.js, Node",
        "Design systems & token-driven UI",
        "Testing as a design pressure, not a chore",
      ],
    },
  ],
  galleryPhotos: [
    { alt: "My dog on a trail" },
    { alt: "Second pet portrait" },
    { alt: "Outdoors / hiking" },
  ],
};

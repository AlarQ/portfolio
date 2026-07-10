export interface Stat {
  value: string;
  label: string;
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
  stats: Stat[];
}

export const ownerProfile: OwnerProfile = {
  name: "Ernest Bednarczyk",
  imageSrc: "/images/profile.jpg",
  imageAlt: "Ernest Bednarczyk",
  title: "SOFTWARE ENGINEER",
  subtitle: "TEAM LEADER",
  stats: [
    { value: "6+", label: "Years of Experience" },
    { value: "14", label: "Engineers Led" },
    { value: "3+", label: "Years Leading Teams" },
  ],
};

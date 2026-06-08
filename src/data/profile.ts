export interface Stat {
  value: string;
  label: string;
}

export interface OwnerProfile {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  stats: Stat[];
}

export const ownerProfile: OwnerProfile = {
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

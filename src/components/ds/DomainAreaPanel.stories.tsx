import type { Meta, StoryObj } from "@storybook/nextjs";
import type { DomainArea } from "@/data/domains";
import { DomainAreaPanel } from "./DomainAreaPanel";

const DOMAIN: DomainArea = {
  id: "leadership",
  name: "Leadership",
  headline: "I lead full-stack engineering teams to predictable, end-to-end delivery.",
  achievements: [
    {
      id: "led-teams",
      description: "Led full-stack engineering teams of up to eight for three-plus years.",
    },
    {
      id: "go-live",
      description: "Shipped a three-month cross-team project to a clean production go-live.",
    },
  ],
  skills: [
    { name: "Team leadership", level: "expert", years: 3 },
    { name: "Delivery ownership", level: "expert" },
    { name: "Mentoring & 1:1s", level: "proficient" },
  ],
};

const meta: Meta<typeof DomainAreaPanel> = {
  title: "Organisms/DomainAreaPanel",
  component: DomainAreaPanel,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DomainAreaPanel>;

/** Full panel: headline card, Achievements, and rated Skill badges. */
export const Default: Story = {
  args: { domain: DOMAIN },
};

/** No Achievements - the Achievements group is omitted, not rendered blank. */
export const EmptyAchievements: Story = {
  args: { domain: { ...DOMAIN, achievements: [] } },
};

/** No Skills - the Skills group is omitted, not rendered blank. */
export const EmptySkills: Story = {
  args: { domain: { ...DOMAIN, skills: [] } },
};

/** Long achievement copy and many skills - checks wrapping and layout. */
export const LongContent: Story = {
  args: {
    domain: {
      ...DOMAIN,
      name: "Distributed Systems & Platform Engineering",
      headline:
        "I lead teams building high-throughput, low-latency distributed backend systems while owning delivery end-to-end and growing engineers.",
      achievements: [
        {
          id: "long-1",
          description:
            "Planned and shipped a three-month cross-team project spanning roughly a dozen engineers across multiple teams to a clean production go-live with significant positive financial impact.",
        },
        {
          id: "long-2",
          description:
            "Introduced structured retrospectives and technical discussions that measurably improved sprint predictability over successive quarters.",
        },
      ],
      skills: [
        { name: "Scala", level: "expert", years: 6 },
        { name: "Rust", level: "proficient", years: 3 },
        { name: "Microservices & distributed systems", level: "expert" },
        { name: "Kafka", level: "proficient" },
        { name: "Kubernetes", level: "proficient" },
        { name: "Google Cloud Platform", level: "proficient" },
      ],
    },
  },
};

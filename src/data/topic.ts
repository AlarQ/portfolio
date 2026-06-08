export interface Topic {
  title: string;
  descriptionBefore: string;
  descriptionAfter: string;
  link: { label: string; href: string };
}

export const currentTopic: Topic = {
  title:
    "Exploring OpenAgentsControl: AI Agent Framework for Approval-Based Development Workflows.",
  descriptionBefore: "Currently exploring ",
  descriptionAfter:
    " framework, an AI agent system for plan-first development workflows with approval-based execution. It provides pattern control, smart context discovery, and multi-language support (TypeScript, Python, Go, Rust) with built-in testing and validation.",
  link: {
    label: "Darren Hinde's OpenAgentsControl",
    href: "https://github.com/darrenhinde/OpenAgentsControl",
  },
};

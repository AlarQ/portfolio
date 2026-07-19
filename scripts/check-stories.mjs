// Storybook-first gate (see CLAUDE.md "Component workflow - Storybook first"):
// every component in the storied tiers must ship a sibling *.stories.tsx.
// Legacy components at the root of src/components/ are exempt until they
// migrate into a tier.
import { readdirSync } from "node:fs";
import { join } from "node:path";

const STORIED_TIERS = ["ui", "ds", "pages", "storybook-fixtures"];
const COMPONENTS_ROOT = join(process.cwd(), "src", "components");

const isComponentFile = (name) =>
  name.endsWith(".tsx") &&
  !name.endsWith(".stories.tsx") &&
  !name.endsWith(".test.tsx") &&
  name !== "testUtils.tsx";

const missingStoriesIn = (tier) => {
  const entries = readdirSync(join(COMPONENTS_ROOT, tier));
  return entries
    .filter(isComponentFile)
    .filter((name) => !entries.includes(name.replace(/\.tsx$/, ".stories.tsx")))
    .map((name) => join("src", "components", tier, name));
};

const missing = STORIED_TIERS.flatMap(missingStoriesIn);

if (missing.length > 0) {
  console.error("Components missing a sibling *.stories.tsx:\n");
  for (const file of missing) console.error(`  ${file}`);
  console.error(
    "\nStorybook-first: add a story covering the component's states before wiring it into a page (CLAUDE.md → Component workflow)."
  );
  process.exit(1);
}

console.log(`lint:stories - all components in [${STORIED_TIERS.join(", ")}] have stories.`);

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ApiIcon from "@mui/icons-material/Api";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildIcon from "@mui/icons-material/Build";
import CloudIcon from "@mui/icons-material/Cloud";
import CodeIcon from "@mui/icons-material/Code";
import DynamicFormIcon from "@mui/icons-material/DynamicForm";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GroupsIcon from "@mui/icons-material/Groups";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HubIcon from "@mui/icons-material/Hub";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import RouterIcon from "@mui/icons-material/Router";
import SchoolIcon from "@mui/icons-material/School";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import TerminalIcon from "@mui/icons-material/Terminal";
import WorkIcon from "@mui/icons-material/Work";
import type React from "react";
import type { IconKey, Skill, SkillCategory } from "@/data/skills";

/**
 * Single seam for how a Skill is presented. Everything a caller needs to render
 * a Skill — its icon and its category color — is resolved here, so the rest of
 * the app never reaches for the icon registry or color map directly. Both maps
 * are exhaustive (`Record<IconKey, ...>` / `Record<SkillCategory, ...>`): a
 * missing entry is a compile error, never a silent runtime gap.
 */

const SKILL_ICONS: Record<IconKey, React.ReactElement> = {
  groups: <GroupsIcon />,
  school: <SchoolIcon />,
  assignment: <AssignmentIcon />,
  handshake: <HandshakeIcon />,
  hub: <HubIcon />,
  factCheck: <FactCheckIcon />,
  build: <BuildIcon />,
  accountTree: <AccountTreeIcon />,
  work: <WorkIcon />,
  code: <CodeIcon />,
  terminal: <TerminalIcon />,
  architecture: <ArchitectureIcon />,
  dynamicForm: <DynamicFormIcon />,
  api: <ApiIcon />,
  integration: <IntegrationInstructionsIcon />,
  router: <RouterIcon />,
  cloud: <CloudIcon />,
  storage: <StorageIcon />,
  settings: <SettingsIcon />,
  monitorHeart: <MonitorHeartIcon />,
};

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Leadership: "#5f9610", // limeGreen from theme
  Languages: "#c55a0d", // orange from theme
  Architecture: "#0ea5e9", // primary.main from theme
  Infrastructure: "#f97316", // secondary.main from theme
  Databases: "#84cc16", // lime from ReadingSection
  Tools: "#64748b", // slate from ReadingSection
};

export interface SkillPresentation {
  icon: React.ReactElement;
  color: string;
}

/** The color used to present a SkillCategory (e.g. group headers). */
export function categoryColor(category: SkillCategory): string {
  return CATEGORY_COLORS[category];
}

/** Everything needed to render a single Skill: its icon and its category color. */
export function skillPresentation(skill: Skill): SkillPresentation {
  return {
    icon: SKILL_ICONS[skill.icon],
    color: CATEGORY_COLORS[skill.category],
  };
}

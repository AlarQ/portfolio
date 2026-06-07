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
import type { SvgIconProps } from "@mui/material";
import type React from "react";
import type { IconKey, Skill, SkillCategory } from "@/data/skills";
import { brand } from "@/theme/theme";

/**
 * Single seam for how a Skill is presented. Everything a caller needs to render
 * a Skill — its icon and its category color — is resolved here, so the rest of
 * the app never reaches for the icon registry or color map directly. Both maps
 * are exhaustive (`Record<IconKey, ...>` / `Record<SkillCategory, ...>`): a
 * missing entry is a compile error, never a silent runtime gap.
 */

const SKILL_ICONS: Record<IconKey, React.ReactElement<SvgIconProps>> = {
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
  Leadership: brand.limeDark,
  Languages: brand.orangeDark,
  Architecture: brand.sky,
  Infrastructure: brand.orange,
  Databases: brand.lime,
  Tools: brand.slate,
};

export interface SkillPresentation {
  icon: React.ReactElement;
  color: string;
}

/** The color used to present a SkillCategory (e.g. group headers). */
export function categoryColor(category: SkillCategory): string {
  return CATEGORY_COLORS[category];
}

/** Resolves an IconKey to its MUI icon — the single icon registry for the app. */
export function skillIcon(icon: IconKey): React.ReactElement<SvgIconProps> {
  return SKILL_ICONS[icon];
}

/** Everything needed to render a single Skill: its icon and its category color. */
export function skillPresentation(skill: Skill): SkillPresentation {
  return {
    icon: SKILL_ICONS[skill.icon],
    color: CATEGORY_COLORS[skill.category],
  };
}

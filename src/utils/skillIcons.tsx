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
import type { IconKey } from "@/data/skills";

/**
 * Exhaustive registry mapping every IconKey to a Material-UI icon. The
 * `Record<IconKey, ...>` type forces a mapping for every key — a Skill can
 * never resolve to a missing icon, and there is no silent string-match
 * fallback. Adding an IconKey without an entry here is a compile error.
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

/** Resolve a Skill's typed IconKey to its Material-UI icon. */
export function skillIcon(key: IconKey): React.ReactElement {
  return SKILL_ICONS[key];
}

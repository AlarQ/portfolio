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

/**
 * Maps skill names to Material-UI icons
 * Returns CodeIcon as fallback for unmapped skills
 */
export function getSkillIcon(skillName: string): React.ReactElement {
  const iconMap: Record<string, React.ReactElement> = {
    // Leadership skills
    "Team Leadership": <GroupsIcon />,
    Mentoring: <SchoolIcon />,
    "Delivery Ownership": <AssignmentIcon />,
    "Stakeholder Management": <HandshakeIcon />,
    "Cross-Team Collaboration": <HubIcon />,
    "Technical Standards (ADRs)": <FactCheckIcon />,
    "Tech Debt Management": <BuildIcon />,
    "Agile/Scrum": <AccountTreeIcon />,
    Jira: <WorkIcon />,
    Confluence: <WorkIcon />,

    // Languages
    "Scala (Cats)": <CodeIcon fontSize="large" />,
    "Rust (Tokio)": <TerminalIcon fontSize="large" />,

    // Architecture
    Microservices: <AccountTreeIcon />,
    "Monolithic Architectures": <ArchitectureIcon />,
    "Distributed Systems": <HubIcon />,
    "Event-Driven Systems": <DynamicFormIcon />,
    "API Design": <ApiIcon />,
    "System Integration": <IntegrationInstructionsIcon />,

    // Infrastructure
    Kafka: <RouterIcon />,
    Kubernetes: <CloudIcon />,
    GCP: <CloudIcon />,

    // Databases
    PostgreSQL: <StorageIcon />,
    ScyllaDB: <StorageIcon />,
    Elasticsearch: <StorageIcon />,

    // Tools
    "GitLab CI": <SettingsIcon />,
    "GitHub Actions": <SettingsIcon />,
    "ELK Stack": <MonitorHeartIcon />,
    Datadog: <MonitorHeartIcon />,
  };

  return iconMap[skillName] || <CodeIcon />;
}

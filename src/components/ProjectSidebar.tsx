"use client";

import { useState } from "react";
import { EmptyState } from "./sidebar/EmptyState";
import { ErrorState } from "./sidebar/ErrorState";
import { ProjectPreview } from "./sidebar/ProjectPreview";

export interface ProjectSidebarProps {
  /** Project title displayed in the header */
  title?: string;
  /** Full URL to the project's GitHub Pages site */
  githubUrl?: string;
}

export function ProjectSidebar({ title, githubUrl }: ProjectSidebarProps) {
  const [loadError, setLoadError] = useState(false);

  if (!githubUrl) {
    return <EmptyState />;
  }

  if (loadError) {
    return <ErrorState onRetry={() => setLoadError(false)} />;
  }

  return <ProjectPreview title={title} githubUrl={githubUrl} onError={() => setLoadError(true)} />;
}

export default ProjectSidebar;

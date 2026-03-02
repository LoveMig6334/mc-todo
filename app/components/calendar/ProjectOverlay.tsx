"use client";

import { Project } from "@/app/types/task";

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface ProjectOverlayProps {
  project: Project;
  weekDays: string[]; // 7 YYYY-MM-DD strings for this calendar row
}

/**
 * Renders a translucent color band over the days of a calendar week row
 * that fall within the project's date range.
 */
export default function ProjectOverlay({
  project,
  weekDays,
}: ProjectOverlayProps) {
  const projectStart = project.dueDate.start;
  const projectEnd = project.dueDate.end ?? project.dueDate.start;

  let startIdx = -1;
  let endIdx = -1;

  for (let i = 0; i < weekDays.length; i++) {
    const day = weekDays[i];
    if (day >= projectStart && day <= projectEnd) {
      if (startIdx === -1) startIdx = i;
      endIdx = i;
    }
  }

  if (startIdx === -1) return null;

  const colSpan = endIdx - startIdx + 1;
  const leftPct = (startIdx / 7) * 100;
  const widthPct = (colSpan / 7) * 100;

  // Show solid side borders only where the project actually starts/ends
  const isProjectStartInWeek =
    project.dueDate.start >= weekDays[0] &&
    project.dueDate.start <= weekDays[6];
  const isProjectEndInWeek =
    projectEnd >= weekDays[0] && projectEnd <= weekDays[6];

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        backgroundColor: hexToRgba(project.color, 0.1),
        borderTop: `1px solid ${hexToRgba(project.color, 0.25)}`,
        borderBottom: `1px solid ${hexToRgba(project.color, 0.25)}`,
        borderLeft: isProjectStartInWeek
          ? `2px solid ${hexToRgba(project.color, 0.5)}`
          : undefined,
        borderRight: isProjectEndInWeek
          ? `2px solid ${hexToRgba(project.color, 0.5)}`
          : undefined,
      }}
    />
  );
}

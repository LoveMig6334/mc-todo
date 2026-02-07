export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRange(start: string, end: string | null): string {
  if (!end || start === end) {
    return formatDate(start);
  }
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function isOverdue(dueDate: {
  start: string;
  end: string | null;
}): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = dueDate.end ? new Date(dueDate.end) : new Date(dueDate.start);
  endDate.setHours(0, 0, 0, 0);

  return endDate < today;
}

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export function getPriorityColor(priority: number): string {
  if (priority >= 8) return "text-red-500";
  if (priority >= 5) return "text-orange-500";
  if (priority >= 3) return "text-yellow-500";
  return "text-zinc-400";
}

export function getPriorityLabel(priority: number): string {
  if (priority >= 8) return "Urgent";
  if (priority >= 5) return "High";
  if (priority >= 3) return "Medium";
  return "Low";
}

export function getDaysLeft(dueDate: {
  start: string;
  end: string | null;
}): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = dueDate.end ? new Date(dueDate.end) : new Date(dueDate.start);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function getStatusLabel(
  status: "needs_approval" | "in_progress" | "pending" | "paused",
): string {
  const labels: Record<typeof status, string> = {
    needs_approval: "Needs Approval",
    in_progress: "In Progress",
    pending: "Pending",
    paused: "Paused",
  };
  return labels[status];
}

export function getStatusColor(
  status: "needs_approval" | "in_progress" | "pending" | "paused",
): string {
  const colors: Record<typeof status, string> = {
    needs_approval: "bg-purple-500/20 text-purple-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    paused: "bg-zinc-700 text-zinc-400",
  };
  return colors[status];
}

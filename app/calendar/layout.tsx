import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar",
  description: "View and manage your tasks on the calendar.",
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

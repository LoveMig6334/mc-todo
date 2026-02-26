import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "An interactive canvas workspace for brainstorming and planning tasks.",
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

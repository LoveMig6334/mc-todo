"use client";

import { cn } from "@/app/lib/utils";
import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: "tasks",
    label: "Tasks",
    href: "/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Calendar",
    href: "/calendar",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
];

interface FloatingNavProps {
  currentPath?: string;
}

export default function FloatingNav({ currentPath = "/" }: FloatingNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-full bg-zinc-900 border border-zinc-800 px-2 py-2 shadow-lg transition-all duration-300 ease-out",
          isExpanded ? "px-4" : "px-2",
        )}
      >
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span
            className={cn(
              "text-white font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
              isExpanded ? "w-auto opacity-100" : "w-0 opacity-0",
            )}
          >
            MC-Todo
          </span>
        </div>

        {/* Divider */}
        <div
          className={cn(
            "h-6 w-px bg-zinc-700 transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-zinc-800 text-orange-500"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800",
                )}
              >
                {item.icon}
                <span
                  className={cn(
                    "text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                    isExpanded ? "w-auto opacity-100" : "w-0 opacity-0",
                  )}
                >
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

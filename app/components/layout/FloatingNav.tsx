"use client";

import { cn } from "@/app/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

const EASE_SMOOTH: [number, number, number, number] = [0.4, 0, 0.2, 1];

const labelsContainerVariants = {
  expanded: {
    transition: {
      staggerChildren: 0,
    },
  },
  collapsed: {
    transition: {
      staggerChildren: 0,
    },
  },
};

const labelVariants = {
  expanded: {
    opacity: 1,
    maxWidth: 120,
    marginLeft: 8,
    clipPath: "inset(0 0% 0 0%)",
    transition: { duration: 0.6, ease: EASE_SMOOTH },
  },
  collapsed: {
    opacity: 0,
    maxWidth: 0,
    marginLeft: 0,
    clipPath: "inset(0 50% 0 50%)",
    transition: { duration: 0.5, ease: EASE_SMOOTH },
  },
};

const dividerVariants = {
  expanded: {
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_SMOOTH },
  },
  collapsed: {
    opacity: 0,
    transition: { duration: 0.5, ease: EASE_SMOOTH },
  },
};

export default function FloatingNav() {
  const currentPath = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup collapse timer on unmount
  useEffect(() => {
    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, []);

  function handleMouseEnter() {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    setIsExpanded(true);
  }

  function handleMouseLeave() {
    collapseTimer.current = setTimeout(() => {
      setIsExpanded(false);
    }, 500);
  }

  return (
    <nav
      className="fixed top-0 left-1/2 -translate-x-1/2 z-50 px-10 pt-2 pb-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="flex items-center gap-1 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-2 shadow-lg"
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={labelsContainerVariants}
      >
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <motion.span
            className="text-white font-medium text-sm whitespace-nowrap"
            style={{ overflow: "hidden", display: "inline-block" }}
            variants={labelVariants}
          >
            MC-Todo
          </motion.span>
        </div>

        {/* Divider */}
        <motion.div
          className="h-6 w-px bg-zinc-700"
          variants={dividerVariants}
        />

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-200",
                  isActive
                    ? "bg-zinc-800 text-orange-500"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800",
                )}
              >
                {item.icon}
                <motion.span
                  className="text-sm whitespace-nowrap"
                  style={{ overflow: "hidden", display: "inline-block" }}
                  variants={labelVariants}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}

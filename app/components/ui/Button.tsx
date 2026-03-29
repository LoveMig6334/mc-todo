"use client";

import { springFast } from "@/app/lib/animation";
import { cn } from "@/app/lib/utils";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary: {
    className: "text-white",
    bg: "rgb(249, 115, 22)",
    hoverBg: "rgb(234, 88, 12)",
    ring: "focus:ring-orange-500",
  },
  secondary: {
    className: "text-white",
    bg: "rgb(63, 63, 70)",
    hoverBg: "rgb(82, 82, 91)",
    ring: "focus:ring-orange-500",
  },
  ghost: {
    className: "text-zinc-300 hover:text-white",
    bg: "rgba(0, 0, 0, 0)",
    hoverBg: "rgb(39, 39, 42)",
    ring: "focus:ring-orange-500",
  },
  danger: {
    className: "text-white",
    bg: "rgb(220, 38, 38)",
    hoverBg: "rgb(185, 28, 28)",
    ring: "focus:ring-red-500",
  },
} as const;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, style, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none";

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-md",
      md: "h-10 px-4 text-sm rounded-lg",
      lg: "h-12 px-6 text-base rounded-lg",
    };

    const v = variantStyles[variant];

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, v.ring, v.className, sizes[size], className)}
        style={{ backgroundColor: v.bg, ...style }}
        whileHover={{ backgroundColor: v.hoverBg }}
        whileTap={{ scale: 0.95 }}
        transition={springFast}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export default Button;

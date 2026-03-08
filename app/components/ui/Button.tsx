"use client";

import { springFast } from "@/app/lib/animation";
import { cn } from "@/app/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "motion/react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-orange-500 text-white hover:bg-orange-600",
      secondary: "bg-zinc-700 text-white hover:bg-zinc-600",
      ghost: "bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-md",
      md: "h-10 px-4 text-sm rounded-lg",
      lg: "h-12 px-6 text-base rounded-lg",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
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

"use client";

import { fadeInUp, springSnappy } from "@/app/lib/animation";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

interface StatCardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon,
  accentColor,
}: StatCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const ctrl = animate(count, value, { duration: 0.6, ease: "easeOut" });
    return ctrl.stop;
  }, [value, count]);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
      transition={springSnappy}
      className="rounded-xl border border-zinc-700 bg-zinc-800 p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className={accentColor ?? "text-zinc-400"}>{icon}</span>
      </div>
      <motion.p className="mt-2 text-3xl font-bold text-white">
        {rounded}
      </motion.p>
      {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
    </motion.div>
  );
}

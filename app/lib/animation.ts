// Shared animation constants — import from here to keep motion config consistent.
// IMPORTANT: All color values must use rgb()/rgba() — never Tailwind keyword colors.

export const springSnappy = { type: "spring", stiffness: 400, damping: 25 } as const;
export const springBouncy = { type: "spring", stiffness: 300, damping: 20 } as const;
export const springFast   = { type: "spring", stiffness: 500, damping: 30 } as const;

export const fadeInUp = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: springSnappy },
  exit:    { opacity: 0, y: 4, transition: { duration: 0.15 } },
};

export const staggerContainer = {
  hidden:  { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.05 } },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: springSnappy },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const slideDown = {
  hidden:  { opacity: 0, y: -8, scaleY: 0.97, transformOrigin: "top" },
  visible: { opacity: 1, y: 0, scaleY: 1, transition: springSnappy },
  exit:    { opacity: 0, y: -4, scaleY: 0.97, transition: { duration: 0.15 } },
};

# Navbar Animation Enhancement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace FloatingNav's CSS transitions with Motion variants for smooth expand/collapse with 0.5s collapse delay and staggered label cascade.

**Architecture:** Use a `collapseTimer` ref + `setTimeout` for the 0.5s delay. Parent `motion.div` drives a `variants` state (`"expanded"` / `"collapsed"`) with `staggerChildren` so labels animate in cascade. Each label becomes a `motion.span` animating `maxWidth` + `opacity`. All CSS `transition-*` classes are removed from Motion-controlled elements. Follow CLAUDE.md Motion + Tailwind v4 rules (explicit `style` with `rgba()`/`rgb()` on any motion element that animates color).

**Tech Stack:** Next.js 16 App Router · React 19 · Motion v12 (`motion/react`) · Tailwind CSS v4

---

## Chunk 1: Implement Motion-based navbar animation

### Task 1: Convert FloatingNav to Motion variants

**Files:**
- Modify: `app/components/layout/FloatingNav.tsx`

**Notes on animation approach:**
- Motion v12 import: `import { motion, AnimatePresence } from "motion/react"`
- `maxWidth` is used instead of `width` because Motion cannot reliably interpolate to `"auto"`. Set `overflow: "hidden"` on each label span.
- The collapse delay is handled in React (setTimeout), NOT in Motion's transition `delay`, so hover-back-in correctly cancels the pending collapse.
- Nav item hover states stay as CSS `hover:bg-zinc-800` (no Motion color animation on these — CLAUDE.md: don't mix Tailwind hover classes with Motion whileHover backgroundColor).
- The navbar container's bg/border are NOT animated by Motion, so no `style={{ backgroundColor }}` override is needed there.

---

- [ ] **Step 1: Add Motion import and define variants**

Add to top of `app/components/layout/FloatingNav.tsx`:

```tsx
import { motion } from "motion/react";
```

Add variant objects just before the component function:

```tsx
const labelsContainerVariants = {
  expanded: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0,
    },
  },
  collapsed: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1 as const,
    },
  },
};

const labelVariants = {
  expanded: {
    opacity: 1,
    maxWidth: 120,
    marginLeft: 8,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
  collapsed: {
    opacity: 0,
    maxWidth: 0,
    marginLeft: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

const dividerVariants = {
  expanded: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  collapsed: {
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};
```

- [ ] **Step 2: Add collapseTimer ref and update mouse handlers**

Inside the component, add the ref and replace the existing onMouseEnter/onMouseLeave logic:

```tsx
const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setIsDropdownOpen(false);
    setSearchQuery("");
  }, 500);
}
```

Update the `<nav>` element to use these handlers:

```tsx
<nav
  className="fixed top-0 left-1/2 -translate-x-1/2 z-50 px-10 pt-2 pb-8"
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
```

Also clean up the timer on unmount — add to the existing `useEffect` or add a new one:

```tsx
useEffect(() => {
  return () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
  };
}, []);
```

- [ ] **Step 3: Convert inner container div to motion.div with variants**

Replace the inner `<div className={cn(...)} >` with a `motion.div`. Remove all `transition-all duration-500` and conditional padding classes — the container width is now driven by content (no explicit width animation on the container itself):

```tsx
<motion.div
  className="flex items-center gap-1 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-2 shadow-lg"
  animate={isExpanded ? "expanded" : "collapsed"}
  variants={labelsContainerVariants}
>
```

> Note: `px-3` is a fixed padding now — no more `isExpanded ? "px-4" : "px-2"` toggle. The visible width change is driven entirely by labels appearing/disappearing.

- [ ] **Step 4: Convert MC-Todo brand label to motion.span**

Replace the brand name `<span>` (currently with `cn(..., isExpanded ? "w-auto opacity-100" : "w-0 opacity-0")`) with:

```tsx
<motion.span
  className="text-white font-medium text-sm whitespace-nowrap"
  style={{ overflow: "hidden", display: "inline-block" }}
  variants={labelVariants}
>
  MC-Todo
</motion.span>
```

Remove the old `cn(...)` width/opacity logic from it.

- [ ] **Step 5: Convert divider to motion.div**

Replace the divider `<div className={cn("h-6 w-px bg-zinc-700 transition-opacity duration-500", ...)}>` with:

```tsx
<motion.div
  className="h-6 w-px bg-zinc-700"
  variants={dividerVariants}
/>
```

- [ ] **Step 6: Convert each nav item label to motion.span**

For each `<span className={cn("text-sm whitespace-nowrap overflow-hidden transition-all duration-500", isExpanded ? "w-auto opacity-100" : "w-0 opacity-0")}>` inside `navItems.map(...)`, replace with:

```tsx
<motion.span
  className="text-sm whitespace-nowrap"
  style={{ overflow: "hidden", display: "inline-block" }}
  variants={labelVariants}
>
  {item.label}
</motion.span>
```

- [ ] **Step 7: Convert Playground button label to motion.span**

Same treatment as nav item labels — the `<span>` inside the Playground `<button>`:

```tsx
<motion.span
  className="text-sm whitespace-nowrap"
  style={{ overflow: "hidden", display: "inline-block" }}
  variants={labelVariants}
>
  Playground
</motion.span>
```

- [ ] **Step 8: Manually verify in browser**

Run dev server:
```bash
npm run dev
```

Check:
1. Hover over navbar → labels cascade in left-to-right, smooth ease
2. Move mouse away → 0.5s pause, then labels cascade out right-to-left, container shrinks
3. Hover back in during collapse delay → collapse cancels, navbar stays/re-expands cleanly
4. Active route highlights remain correct (orange)
5. Playground dropdown still opens/closes correctly
6. No layout jank or flash on page load

- [ ] **Step 9: Commit**

```bash
git add app/components/layout/FloatingNav.tsx
git commit -m "feat: enhance navbar with Motion variants, 0.5s collapse delay, and stagger labels"
```

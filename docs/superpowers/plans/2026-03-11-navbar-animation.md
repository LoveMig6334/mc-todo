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
- Motion v12 import: `import { motion } from "motion/react"` (no AnimatePresence needed)
- `maxWidth` is used instead of `width` because Motion cannot reliably interpolate to `"auto"`. Set `overflow: "hidden"` on each label span.
- The collapse delay is handled in React (setTimeout), NOT in Motion's transition `delay`, so hover-back-in correctly cancels the pending collapse.
- Nav item hover states stay as CSS `hover:bg-zinc-800` (no Motion color animation on these — CLAUDE.md: don't mix Tailwind hover classes with Motion whileHover backgroundColor).
- The navbar container's bg/border are NOT animated by Motion, so no `style={{ backgroundColor }}` override is needed there.
- The brand label wrapper `<div className="flex items-center gap-2 px-2">` must become a `motion.div` so that Motion's variant propagation reaches the nested `motion.span`. Without this, stagger does not fire for the brand label.
- The `<a>` and `<button>` wrappers use `transition-colors duration-200` (not `transition-all duration-500`) so their CSS transition only applies to color changes and does not interfere with the Motion-driven label width animations.

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

`useRef` is already imported on line 5 — do not add a duplicate import.

Inside the component, add the ref and two handler functions (replacing the inline `onMouseEnter`/`onMouseLeave` lambdas):

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

Add a new `useEffect` for timer cleanup on unmount (separate from the existing click-outside mousedown effect):

```tsx
useEffect(() => {
  return () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
  };
}, []);
```

- [ ] **Step 3: Convert inner container div to motion.div with variants**

Replace the inner `<div className={cn(...)} >` with a `motion.div`. Remove all CSS `transition-all` and conditional padding classes. The container width is driven entirely by label content appearing/disappearing.

> **Note on padding:** Fixed `px-3` replaces the old `px-2`/`px-4` toggle. This intentionally keeps the collapsed pill slightly wider (12px vs 8px sides) for a less cramped icon-only state while keeping the implementation simple. If tighter collapsed padding is needed, `px-2` can be used here without functional impact.

```tsx
<motion.div
  className="flex items-center gap-1 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-2 shadow-lg"
  animate={isExpanded ? "expanded" : "collapsed"}
  variants={labelsContainerVariants}
>
```

- [ ] **Step 4: Convert the brand logo wrapper div to motion.div**

The brand `motion.span` is nested inside a plain `div`. Motion's variant propagation only flows through `motion.*` elements, so the stagger will not reach the brand label unless its parent is also a motion element.

Replace `<div className="flex items-center gap-2 px-2">` with:

```tsx
<motion.div className="flex items-center gap-2 px-2">
```

Close it with `</motion.div>`.

- [ ] **Step 5: Convert MC-Todo brand label to motion.span**

Replace the brand name `<span>` (currently using `cn(...)` with `w-0`/`w-auto` and `opacity-0`/`opacity-100`) with:

```tsx
<motion.span
  className="text-white font-medium text-sm whitespace-nowrap"
  style={{ overflow: "hidden", display: "inline-block" }}
  variants={labelVariants}
>
  MC-Todo
</motion.span>
```

Remove the old `cn(...)` conditional width/opacity logic from it entirely.

- [ ] **Step 6: Convert divider to motion.div**

Replace:
```tsx
<div
  className={cn(
    "h-6 w-px bg-zinc-700 transition-opacity duration-500",
    isExpanded ? "opacity-100" : "opacity-0",
  )}
/>
```

With:
```tsx
<motion.div
  className="h-6 w-px bg-zinc-700"
  variants={dividerVariants}
/>
```

- [ ] **Step 7: Convert each nav item label to motion.span, fix wrapper transition**

For each `<a>` element in `navItems.map(...)`:

1. Change `transition-all duration-500` on the `<a>` to `transition-colors duration-200` so only color/background changes transition via CSS (not width):

```tsx
<a
  key={item.id}
  href={item.href}
  className={cn(
    "flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-200",
    isActive
      ? "bg-zinc-800 text-orange-500"
      : "text-zinc-400 hover:text-white hover:bg-zinc-800",
  )}
>
```

2. Replace the `<span>` label inside each `<a>` with a `motion.span`:

```tsx
<motion.span
  className="text-sm whitespace-nowrap"
  style={{ overflow: "hidden", display: "inline-block" }}
  variants={labelVariants}
>
  {item.label}
</motion.span>
```

- [ ] **Step 8: Convert Playground button label to motion.span, fix button transition**

1. Change `transition-all duration-500` on the Playground `<button>` to `transition-colors duration-200`:

```tsx
<button
  onClick={() => { ... }}
  className={cn(
    "flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-200",
    isPlaygroundActive
      ? "bg-zinc-800 text-orange-500"
      : "text-zinc-400 hover:text-white hover:bg-zinc-800",
  )}
>
```

2. Replace the Playground `<span>` label with:

```tsx
<motion.span
  className="text-sm whitespace-nowrap"
  style={{ overflow: "hidden", display: "inline-block" }}
  variants={labelVariants}
>
  Playground
</motion.span>
```

- [ ] **Step 9: Manually verify in browser**

Run dev server:
```bash
npm run dev
```

Check:
1. Hover over navbar → brand label and nav labels cascade in left-to-right, smooth ease
2. Brand label specifically animates in sync with the rest (not all-at-once or missing)
3. Move mouse away → 0.5s pause, then all labels cascade out right-to-left, container shrinks
4. Hover back in during collapse delay → collapse cancels, navbar stays/re-expands cleanly
5. Active route highlights remain correct (orange)
6. Playground dropdown still opens/closes correctly
7. No layout jank or flash on page load

- [ ] **Step 10: Commit**

```bash
git add app/components/layout/FloatingNav.tsx
git commit -m "feat: enhance navbar with Motion variants, 0.5s collapse delay, and stagger labels"
```

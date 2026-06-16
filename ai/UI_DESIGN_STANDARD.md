# UI Design Standard

The agent must follow these rules for every screen and component. No ad-hoc styles — use the tokens. No inventing new patterns — use the components. When something is not covered here, match the closest existing pattern rather than introducing a new one.

---

## 1. Design tokens

All visual values live in `src/styles/tokens.css`. Never hard-code a color, spacing value, border radius, shadow, or font size in a component.

### Color — semantic palette

```css
:root {
  /* Brand */
  --color-primary: #6366f1; /* indigo-500 */
  --color-primary-light: #a5b4fc; /* indigo-300 */
  --color-primary-dark: #4338ca; /* indigo-700 */

  /* Feedback */
  --color-success: #22c55e; /* green-500 */
  --color-error: #ef4444; /* red-500 */
  --color-warning: #eab308; /* yellow-500 */

  /* Game colors (Simon Says, Pattern Copy) */
  --color-game-red: #ef4444;
  --color-game-blue: #3b82f6;
  --color-game-green: #22c55e;
  --color-game-yellow: #eab308;
  --color-game-purple: #a855f7;

  /* Neutral */
  --color-bg: #0f172a; /* slate-900 — app background */
  --color-surface: #1e293b; /* slate-800 — card/panel background */
  --color-surface-raised: #334155; /* slate-700 — elevated surface */
  --color-border: #475569; /* slate-600 */
  --color-text: #f1f5f9; /* slate-100 */
  --color-text-muted: #94a3b8; /* slate-400 */
  --color-text-disabled: #475569; /* slate-600 */
}
```

### Spacing — 4px grid

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### Typography

```css
:root {
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;
  --text-5xl: 48px;

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
}
```

### Border radius

```css
:root {
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

### Shadows / elevation

```css
:root {
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
}
```

### Animation

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;

  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* slight overshoot */
}
```

---

## 2. Responsive breakpoints

```
mobile:  0 – 639px    → default styles (design mobile first)
tablet:  640px+       → @media (min-width: 640px)
desktop: 1024px+      → @media (min-width: 1024px)
```

Always design mobile first. Add tablet/desktop overrides only for things that meaningfully improve at wider widths (grid columns, larger touch targets becoming larger click targets, etc.).

Minimum supported width: **320px**.

---

## 3. Touch targets

Every interactive element must have a minimum tap target of **44×44px** — this is the Apple HIG and WCAG 2.5.5 requirement.

If the visual element is smaller (e.g. a small icon button), use padding to grow the tappable area:

```css
.icon-button {
  padding: var(--space-3); /* 12px padding → 44px+ total tap area */
}
```

---

## 4. Component patterns

These are the building blocks every game must use. Do not create one-off variants — extend these.

### PrimaryButton

```
Background:  var(--color-primary)
Text:        white, var(--font-semibold), var(--text-base)
Padding:     var(--space-4) var(--space-8)  → 16px 32px
Radius:      var(--radius-full)
Min height:  52px
Min width:   160px
Hover:       background → var(--color-primary-dark), translateY(-1px)
Active:      translateY(0), opacity 0.9
Disabled:    background → var(--color-text-disabled), cursor not-allowed
Transition:  var(--duration-fast) var(--ease-out)
```

### GameCard (surface panel)

```
Background:  var(--color-surface)
Padding:     var(--space-6)
Radius:      var(--radius-lg)
Shadow:      var(--shadow-md)
```

### ScoreDisplay

```
Score number: var(--text-5xl), var(--font-bold), var(--color-text)
Label:        var(--text-sm), var(--font-medium), var(--color-text-muted), uppercase, letter-spacing 0.1em
```

### FeedbackBadge (correct / wrong)

```
Correct:  background var(--color-success), white text
Wrong:    background var(--color-error), white text
Padding:  var(--space-2) var(--space-4)
Radius:   var(--radius-full)
Font:     var(--font-semibold)
```

### GameLayout (wraps every game screen)

```
Max width: 480px, centered horizontally
Padding:   var(--space-4) on mobile, var(--space-8) on desktop
Background: var(--color-bg)
Min height: 100dvh
Display:   flex, column, justify: space-between
```

---

## 5. Animation rules

**What to animate:**

- Card flips (CSS 3D transform)
- Button press feedback (scale down 0.96, fast)
- Correct answer feedback (scale up 1.06, spring ease)
- Wrong answer feedback (horizontal shake, 3 iterations)
- Score increment (count-up number animation)
- Screen transitions (fade, 250ms)

**What NOT to animate:**

- Layout reflows
- Text content changes (unless it's a score counter)
- Loading states under 300ms (just show content)
- Anything that loops indefinitely unless it pauses when off-screen

**Motion safety:** Wrap all non-essential animations in `@media (prefers-reduced-motion: reduce)` and remove or simplify them.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Accessibility rules (WCAG 2.1 AA)

| Rule             | Requirement                                                          |
| ---------------- | -------------------------------------------------------------------- |
| Color contrast   | Text on bg: minimum 4.5:1 ratio                                      |
| Focus visible    | All interactive elements must show a visible focus ring              |
| Focus ring style | `outline: 2px solid var(--color-primary-light); outline-offset: 2px` |
| Button semantics | Use `<button>` not `<div onClick>`                                   |
| Icon buttons     | Must have `aria-label`                                               |
| Game state       | Screen reader must be told when state changes (`aria-live="polite"`) |
| Color only       | Never use color as the only indicator (add icon, shape, or text)     |
| Disabled inputs  | Use `disabled` attribute, not just `pointer-events: none`            |

---

## 7. Dark theme

The app uses a dark theme by default (see `--color-bg: #0F172A`). Do not add a light theme toggle in MVP. All components must look correct on the dark background.

---

## 8. Emoji rendering

Emoji are used as game objects. Rules:

- Always render emoji as text, not as `<img>` tags
- Set `font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif` on emoji containers
- Do not rely on a specific emoji renderer — use ones that look acceptable across platforms
- Minimum size for game emoji: **40px** font-size
- Tappable emoji must still meet the 44×44px touch target rule via padding

---

## 9. Agent UI review checklist

After implementing UI, the agent must check each item before PR:

```
Layout
[ ] All content visible at 320px width without horizontal scroll
[ ] All content visible at 1280px width (no awkward stretching)
[ ] No content clipped by device notch or status bar (use safe-area-inset)
[ ] GameLayout max-width respected; screen doesn't sprawl on desktop

Tokens
[ ] No hard-coded hex colors in component CSS
[ ] No hard-coded px values outside of tokens (spacing, radius, font size)
[ ] All new interactive elements use token-based transitions

Touch & interaction
[ ] Every tappable element is min 44×44px
[ ] No hover-only interactions
[ ] Active/pressed state visible on all buttons
[ ] Disabled state visually distinct

Typography
[ ] Score numbers use ScoreDisplay component
[ ] Labels use var(--color-text-muted) and uppercase + letter-spacing
[ ] No text smaller than var(--text-sm) = 14px

Animation
[ ] prefers-reduced-motion respected
[ ] No animation loops indefinitely
[ ] All timers and animation callbacks cleaned up on unmount

Accessibility
[ ] All buttons are <button> elements
[ ] Icon buttons have aria-label
[ ] Game state changes announced via aria-live
[ ] Focus ring visible on keyboard navigation
[ ] Color not used as sole indicator

Consistency
[ ] Uses GameLayout wrapper
[ ] Uses PrimaryButton, GameCard, ScoreDisplay, FeedbackBadge from components/
[ ] No one-off CSS that duplicates an existing component
```

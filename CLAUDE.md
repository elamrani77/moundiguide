# MoundiGuide — Claude Code Rules

## HARD RULES (never break these)
- NEVER modify data constants: LANGUAGES, STADIUMS, MATCHES, FIFA_RANKINGS, NEWS, TRANSLATIONS, CITIES, TICKET_CATS, DARIJA, CURRENCIES, INFO_ITEMS
- NEVER touch chat AI logic (send function, API call to /api/chat, msgs state, loading state)
- NEVER change translation keys inside TRANSLATIONS object
- NEVER break RTL support (isRTL logic must stay intact for Arabic)
- NEVER add TypeScript, never convert to Next.js
- NEVER create new files unless explicitly asked
- NEVER use localStorage or sessionStorage
- NEVER hardcode colors — use BR object or CSS variables

## Project Structure
```
src/main.jsx          — entry point (Lenis goes here)
src/MoundiGuide.jsx   — ALL UI (1146 lines, single file)
public/               — images: casablanca.jpg, rabat.jpg, fes.webp, MARRAKECH-CITY.webp, Tanger.jpg, AGADIR.jpg
api/chat.js           — Vercel serverless AI function (DO NOT TOUCH)
```

## Component Map (line numbers)
- `md()` — markdown renderer — line 286
- `MoundiLogo` — logo component — line 291
- `Navbar` — fixed nav with scroll detection — line 323
- `Splash` — loading screen (2.6s) — line 430
- `Weather` — live weather widget — line 456
- `SMap` — stadium map — line 478
- `ChatFloat` — AI chat widget — line 500
- `HomePage` — main landing sections — line 565
- `TicketPage` — ticket info — line 795
- `SchedulePage` — match calendar — line 879
- `Footer` — footer — line 979
- `MoundiGuide` — root component — line 1024

## Color System (already defined as BR object)
```js
BR = { red:"#E41C3A", green:"#00913F", blue:"#1A56DB", gold:"#F0B429" }
// Dark mode bg: #121414
// Dark mode text: #e3e2e2
// Use C.bg, C.str, C.mut, C.card, C.bdr (theme context object)
```

## Animation Stack
- **framer-motion** — component animations (installed, NOT yet imported)
- **gsap** — scroll-driven animations (installed, NOT yet imported)
- **@studio-freight/lenis** — smooth scroll (installed, NOT yet imported)

## How to Add Animations (follow this pattern exactly)

### 1. Lenis — add in main.jsx only
```jsx
import Lenis from '@studio-freight/lenis'
useEffect(() => {
  const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
  requestAnimationFrame(raf)
  return () => lenis.destroy()
}, [])
```

### 2. framer-motion — stagger pattern for cards
```jsx
import { motion, useInView } from 'framer-motion'
const ref = useRef(null)
const inView = useInView(ref, { once: true, margin: "-100px" })
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } } }
// Usage:
<motion.div ref={ref} variants={container} initial="hidden" animate={inView ? "visible" : "hidden"}>
  {items.map(i => <motion.div key={i} variants={item}>...</motion.div>)}
</motion.div>
```

### 3. Hero title — splittext reveal
```jsx
const words = heroTitle.split(" ")
<motion.h1>
  {words.map((word, i) => (
    <motion.span key={i} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ display: "inline-block", marginRight: "0.25em" }}>
      {word}
    </motion.span>
  ))}
</motion.h1>
```

### 4. GSAP ScrollTrigger — pinned section
```jsx
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(".city-card", { opacity: 0, y: 60 }, {
      opacity: 1, y: 0, stagger: 0.15, duration: 0.8,
      scrollTrigger: { trigger: ".cities-section", start: "top 80%" }
    })
  })
  return () => ctx.revert()
}, [])
```

## Sections to Animate (priority order)
1. **Hero** (inside HomePage line 565) — title splittext-reveal, subtitle fade-up, CTA buttons scale-in
2. **City cards** (6 cards in HomePage) — stagger fade-up on scroll
3. **Stats bar** (4 stats) — count-up animation on entry
4. **Navbar** — fade-in on mount, blur on scroll (already has scroll logic, just add motion)
5. **Ticket cards** (TicketPage line 795) — stagger on entry
6. **Match cards** (SchedulePage line 879) — slide-in from left

## What Good Looks Like
- Animations feel physics-based, not linear
- Easing: always [0.25, 0.46, 0.45, 0.94] (ease-out-quart)
- Duration: 0.5s-0.8s for elements, never more than 1s
- Stagger: 0.08s-0.15s between items
- Never animate layout properties (width, height) — only transform and opacity
- once: true on all scroll triggers — animate only on first entry

## Goal
Screenshots at 1440px must feel like Linear.app or Stripe.com quality.
Every section needs a different visual treatment — no monotony.

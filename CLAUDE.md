# MoundiGuide — Project Rules

## Stack
- React 18 + Vite (NO TypeScript, JSX only)
- Vercel Serverless Functions (api/ folder)
- Inline styles (NO Tailwind, NO CSS modules)
- Font: Outfit (Google Fonts) + Noto Sans Arabic
- Dependencies: framer-motion, gsap, @studio-freight/lenis, lucide-react, recharts

## Architecture
- src/main.jsx = entry point (Lenis smooth scroll lives here)
- src/MoundiGuide.jsx = ALL UI (single file, state-based routing)
- api/chat.js = serverless proxy → AI API (DO NOT TOUCH)
- public/ = static assets (images, manifest, icons)
- Navigation: state-based (page state), NOT React Router

## Design System — YallaVamos 2030
- Primary red: #C41E3A (BR.red = #E41C3A)
- Green: #00823C (BR.green = #00913F)
- Blue: #1A56DB (BR.blue)
- Gold: #F5A623 (BR.gold = #F0B429)
- Dark bg: #121414
- Glassmorphism: backdrop-filter blur(16px), rgba backgrounds
- Border-radius: 16-20px for cards, 12px for inputs, 8px for buttons
- Font weights: 300 (body), 500 (labels), 700 (titles), 800 (hero)
- Use BR object or CSS variables for colors — NEVER hardcode hex directly in components

## Storage
- localStorage is ALLOWED and REQUIRED for:
  - userTeam (selected team — JSON or "neutral")
  - themeMode (dark/light/system)
  - lang (selected language)
  - moundiguide_favs (favorite POIs)
  - moundiguide_reviews (user reviews)
- sessionStorage for animation one-shot flags (e.g. playerRevealPlayed)

## Data Constants — DO NOT MODIFY
LANGUAGES, STADIUMS, MATCHES, FIFA_RANKINGS, NEWS, TRANSLATIONS, CITIES, TICKET_CATS, DARIJA, CURRENCIES, INFO_ITEMS

## Translation Keys — DO NOT MODIFY
Never change keys inside the TRANSLATIONS object. Add new keys only when explicitly asked.

## APIs (all FREE, no credit card)
- AI chat: /api/chat serverless route (Groq/Llama or similar)
- Open-Meteo: weather, no key needed
- open.er-api.com: currency rates, no key needed
- OpenStreetMap + Leaflet: map tiles, no key needed

## Languages
6 languages supported: fr, en, ar, es, pt, zh
- All UI text must use TRANSLATIONS[lang] (T object)
- Arabic (ar) needs dir="rtl" — isRTL logic must stay intact
- Default language: fr (or from localStorage)

## Layout
- Mobile (<768px): single column, bottom navigation
- Desktop (>=768px): wider layout, floating chat panel
- Pages: Home, Ticket, Schedule (state-based routing via `page` state)

## Animation Stack
- framer-motion — component animations
- gsap + ScrollTrigger — scroll-driven animations
- @studio-freight/lenis — smooth scroll (in main.jsx only)
- Easing: always [0.25, 0.46, 0.45, 0.94] (ease-out-quart)
- Duration: 0.5s–0.8s, stagger: 0.08s–0.15s
- Never animate layout properties — only transform and opacity
- once: true on all scroll triggers

## Rules
- NEVER add new npm dependencies without asking
- NEVER rewrite the entire MoundiGuide.jsx — apply targeted changes only
- NEVER use TypeScript
- NEVER use React Router (use state-based navigation)
- NEVER touch api/chat.js
- NEVER create new files unless explicitly asked
- ALL user-facing text must be translated via TRANSLATIONS[lang]
- ALL images must have onError fallback
- ALL AI/secret API calls go through api/ serverless functions
- RTL support must stay intact for Arabic at all times
- Test on mobile AND desktop before reporting done

## Deploy
- git push to main → Vercel auto-deploys
- Environment vars set in Vercel dashboard (never in frontend code)

## Skills
- .claude/skills/ui-ux-pro-max/SKILL.md
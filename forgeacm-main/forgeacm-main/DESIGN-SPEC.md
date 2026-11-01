# CivicLens AI — Design Specification
> **Source of truth:** [Proofline](https://uncharted-oddly-brilliant.vercel.app/?view=landing)
> Extracted from live CSS (`index-CCJ1I8IQ.css`) + rendered HTML on 2026-11-01.

---

## 1 · Color Palette

### Base
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#000000` | Page background (dark mode) |
| `--bg-dark-1` | `#04060A` | Deepest card/panel background |
| `--bg-dark-2` | `#080B12` | Mid-level surfaces |
| `--bg-dark-3` | `#0C0C0E` | Elevated card bg |
| `--bg-dark-4` | `#141416` | Mobile menu, popovers |
| `--bg-dark-5` | `#141A29` | Accent card tint |
| `--text` | `#FFFFFF` | Primary text |
| `--text-muted` | `#8E8E8E` | Muted labels |
| `--text-sub` | `#94A3B8` | Section subtitles |
| `--text-d0d0d0` | `#D0D0D0` | Hero sub-copy (85% opacity) |
| `--muted-border` | `rgba(255,255,255,0.06)` | Subtle hairlines |
| `--border-soft` | `rgba(255,255,255,0.10)` | Card borders |
| `--border-med` | `rgba(255,255,255,0.15)` | Hover borders |
| `--border-strong` | `rgba(255,255,255,0.25)` | Focus / active |

### Accent / Signal Colours
| Token | Hex | Glow hex |
|-------|-----|----------|
| `--cyan` | `#00F0FF` | `#00F0FF66` |
| `--indigo` | `#818CF8` | `#818CF866` |
| `--emerald` | `#10B981` | `#10B98166` |
| `--rose` | `#EF4444` | `#EF444466` |
| `--amber` | `#F59E0B` | `#F59E0B66` |
| `--purple` | `#A855F7` | – |
| `--sky` | `#38BDF8` | – |

> **CivicLens brand accents preserved:** `#477BFF` (indigo-blue) / `#38D9E6` (cyan) / `#8968FF` (violet). The page canvas in dark mode becomes `#000000` matching Proofline exactly.

### Light Mode
Proofline is dark-only. For CivicLens light mode:
- bg: `#F4F6FB`
- Surfaces: `#FFFFFF`
- Border: `rgba(15,23,42,0.10)`
- Text: `#0B132B`

---

## 2 · Typography

| Role | Family | Size | Weight | Letter-spacing |
|------|--------|------|--------|----------------|
| **Hero headline** | `Inter` | `clamp(40px, 6.2vw, 80px)` | 700 | `-0.04em` |
| **Section title** | `Inter` | `clamp(26px, 4.4vw, 48px)` | 700 | `-0.03em` |
| **Body / UI** | `Inter` | `clamp(15px, 1.6vw, 18px)` | 400 | `0` |
| **Mono / tags** | `JetBrains Mono` | `11–13px` | 500 | `+0.12em` |
| **Subhead** | `Inter` | `clamp(15px, 1.4vw, 17px)` | 400 | `0` |
| **Button** | `Inter` | `clamp(13.5px, 1.5vw, 15px)` | 600 | `0` |

Font load:
```
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap
```

---

## 3 · Spacing & Grid

- **Max content width:** `980–1280px`
- **Section vertical padding:** `clamp(64px, 8vh, 112px)`
- **Section horizontal padding:** `clamp(16px, 3vw, 32px)`
- **Card gap:** `24–32px` desktop / `16px` mobile
- **Border radius:**
  - Pill / rounded-full: `9999px`
  - Large card: `24px` (`rounded-3xl`)
  - Standard card: `16px` (`rounded-2xl`)
  - Small chip/badge: `9999px`
  - Icon well: `12px` (`rounded-xl`)

---

## 4 · Glassmorphism, Borders & Shadows

### Glass Panel (cards)
```css
background: rgba(8, 11, 18, 0.80);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.10);
box-shadow: 0 14px 32px -8px rgba(0,0,0,0.65), inset 0 1px rgba(255,255,255,0.08);
```

### Hover (`.originkit-hover-card` pattern)
```css
border-color: rgba(255,255,255,0.24);
transform: translateY(-2.5px) scale(1.012);
box-shadow: 0 14px 32px -8px rgba(0,0,0,0.65), inset 0 1px rgba(255,255,255,0.16);
transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
```

### Colour-tint card hover
```css
border-color: color-mix(in srgb, var(--hover-color) 75%, transparent);
box-shadow: 0 16px 36px -8px color-mix(in srgb, var(--hover-color) 32%, transparent),
            inset 0 0 25px -4px color-mix(in srgb, var(--hover-color) 18%, transparent);
```

### Background orbs
```css
/* Hero top — cyan */
background: radial-gradient(ellipse 800px 500px at 50% 0%, rgba(0,240,255,0.12) 0%, transparent 70%);
/* Left — indigo */
background: radial-gradient(ellipse 500px 500px at 0% 40%, rgba(71,123,255,0.10) 0%, transparent 70%);
/* Right — violet */
background: radial-gradient(ellipse 500px 500px at 100% 60%, rgba(137,104,255,0.10) 0%, transparent 70%);
```

---

## 5 · Navbar

**Pattern:** Floating pill navbar, fixed at top.

```
[Logo ●] | [Home] [Features] [HowItWorks] [Transparency] [Schemes] [Policies] [About] | [Lang] [Theme] [Sign In] [Get Started →]
```

- **Outer:** `position: fixed; top: clamp(12px,2vh,20px); left: 0; right: 0; z-index: 50; display: flex; justify-content: center;`
- **Inner pill:** `background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.10); border-radius: 9999px; height: clamp(48px,5.5vw,56px); padding: 4px 8px;`
- **Logo btn:** `40–46px` circle, white bg, icon inside, `box-shadow: 0 4px 14px rgba(0,0,0,0.16)`
- **Nav link:** `Inter 500, 14px, opacity: 0.55` → active `opacity: 1` + `2px underline dot`
- **Sign In btn:** `bg: #28282A; color: #C8C8C8; border-radius: 9999px;`
- **Get Started btn:** `bg: white; color: #000; border-radius: 9999px; glow box-shadow`
- **Entry animation:** `0.7s cubic-bezier(0.22,1,0.36,1) slideDown`
- **Mobile:** burger btn (circle, dark bg), overlay backdrop blur, menu card `border-radius: 24px`

---

## 6 · Hero Section

- **Full-viewport** `min-height: 100dvh`
- **Background:** `#000` + gradient orbs
- **Layout:** left column (headline+CTA) / right column (live preview card)
- **Badge pill:** `bg: #28282A; border: 1px solid rgba(255,255,255,0.37); border-radius: 9999px; JetBrains Mono 12px`
- **Headline:** `Inter 700; clamp(40px,6.2vw,76px); letter-spacing: -0.04em; line-height: 1.12;` — staggered `headlineFade` per line
- **Sub-copy:** `color: #D0D0D0; opacity: 0.85; 18px; line-height: 1.55`
- **CTA primary:** `border-radius: 9999px; bg: white; color: #000; box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32);`
- **CTA secondary:** `border-radius: 9999px; bg: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12);`
- **Demo selector:** same glass chip style with coloured dot indicators
- **Live preview card:** `glass-panel; border-radius: 24px; border: 1px solid rgba(255,255,255,0.10); backdrop-filter: blur(16px);`

---

## 7 · Section Tags & Titles

```css
/* Section tag */
.section-tag {
  font-family: 'JetBrains Mono';
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #A3A8B5;
  background: #0B0E17;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 9999px;
  padding: 6px 14px;
  font-size: 11px;
}

/* Section title */
.section-title {
  font-family: 'Inter';
  font-weight: 700;
  font-size: clamp(26px, 4.4vw, 48px);
  letter-spacing: -0.03em;
  line-height: 1.15;
}

/* Section subtitle */
.section-subtitle {
  font-family: 'Inter';
  color: #94A3B8;
  font-size: clamp(15px, 1.4vw, 17px);
  line-height: 1.6;
  max-width: 640px;
}
```

---

## 8 · Feature Cards

```
Glass panel, border-radius: 24px, padding: 24-28px
Icon well: 48×48, border-radius: 12px, accent bg/border
Title: Inter 700 18px
Body: Inter 400 13px, color: #94A3B8, line-height: 1.6
Link: accent color, semi-bold, arrow icon right
Hover: colour-tinted border + inset glow matching accent
```

---

## 9 · Stats / Metrics Bar

- Horizontal grid, border top/bottom `rgba(255,255,255,0.08)`
- Background: `rgba(255,255,255,0.02)` dark
- Stat value: `Inter 600; clamp(22px,3vw,33px); letter-spacing: -0.025em; tabular-nums`
- Label: `JetBrains Mono 11–12px; color: #8E8E8E`
- Hover: `translateY(-2px)` + subtle bg

---

## 10 · Buttons

| Variant | Style |
|---------|-------|
| **Primary (white glow)** | `bg: #fff; color: #000; border-radius: 9999px; glow shadow` |
| **Brand gradient** | `bg: linear-gradient(to right, #477BFF, #38D9E6); color: #fff; border-radius: 9999px;` |
| **Ghost dark** | `bg: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); color: #C8C8C8; border-radius: 9999px;` |
| **Danger** | `bg: rgba(239,68,68,0.10); border: 1px solid rgba(239,68,68,0.30); color: #EF4444; border-radius: 12px;` |

All: `transition: transform 0.22s cubic-bezier(0.22,1,0.36,1); hover: translateY(-1.5px) scale(1.02)`

---

## 11 · Inputs / Forms

```css
background: rgba(8,11,18,0.60);
border: 1px solid rgba(255,255,255,0.10);
border-radius: 12px;
padding: 10px 14px;
color: #F8FAFC;
transition: border-color 0.2s;
/* focus */
border-color: rgba(0,240,255,0.40);
box-shadow: 0 0 0 3px rgba(0,240,255,0.08);
```

Light mode: `background: #FFF; border: 1px solid rgba(15,23,42,0.15); color: #0F172A;`

---

## 12 · Badges / Chips

- Pill shape, `font-size: 10–11px; padding: 2–4px 8–10px; font-weight: 600`
- Emerald: resolved/verified; Amber: pending; Rose: urgent/rejected; Cyan: AI; Indigo: info

---

## 13 · Dashboard Sidebar

- Width: collapsed `64px` / expanded `240px`
- Background: `#04060A` dark / `#FFFFFF` light
- Border-right: `1px solid rgba(255,255,255,0.07)` dark
- Active link: `bg: rgba(0,240,255,0.06); border-left: 2px solid #00F0FF; color: #FFF`
- Hover link: `bg: rgba(255,255,255,0.04)`
- Icon: `20px`; active `color: #00F0FF`; default `rgba(255,255,255,0.45)`
- User card bottom: `background: #08080C; border-top: 1px solid rgba(255,255,255,0.06)`

---

## 14 · Animations & Motion

| Animation | Duration | Easing |
|-----------|----------|--------|
| Navbar slide-down | `0.7s` | `cubic-bezier(0.22,1,0.36,1)` |
| Headline fade-up (per line) | `0.85s` stagger 0.12s, 0.30s | `cubic-bezier(0.22,1,0.36,1)` |
| Scroll reveal `.anim` | `0.85s` with `--d` delay var | `cubic-bezier(0.22,1,0.36,1)` |
| Scroll reveal start state | `opacity:0; filter:blur(6px); transform:translateY(22px) scale(0.98)` | – |
| Card hover | `0.28s` | `cubic-bezier(0.22,1,0.36,1)` |
| Button hover | `0.22s` | `cubic-bezier(0.22,1,0.36,1)` |
| CTA revealPulse | `0.85s`, 70% overshoot to `scale(1.015)` | same |
| Mobile menu in | `0.32s` from `translateY(-12px) scale(0.96)` | `cubic-bezier(0.22,1,0.36,1)` |
| `prefers-reduced-motion` | all animations disabled; elements visible immediately | – |

---

## 15 · Footer

- Background: `#04060A` dark / `#F4F6FB` light
- Border-top: `1px solid rgba(255,255,255,0.06)`
- Padding: `clamp(64px,8vh,96px)` vertical
- Grid: logo+desc (2 cols) + 3 link columns + legal
- Bottom bar: status badge + copyright, `font-size: 11–12px`

---

## 16 · Overall Mood (3 sentences)

Proofline is **stark, cinematic, and technical** — absolute black canvas, razor-sharp typography, and surgical cyan/white glows that do all the visual work. Every element breathes with generous whitespace and film-quality easing curves, creating a product that feels simultaneously minimal and deeply polished. CivicLens inherits this DNA while layering indigo-violet for civic authority and emerald for trust/resolution, resulting in a palette that is trustworthy, alive, and state-of-the-art.

---

## 17 · Phase Plan

| Phase | Scope | Key Files |
|-------|-------|-----------|
| **1** | Design system: CSS vars, fonts, keyframes, utilities | `index.html`, `index.css`, `ThemeContext.tsx` |
| **2** | Navbar redesign (floating pill) | `Navbar.tsx` |
| **3** | Landing page redesign | `LandingPage.tsx` |
| **4** | Footer redesign | `Footer.tsx` |
| **5** | Secondary public pages | `AboutPage`, `FeaturesPage`, `HowItWorksPage`, `TransparencyPage`, `PrivacyPolicyPage`, `TermsPage` |
| **6** | Auth pages | `LoginPage`, `RegisterPage`, `ForgotPasswordPage` |
| **7** | Dashboard layout + sidebar | `DashboardLayout.tsx` |
| **8** | Citizen pages (9 pages) | `Dashboard`, `PolicyExplainer`, `SchemeExplorer`, etc. |
| **9** | Admin pages (6 pages) | `AdminDashboard`, `ComplaintManagement`, etc. |
| **10** | Polish + QA (a11y, responsive, reduced-motion, lint, build) | All |

> After each phase: `npm run lint && npm run build` — fix all errors before proceeding.

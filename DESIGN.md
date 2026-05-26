---
name: Prolio
description: >
  AI-powered portfolio and career platform. Dark-first professional design system
  with an indigo accent, a serif-and-sans type pairing, and a restrained motion
  language built around subtle lifts and glow effects.

colors:
  # Backgrounds — dark mode (default)
  background:                 "#08080a"
  surface:                    "#0e0e11"
  surface-container-low:      "#141418"
  surface-container:          "#141418"
  surface-container-high:     "#1c1c22"
  surface-container-highest:  "#232329"

  # Text
  on-background:              "#ededef"
  on-surface:                 "#ededef"
  on-surface-variant:         "#b4b4bc"
  on-surface-dim:             "#7c7c88"

  # Primary — Indigo
  primary:                    "#818cf8"
  on-primary:                 "#ffffff"
  primary-container:          "#1a1a2e"
  inverse-primary:            "#4f46e5"

  # Secondary — Rose
  secondary:                  "#f472b6"
  on-secondary:               "#ffffff"
  secondary-container:        "#2a1520"

  # Tertiary — Teal (success / live)
  tertiary:                   "#2dd4bf"
  on-tertiary:                "#ffffff"
  tertiary-container:         "#0d2220"

  # Semantic
  error:                      "#f87171"
  error-container:            "#1f0e0e"
  warning:                    "#fbbf24"
  success:                    "#4ade80"

  # Light mode surfaces (used when .light-mode class is active)
  surface-light:              "#f8f8fb"
  surface-container-light:    "#f1f1f5"
  on-surface-light:           "#0d0d14"
  on-surface-variant-light:   "#3a3a50"

typography:
  display:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: "700"
    lineHeight: 1.2
    letterSpacing: -0.02em

  headline-lg:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 1.3
    letterSpacing: -0.01em

  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: "700"
    lineHeight: 1.3

  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 19px
    fontWeight: "600"
    lineHeight: 1.4

  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: "600"
    lineHeight: 1.4

  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 1.4

  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 1.5

  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13.5px
    fontWeight: "400"
    lineHeight: 1.6

  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 1.5

  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 12.5px
    fontWeight: "600"
    lineHeight: 1.4

  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 1.4
    letterSpacing: 0.04em

  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10.5px
    fontWeight: "700"
    lineHeight: 1.4
    letterSpacing: 0.12em

rounded:
  sm:      8px
  DEFAULT: 12px
  md:      12px
  lg:      18px
  xl:      24px
  full:    9999px

spacing:
  base:          8px
  xs:            4px
  sm:            8px
  md:            16px
  lg:            24px
  xl:            40px
  gutter:        24px
  card-padding:  24px
  section-gap:   32px
  page-padding:  40px

components:
  card:
    backgroundColor: "#0e0e11"
    textColor:       "{colors.on-surface}"
    rounded:         "{rounded.xl}"
    padding:         "{spacing.card-padding}"

  card-hover:
    backgroundColor: "#0e0e11"
    # Lifts -3px, gains box-shadow 0 12px 36px rgba(0,0,0,0.28),
    # border-color switches to rgba(129,140,248,0.25)

  button-primary:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.on-primary}"
    typography:      "{typography.label-lg}"
    rounded:         "{rounded.md}"
    height:          40px
    padding:         10px 22px

  button-primary-hover:
    backgroundColor: "{colors.primary}"
    # filter: brightness(1.13); transform: translateY(-1px);
    # box-shadow: 0 4px 18px rgba(129,140,248,0.38)

  button-ghost:
    backgroundColor: transparent
    textColor:       "{colors.on-surface-variant}"
    typography:      "{typography.body-sm}"
    rounded:         "{rounded.md}"
    padding:         9px 18px

  button-ghost-hover:
    backgroundColor: "#1c1c22"
    textColor:       "{colors.on-surface}"

  button-subtle:
    backgroundColor: "#1c1c22"
    textColor:       "{colors.on-surface-variant}"
    typography:      "{typography.label-md}"
    rounded:         "{rounded.md}"
    padding:         8px 16px

  button-danger:
    backgroundColor: transparent
    textColor:       "{colors.error}"
    rounded:         "{rounded.md}"
    padding:         8px 16px

  button-danger-hover:
    backgroundColor: rgba(248, 113, 113, 0.10)

  input:
    backgroundColor: "#141418"
    textColor:       "{colors.on-surface}"
    typography:      "{typography.body-lg}"
    rounded:         "{rounded.md}"
    padding:         11px 14px

  input-focus:
    backgroundColor: "#1c1c22"
    # border-color switches to {colors.primary}

  pill-badge:
    backgroundColor: rgba(129, 140, 248, 0.12)
    textColor:       "{colors.primary}"
    typography:      "{typography.label-md}"
    rounded:         "{rounded.full}"
    padding:         5px 14px

  pill-badge-sm:
    backgroundColor: rgba(129, 140, 248, 0.12)
    textColor:       "{colors.primary}"
    typography:      "{typography.label-sm}"
    rounded:         "{rounded.full}"
    padding:         3px 10px

  section-head:
    backgroundColor: transparent
    textColor:       "{colors.on-surface-dim}"
    typography:      "{typography.label-sm}"

  chat-bubble-assistant:
    backgroundColor: "#141418"
    textColor:       "{colors.on-surface-variant}"
    rounded:         "16px 16px 16px 4px"
    padding:         11px 15px

  chat-bubble-user:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.on-primary}"
    rounded:         "16px 16px 4px 16px"
    padding:         11px 15px

  chat-bubble-error:
    backgroundColor: rgba(248, 113, 113, 0.08)
    textColor:       "{colors.error}"
    rounded:         "16px 16px 16px 4px"
    padding:         11px 15px

  spinner:
    size:   16px
    # Border: 1.5px solid color@30% opacity; border-top: 1.5px solid full color
    # Animation: spin 0.75s linear infinite

  tab-active:
    backgroundColor: "#1c1c22"
    textColor:       "{colors.on-surface}"
    typography:      "{typography.label-lg}"
    rounded:         "{rounded.sm}"
    padding:         6px 14px

  tab-inactive:
    backgroundColor: transparent
    textColor:       "{colors.on-surface-dim}"
    typography:      "{typography.label-lg}"
    rounded:         "{rounded.sm}"
    padding:         6px 14px

  tab-inactive-hover:
    backgroundColor: "#1c1c22"
    textColor:       "{colors.on-surface}"
---

## Overview

Prolio is a career platform where professionals publish AI-powered portfolios and recruiters evaluate candidates. The design reflects that dual audience: it feels polished and credible enough to hand a recruiter, while being expressive enough that job seekers feel proud to show it.

The aesthetic is **dark luxury professional** — deep near-black backgrounds, a restrained indigo accent, and a serif-and-sans type pairing that creates hierarchy without shouting. Everything is intentional: depth through layered surfaces rather than heavy shadows, motion through subtlety rather than spectacle. Borders are gossamer-thin at 6.5–11% white opacity; the surfaces beneath them do the heavy lifting.

A second `light-mode` theme flips all surface tokens to near-white values while preserving every semantic color and interaction pattern. Both themes feel designed — the light mode is not an afterthought.

**Personality:** ambitious, clean, quietly confident. Not a startup landing page; not a cold enterprise dashboard. Something in between — the way a well-designed résumé feels.

---

## Colors

The palette is built in three layers:

**Surfaces** step from near-black (#08080a) up through four surface tiers to #232329. The steps are small — just enough to create card/panel separation without harsh contrast. Cards sit on `surface` (#0e0e11); interactive containers use `surface-container-high` (#1c1c22). Borders use white at 6.5–11% opacity rather than a dedicated grey, which keeps the palette from going cold.

**Accent — Indigo (#818cf8)** is the single chromatic through-line. It appears on primary buttons, focus rings, active tabs, pill badges, interactive hover states, and the chatbot avatar. Two opacity derivatives extend it: `primary-container` at 12% opacity for badge backgrounds and subtle fills, and `primary-fixed` at 25% opacity for hover border highlights. This disciplined repetition makes the accent feel systemic, not decorative.

**Semantic colors** each carry a defined role:
- **Rose (#f472b6)** — secondary actions, profile features, supplemental highlights
- **Teal (#2dd4bf)** — live status, real-time indicators, success states. Appears with a `live-border` keyframe animation that pulses its opacity.
- **Amber (#fbbf24)** — premium or primary badges, warnings
- **Red (#f87171)** — errors, destructive actions
- **Green (#4ade80)** — completion, positive metrics

In light mode, all surface and text tokens invert while semantic colors remain unchanged. The indigo primary shifts to slightly higher contrast against the white background naturally.

---

## Typography

Two typefaces work in concert to distinguish brand voice from functional UI.

**Playfair Display** (serif) carries display-level text: the landing page hero, modal headlines, and portfolio page titles. It signals craft and editorial quality — the kind of typography found in a well-produced magazine or a premium portfolio. Used at weights 700, with tight negative tracking (−0.01 to −0.02em) at large sizes.

**Plus Jakarta Sans** (sans-serif) handles everything else — dashboard UI, labels, body copy, buttons, inputs. It is geometric and contemporary without feeling sterile. The range of weights in use (400 regular, 500 medium, 600 semibold, 700 bold) covers every hierarchy tier without requiring a second sans face.

**Scale philosophy:** the scale is dense and fine-grained in the 10–14px range, which suits information-dense UI like dashboards and sidebars. Display sizes jump to 28–36px only for moments of real visual weight. There is no intermediate 18–24px "marketing body" range — Prolio favors compact efficiency over airy editorial layouts in its app surfaces.

**Section heads** use `label-sm` (10.5px, 700 weight, 0.12em letter-spacing, uppercase) — the widest tracking in the system. This extreme spacing at small size creates clear section demarcation without adding vertical bulk.

---

## Layout & Spacing

The spacing unit is **8px**. Most values in the system are multiples of 8: 8, 16, 24, 32, 40. The 12px and 14px gaps used between tight UI rows are the only exceptions — they are deliberate comfort adjustments for dense list items, not a parallel scale.

**Page layouts:**
- **Auth / Setup:** Single-column centered, max-width 400–540px, 40px horizontal padding.
- **Dashboard:** CSS Grid `300px 1fr` with a 24–36px gap. Max-width 1280px. 32px top padding, 24px horizontal gutter. The 300px sidebar is fixed-width; the content column fills remaining space.
- **Portfolio (split):** CSS Grid `300px 1fr`, gap 36px, max-width 1440px, 48px top padding. Full-bleed variant collapses to single centered column, max-width 900px.
- **Landing:** Flex column, centered, max-width 1100px, 40px × 20px padding.

**Sticky headers** use `position: sticky`, `backdrop-filter: blur(12px)`, and a semi-transparent background to maintain context while content scrolls beneath them. This creates natural layering depth without explicit shadow elevation.

Card internal padding is consistently 22–24px, creating a comfortable breathing room that makes even dense content feel considered.

---

## Elevation & Depth

Prolio uses **tonal layering** as its primary depth signal, not shadows. The five surface tiers (background → surface → surface-container-low → surface-container → surface-container-high) stack visually to indicate Z-order without explicit drop shadows in the resting state.

**Shadows appear only on interaction:**
- **Hover lift:** Cards gain `box-shadow: 0 12px 36px rgba(0,0,0,0.28)` and translate -3px on Y.
- **Button primary hover:** `box-shadow: 0 4px 18px rgba(129,140,248,0.38)` — an indigo glow that reinforces the accent identity.
- **Source rows hover:** `box-shadow: 0 4px 14px rgba(129,140,248,0.20)` — a softer version of the same glow.
- **Modals / overlays:** `box-shadow: 0 24px 60px rgba(0,0,0,0.50)` — the heaviest shadow in the system, reserved for floating panels.
- **Card resting with glow class:** `box-shadow: 0 8px 32px rgba(129,140,248,0.14), 0 2px 8px rgba(0,0,0,0.20)` — used for highlighted or interactive cards.

This approach means depth is earned by interaction, not given by default — reinforcing a sense of intentional, calm hierarchy at rest.

---

## Shapes

The corner radius system has four named tiers plus a pill token:

| Token      | Value  | Use                                      |
|------------|--------|------------------------------------------|
| `sm`       | 8px    | Small icon containers, inline badges, delete buttons |
| `md`       | 12px   | Buttons, inputs, most interactive controls |
| `lg`       | 18px   | Section-level containers, minor panels   |
| `xl`       | 24px   | Major cards, modals, primary panels      |
| `full`     | 9999px | Pills, tags, circular icon buttons, chip-style components |

Chat message bubbles use asymmetric radii to convey directionality: assistant messages open on the top-left (16px 16px 16px 4px), user messages open on the top-right (16px 16px 4px 16px). This gives the conversation a natural visual flow without directional arrows.

The portfolio section switcher uses half-rounded radii (100px on one side, 0 on the other) to create a segmented-pill effect for layout toggles.

---

## Motion

Motion is **fast and purposeful** — it confirms interactions and guides attention without drawing attention to itself.

**Duration scale:**
- 0.12s — fastest (immediate feedback: toggles, pill selects)
- 0.15–0.18s — standard (hover color transitions, input focus)
- 0.2s — hover lifts and card glow transitions
- 0.3–0.4s — component entry (fadeUp on cards, scaleIn on modals)
- Ongoing — spinners (0.75s linear), status pulses (2.5–3s ease-in-out)

**Easing:** all transitions use `ease` or `ease-in-out`. No custom cubic-bezier curves — the default browser ease is consistent with the calm, professional aesthetic.

**Named keyframe animations and their roles:**

| Animation     | Curve                    | Role                                      |
|---------------|--------------------------|-------------------------------------------|
| `fadeUp`      | opacity 0→1, Y 12px→0   | Default component entrance                |
| `fadeIn`      | opacity 0→1              | Simple overlay / content reveal           |
| `scaleIn`     | opacity 0→1, scale 0.94→1| Modal / dialog entrance                   |
| `slideDown`   | opacity 0→1, Y -10px→0   | Dropdown / panel entrance                 |
| `spin`        | rotate 0→360deg          | Loading spinner (0.75s linear)            |
| `pulse`       | opacity 0.9→0.3→0.9      | Skeleton / pending state                  |
| `shimmer`     | bg-position sweep        | Skeleton loading shimmer                  |
| `chatDot`     | scale + opacity bounce   | Typing indicator dots                     |
| `glow-pulse`  | box-shadow 0→4px→0       | Accent glow ring on key elements          |
| `dot-ping`    | scale 1→2.2, opacity 1→0 | Live status indicator ring                |
| `live-border` | border-color teal pulse  | Live/streaming state border               |
| `float`       | Y 0→-5px→0 (3s)          | Decorative floating element motion        |
| `gradient-x`  | bg-position 0→100→0      | Animated gradient on marketing text       |

**Hover interaction model:** interactive elements follow a consistent three-state pattern. Resting state is visually quiet. Hover applies a color shift (border → accent, background → accent-d or surface-container-high) with a lift of −1 to −3px. Active/pressed state cancels the lift and applies brightness(0.95) or scale(0.98). The speed (0.15–0.2s) makes this feel snappy rather than animated.

---

## Components

### Cards
The primary content unit. Background `surface` (#0e0e11), border `1px solid rgba(255,255,255,0.11)`, radius `xl`, padding 22–24px. Add the `.card-glow` class to enable the interactive hover lift and indigo glow. Cards enter with `animation: fadeUp 0.4s ease`.

### Buttons
Three variants share radius `md` and font `label-lg`. **Primary** uses `primary` background and glows on hover. **Ghost** is transparent with a `line2` border, upgrading to `surface-container-high` background on hover. **Subtle** uses `surface-container-high` background for a mid-ground option that reads as secondary without the ghost outline. **Danger** variant uses `error` text color with a red background fill on hover — same radius and padding as ghost.

All buttons use `inline-flex` with `gap: 7px` to accommodate icon+label combinations cleanly.

### Inputs & Textareas
Background `surface-container-low`, border `line2`, radius `md`, padding 11px 14px. Focus transitions border to `primary` and background to `surface-container-high` over 0.18s. Placeholder uses `on-surface-dim`. The font family explicitly inherits `--sans` — this prevents system-font fallback in textareas.

### Pill Badges
Chip-style tags built on `label-md` or `label-sm` typography with `radius: full`. Colors are passed as props and computed as: background at 18% opacity, border at 35% opacity, text at full. This creates a consistent "tinted glass" look across any color. Size `sm` uses 3px 10px padding; default uses 5px 14px.

### Section Heads
Persistent pattern for labelling sidebar sections and tab panel groups. Uses `label-sm` at `on-surface-dim` color — the extreme 0.12em letter-spacing is what creates the divider-like visual weight without adding a physical line.

### Chat Interface
The chatbot uses a persistent sidebar panel with a flex-column layout. Message bubbles distinguish speaker via asymmetric border-radius and color: assistant messages are `surface-container-low` with `on-surface-variant` text; user messages are solid `primary` with white text. A typing indicator uses three dots animated with `chatDot` — scale and opacity bounce staggered by 0.2s each.

Bullet-point lines in assistant responses (lines starting with `- ` or `• `) render with an accent-colored `•` marker and an 8px gap, giving structured answers visual breathing room. Inline `**bold**` text renders at `font-weight: 600` in `on-surface` color for emphasis within a response.

The suggestion pill row at the bottom shows up to four pre-written questions styled as `.b-pill` buttons. They disappear progressively as the user sends those questions.

### Scrollbars
System scrollbars are replaced with a 3px thumb at `surface-container-highest` with 2px radius — barely visible, never distracting. This is applied globally and reinforces the minimal chrome aesthetic.

---

## Do's and Don'ts

**Do:**
- Use `primary` (indigo) as the single chromatic accent — keep semantic colors to their defined roles
- Apply `fadeUp` for any new component that enters the viewport
- Use `rgba(255,255,255, 0.065–0.11)` for borders in dark mode; do not use grey hex values for borders
- Give interactive cards the `.card-glow` class — hover depth is part of the interaction model
- Use `label-sm` with uppercase + 0.12em tracking for any section label or group heading
- Maintain the serif/sans split: Playfair Display for hero moments, Plus Jakarta Sans for everything functional

**Don't:**
- Introduce new accent colors — extend semantic coverage using opacity variants of existing tokens
- Use shadows in resting state — shadows signal interactivity and modal elevation only
- Mix border-radius values arbitrarily — pick from `sm / md / lg / xl / full` only
- Use font weights below 400 or above 700 in UI copy
- Add motion longer than 0.4s for UI interactions — reserve slow animation for decorative / loading contexts only
- Use the serif font in body copy, inputs, or labels — it is exclusively for display and headline moments

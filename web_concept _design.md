---
version: "superdesign-alpha"
name: "Warm-paper IDE chrome"
description: "Off-white editorial system built to look like a documentation-grade IDE: near-black pill controls, EB Garamond serif body copy over CursorGothic UI type, flat window-chrome cards with zero radius, and a single amber accent rationed to badges and links."
colors:
  background: "#F7F7F4"
  surface: "#F2F1ED"
  surface-alt: "#E6E5E0"
  text-primary: "#26251E"
  text-secondary: "#65AFE0"
  accent: "#F54E00"
  accent-gold: "#C08532"
  ink: "#000000"
typography:
  display-lg:
    fontFamily: "CursorGothic"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: "1.25"
    letterSpacing: "-0.3px"
  headline-md:
    fontFamily: "CursorGothic"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "0.1px"
  body-md:
    fontFamily: "EB Garamond"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "1.35"
  label-md:
    fontFamily: "CursorGothic"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: "1.3"
    letterSpacing: "-0.1px"
  ui-body:
    fontFamily: "CursorGothic"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.4"
  accent-mono:
    fontFamily: "berkeleyMono"
    fontSize: "13px"
    fontWeight: 400
  label-caption:
    fontFamily: "Lato"
    fontSize: "13px"
    fontWeight: 400
  icon-glyphs:
    fontFamily: "CursorIcons16"
spacing:
  base: "4px"
  gap: "8px"
  section-padding: "67px"
  section-gap-lg: "177px"
  section-gap-md: "90px"
rounded:
  control: "4px"
  pill: "9999px"
  card: "2px"
  chip: "2px"
components:
  button-primary:
    background: "#26251E"
    text-color: "#F7F7F4"
    radius: "9999px"
    height: "43px"
    padding: "12.48px 21.6px 12.8px"
    border: "1px solid rgb(38, 37, 30)"
    hover-background: "#3B3A33"
  button-secondary-glass:
    background: "rgba(38, 37, 30, 0.06)"
    text-color: "#26251E"
    radius: "0px"
    height: "35px"
    padding: "6px 12px"
  button-nav-cta:
    background: "#26251E"
    text-color: "#F7F7F4"
    radius: "9999px"
    height: "27px"
    padding: "5.6px 10.5px 5.88px"
    border: "1px solid rgb(38, 37, 30)"
    hover-background: "#3B3A33"
  button-inline-tag:
    background: "#C08532"
    text-color: "#FFFFFF"
    radius: "4px"
    height: "20px"
    padding: "2px 8px"
  card-window-chrome:
    background: "#F7F7F4"
    radius: "0px"
    padding: "112px 20px 67.2px"
    shadow: "rgba(0, 0, 0, 0.14) 0px 28px 70px 0px, rgba(0, 0, 0, 0.1) 0px 14px 32px 0px, oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px"
  card-feature-flat:
    background: "#F7F7F4"
    radius: "0px"
    padding: "0px 20px"
  card-testimonial:
    background: "#F2F1ED"
    radius: "0px"
    padding: "24px"
  card-blog:
    background: "transparent"
    radius: "0px"
    padding: "0px"
---
# Warm-paper IDE chrome
Source: https://cursor.com/

## Overview
This is a minimalist, editorial-leaning product system dressed as documentation: an off-white paper background carries dark near-black UI chrome mocked up as literal application windows (traffic-light dots, tab bars, file breadcrumbs). It reads closer to Swiss/International restraint than to typical SaaS gradient marketing — flat panels, zero decorative radius on cards, a single serif body face (EB Garamond) doing the explanatory prose while a geometric grotesk (CursorGothic) runs every UI label, nav item, and heading. Color is almost entirely absent except one amber-orange used as a link/accent color and one warm gold used for a small inline status chip — everything else is ink-on-paper.

## Composition
The first screen is text-first: a compact left-aligned two-line headline in CursorGothic sits above two buttons, with the entire right two-thirds of the viewport empty paper until a large layered window-chrome illustration begins roughly at mid-viewport, its top edge softly clipped by the fold. That illustration — a mock IDE window with a floating CLI panel overlapping its lower-right corner — is the dominant visual anchor of the page; everything below is quieter. The rejected alternative is a full-bleed hero gradient or product video background; instead the designer keeps the canvas paper-flat and lets one large software screenshot carry all visual interest, repeated in variant form at each subsequent section. Below the hero: a muted logotype strip (7 flat wordmark tiles), then an alternating stack of "screenshot + caption" bands (image-right/text-left, then image-left/text-right), a quote/testimonial grid, a three-card feature band, a blog teaser row, a centered oversized closing headline with one CTA, and a five-column link footer. Density is low-to-medium: generous section padding (67px) and large gaps between bands (177px/90px/89px) keep the page feeling like a lookbook rather than a dashboard.

## Colors
`#F7F7F4` (56.7% measured area) is the true page background — confirmed by the pixel field's near-total `#F0F0F0`-family dominance — with `#F2F1ED` (37%) used as a slightly deeper paper tone for banded sections (testimonials, footer) and window canvases. `#26251E` is the near-black ink used for all solid buttons, primary text, and borders — never a true `#000000` except in rare glyph fills. `#65AFE0` appears only as a secondary/muted text tone in specific UI captures, not as a general accent. The one true accent is `#F54E00`, a warm orange-red, rationed exclusively to inline links and small arrow-suffixed CTAs ("Explore →" style text links) — it never fills a background. `#C08532` is a second, rarer accent restricted to a single small pill/badge component. `#E6E5E0` and `#EBEAE5` are subtle stepped tints used for hairline separation between paper layers. Everything else — 90%+ of the canvas — is deliberately left uncolored: gray-beige paper and ink text, no saturated background anywhere.

## Typography
CursorGothic is the structural sans: a 26px/1.25 display size for section headlines (letter-spacing -0.3px, tightened per convention for larger sizes), a 22px label size for feature-card titles, and a 14px/1.5 size for nav and micro-labels. EB Garamond, a serif, is reserved for longer-form body sentences at 17px/1.35 — this serif-for-reading / sans-for-interface split is the system's core typographic pairing and its most editorial signature. Body copy inside UI mockups runs a smaller 16px CursorGothic. A monospace face (berkeleyMono) appears in code/CLI-styled captures for terminal text and inline code tokens. Lato shows up as a small caption face for byline/metadata rows (author · read-time). Hierarchy is established almost entirely through size and weight, not color — headlines, labels, and captions are all the same ink, differentiated by scale.

## Layout
Content is capped at a 1300px max-width, centered. Card grids observed run mostly full-width single-column stacks internally (measured item widths of 100% across rows for the window-chrome and feature-band families) — meaning the "grid" units are large full-bleed panels rather than multi-up card tiles for the primary showcase sections. The testimonial and feature-triptych bands, by contrast, are true 3-up uniform grids: rows read as [3][3] for testimonials (six quotes total) and [3] for the "stay on the frontier" feature band — equal-width cards, no spanning, a uniform card grid rather than bento or masonry. The logo strip is a [7] single-row cluster of equal tiles. Spacing runs on a small 4/8px rhythm at the component level (2px, 4px, 5px, 6px, 8px gaps) but section-level rhythm is large and irregular (177px, 90px, 89px, 67px), giving generous breathing room between conceptually distinct bands despite tight internal component spacing. Corner treatment is bimodal: 0px sharp edges on every card/panel/window, contrasted against fully pilled (9999px) buttons — no mid-radius card exists anywhere in the system.

## Components
- **Navbar**: fixed/sticky, 52px tall, `#F7F7F4` fill, ~37 total interactive items across a wordmark, five text nav items (Models, Product, Enterprise, Pricing, Resources), a Sign in link, an outline secondary button, and a filled CTA. The CTA is the pill-primary token: `#26251E` fill, `#F7F7F4` text, radius 9999px, 27px tall, padding `5.6px 10.5px 5.88px`, `1px solid rgb(38,37,30)` border, hover darkens to `#3B3A33`. A secondary outline button ("Contact sales"-role) sits directly left of it in the same row, lighter-weight bordered chip, not filled. Logo is a small geometric mark plus wordmark, left-aligned.
- **Hero primary button**: the large left-aligned pill under the headline, observed as a solid near-black fill matching `#26251E` with `#F7F7F4` text, fully pilled corners (~9999px, "full pill" feel), 43px tall, padding `12.48px 21.6px 12.8px`, `1px solid rgb(38,37,30)` border, hover → `#3B3A33`. This is the single most emphasized control on the first screen.
- **Hero secondary button**: immediately right of the primary, a lighter flat control — `rgba(38,37,30,0.06)` translucent ink fill, `#26251E` text, 0px sharp corners, 35px tall, padding `6px 12px`. Visually recedes against the solid primary; a low-emphasis companion action.
- **Window-chrome showcase card** (the dominant recurring visual unit): appears once large in the hero, then repeated at reduced scale through 6-7 mid-page bands, always paired with a short caption block beside or below it. Surface: `#F7F7F4` fill, 0px radius, heavy padding (`112px 20px 67.2px` at its largest instance), drop shadow `rgba(0,0,0,0.14) 0px 28px 70px 0px, rgba(0,0,0,0.1) 0px 14px 32px 0px, oklab(...)/0.1 0px 0px 0px 1px`. Internally it mimics a real desktop app: traffic-light dots top-left, a tab strip, a two-pane body (task/thread list left, detail/content right), occasional floating secondary panel overlapping the bottom-right corner (a CLI or chat popover) with its own lighter shadow (`rgba(0,0,0,0.02) 0px 0px 16px 0px, rgba(0,0,0,0.008) 0px 0px 8px 0px`). Each instance carries a short eyebrow-style caption (bold label + one sentence in EB Garamond) plus an orange text-link, positioned beside the mockup in alternating left/right placement.
- **Logo strip**: single row of 7 flat wordmark tiles, `#F2F1ED`-ish tinted rectangle backgrounds, 0px radius, uniform width, sits directly under a small centered caption line above the hero visual's close.
- **Testimonial card grid**: 6 cards arranged [3][3], `#F2F1ED` fill, 0px radius, ~24px padding. Anatomy top-to-bottom: quotation body text in EB Garamond (3-4 lines), then a small circular avatar + name (bold) + role/company (muted secondary) row at the card foot. No border, no shadow — separation is by background tint against the paper page.
- **Feature triptych card**: 3 cards in a single row, transparent background, 0px radius, no padding container (edge-to-edge text block). Anatomy: bold CursorGothic label heading, a line of EB Garamond/body descriptive copy, an orange arrow-suffixed text link, then a screenshot or device-mockup image filling the lower portion of the card (varies per card — code editor, phone mockup, terminal capture).
- **Blog teaser row**: 4 cards, transparent, 0px radius, anatomy: thumbnail-less text block with small circular avatar, byline name, and a muted "· N min read" caption in the Lato caption face; a "View all" orange text link sits below the row.
- **Closing CTA band**: centered single large CursorGothic headline at a much larger display size than any other heading on the page (the largest text on the page), one pill button beneath it identical in spec to the hero primary button token.
- **Footer**: `#F2F1ED` background, five-column link list (34 total links) under column headers in muted ink, plus a bottom bar with copyright text, a certification badge, and right-aligned theme/locale switch controls (segmented icon buttons).

## Graphics & Effects
No gradients carry meaningful page area — the two measured gradient strings are both near-solid single-color fills (`linear-gradient(oklab(0.263084 -0.00230259 0.0124794 / 0.05) 0%, ... 100%)` and `linear-gradient(rgb(242, 241, 237) 0%, ... 100%)`), each covering roughly 6% of the page as a subtle scrim behind a specific illustration panel, not as a full hero backdrop. The dominant "texture" in the screenshots is a soft painterly landscape-photograph wash used as a faint background behind the topmost hero window-chrome graphic — a muted, low-saturation image treatment (sky/water tones) sitting behind the mockup rather than under the whole page. Elevation is communicated through layered soft shadows rather than borders: the primary window-chrome card shadow (`0 28px 70px` + `0 14px 32px` + 1px hairline) reads as the deepest elevation tier, while floating sub-panels (CLI popovers) use a much softer, tighter shadow (`0 0 16px`/`0 0 8px` at low opacity) to sit visually above the base window without competing with it. A third shadow token (`rgb(235,234,229) 0px 0px 0px 2px`) functions as a hairline focus/definition ring rather than a drop shadow.

## Motion
Interaction transitions are fast and uniform: color/background/border/fill/gradient-stop transitions run at `0.15s cubic-bezier(0.4, 0, 0.2, 1)`, with a matching `all 0.15s` catch-all for hover states (e.g., the pill buttons' `#26251E → #3B3A33` darken). Opacity-only transitions use the same curve at both `0.15s` and `0.2s` for slightly slower fades. Named keyframes — `navItemSlideIn`, `navItemSlideOut`, `navItemFade` — drive directional enter/exit motion on navbar items, implying a staggered reveal/hide pattern rather than a simple fade. `shimmer` and `shimmer-slide` keyframes indicate a light-sweep loading treatment used somewhere in the window-chrome mockups (likely simulating live agent activity). `fade-in` is the general-purpose entrance keyframe for scroll-revealed sections. All motion is short, snappy, and functional — no springy overshoot, no long cinematic easing.

## Guardrails
- Never fill a card or section background with saturated color or a full-bleed gradient — color stays rationed to the orange link accent and the rare gold chip; everything else is ink-on-paper.
- Never round the window-chrome/feature/testimonial cards — they are 0px sharp rectangles; only buttons and chips take the pill/rounded treatment.
- Do not treat the glass secondary hero button's translucent ink fill as the primary CTA — the primary is always the solid `#26251E` pill.
- Do not scale the closing centered headline down to match body headline sizes — it must render visibly larger than any other heading as the page's terminal emphasis.
- Keep the serif (EB Garamond) confined to prose/body copy and testimonial quotes; never substitute it for nav, buttons, or labels, which stay in CursorGothic.
- Don't invent additional accent hues — orange and the single gold chip are the only departures from the ink/paper palette.
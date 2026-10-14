# Beyond the Fort · Gwalior — Heritage Tourism Platform

Case 04 (Tourism) for AI Synergy Hackathon 2026, Round 1. This is a one-page site with 3D animation. It covers the full case workflow (evidence → stakeholders → framings → problem statement → feasibility → guide safety → SRS → AI reasoning trail) and includes a working prototype of the event board and guide directory.

## Design
- **3D scene (Three.js, `js/scene.js`)**: a fort on a hill, built in code and inspired by Gwalior. It has rampart walls with blue-tile bands, towers with chhatri domes, a palace block modelled on Man Mandir, temple shikharas, a city below, stars, floating diya lanterns, a dusk sky shader and flickering lights. The camera follows a path tied to page scroll, with mouse parallax and a fly-in at load.
- **Motion**: smooth scrolling (Lenis), GSAP + ScrollTrigger for word-by-word headline reveals, a pinned sideways workflow section, staggered 3D card entrances, a roadmap line that fills as you scroll, a hero parallax and the marquee. Cards tilt in 3D, evidence cards flip, buttons pull toward the cursor, and there's a custom cursor, a loader, film grain and a scroll progress bar.
- **Typography**: Cinzel Decorative (display), Cormorant Garamond (serif body and italic accents), Yatra One / Tiro Devanagari (Hindi), Space Grotesk (UI) and JetBrains Mono (reasoning trail).
- **Palette**: night indigo, sandstone, saffron gold, terracotta and peacock teal.
- Respects `prefers-reduced-motion`, works on mobile (hamburger menu that opens in a circle animation).

## Sections / entry points (`index.html`)
| Anchor | Content |
|---|---|
| `#hero-section` | Title, key stats (67%, 8h, 8km) |
| `#problem-section` | Exposure ↔ Availability loop |
| `#evidence-section` | 6 flip cards: signal / evidence / uncertainty |
| `#workflow-section` | 7-step workflow (pinned sideways scroll) |
| `#userflow-section` | What the visitor does on the day |
| `#framing-section` | 6 framings with live weighted ranking (sliders) |
| `#statement-section` | Final problem statement |
| `#events-section` | Event board: today/tomorrow/week, category, search, plan-B banner, details popup with map link and local norms |
| `#guides-section` | Two-check guide verification and guide cards |
| `#feasibility-section` | Buildable / not rentable / legal-risk verdicts |
| `#login-section` | Phone login demo for every country code (front-end only, no real SMS) |
| `#srs-section` | Functional and non-functional requirements, phased roadmap |
| `#trail-section` | Typed AI reasoning trail (plan-act-observe-verify-rank) |

## Data (RESTful Table API)
- `events`: title, category, venue, area, day_offset, time, capacity (open/filling/full), price, distance_km, source_status (verified/stakeholder/inferred), sensitivity, description
- `guides`: name, role, specialty, sites[], languages[], credential, site_qualified, accountable, rating, tours

These are read with `GET tables/{name}?limit=100`. If the API isn't reachable, the page falls back to sample data in `js/data.js`. All sample data is for illustration only.

## Not yet implemented
- Real OTP/SMS, a masked-call relay and in-app chat (these need a backend)
- An operator submission form and an admin verification queue
- A stale-data flag (FR-04) and visitor caps that limit promotion of fragile sites
- A Hindi language toggle

## Next steps
1. Add an operator submission form (POST `tables/events`) and a moderation status.
2. Add a `last_checked` field and show a "stale" badge.
3. Add a Hindi/English toggle.
4. Publish from the **Publish tab**.

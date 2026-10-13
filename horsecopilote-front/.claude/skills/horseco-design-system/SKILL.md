---
name: horseco-design-system
description: HorseCo-Pilote Angular front end — folder architecture (same as the EPF Core front: one folder per screen with its HTTP service, model/, decor/), visual identity — colors, typography, spacing, shared UI components (button, badge, field, sidebar, slot card, lesson block, horse option, AG Grid tables, modal) and business display rules (greyed-out and highlighted states). Use it whenever you create or change a screen, component, style or page in the front end, even if the request does not mention design (for example "add the horses page", "build the enrollment screen", "create a table component").
---

# HorseCo-Pilote — Design system (Angular front end)

This skill makes every screen of the front end follow **the same visual identity as the Figma mockup** ("HorseCo-Pilote — Maquette", HorseCopilot team). It complements `CLAUDE.md` (business rules, roles, enums): `CLAUDE.md` says *what* to display, this skill says *how*.

Read these references before writing code:

- `references/tokens.scss`: the CSS custom properties (colors, typography, radii, shadows, spacing) to copy as-is into `src/styles/_tokens.scss`.
- `references/components.md`: the specification of every shared component (API, variants, states, sizes) and of the page patterns (AG Grid table, modal, login). Every data table uses AG Grid, themed with the tokens.

## 1. Identity

- **Mood**: stable, nature, calm and professional. Deep forest green, cream background, amber accents (alerts / highlights) and brown (secondary).
- **Platform**: **desktop only** (mockup at 1440 × 900). No mobile screens; render cleanly from 1280 to 1920 px wide.
- **UI language**: French. Code (component names, classes, variables) stays in English, as required by `CLAUDE.md`.

## 2. Non-negotiable rules

1. **No hard-coded color, font size, radius or shadow** in a component: always `var(--hc-…)` from `_tokens.scss`. If a token is missing, add it to `_tokens.scss` (and mention it) instead of writing a raw value.
2. **Fonts**: *Fraunces* (SemiBold 600) only for screen and modal titles; *DM Sans* for everything else. Never Inter, Roboto or the system font.
3. **Reuse the shared components** in `src/app/decor/` (selector prefix `hc-`) before creating a new one. Anything used on two screens becomes a shared component.
4. **Business states come from the API**: the front end never recomputes business rules. It displays `selectable` + reason (greyed-out horse), the slot level (out-of-level slot greyed out) and `hasPendingMembers` (highlighted lesson) exactly as the back end returns them.
5. **A greyed-out item always explains why**: visible reason (`--hc-text-disabled` text + reason in `--hc-status-danger`), never a silent disabled element.
6. **Accessibility**: WCAG AA contrast minimum, visible focus (`outline: 2px solid var(--hc-highlight-late)` + `outline-offset: 2px`), greyed-out items with `aria-disabled="true"` and their reason readable by screen readers.

## 3. Colors (summary — exact values in `references/tokens.scss`)

| Role | Token | Value |
|---|---|---|
| Primary (buttons, sidebar, selection) | `--hc-brand-primary` | `#1F3D2B` |
| Primary hover / active sidebar item | `--hc-brand-primary-hover` | `#2C5239` |
| Soft brand background (brand badge, selection) | `--hc-brand-primary-soft` | `#E3ECE4` |
| Secondary (brown) | `--hc-brand-secondary` | `#8B5E3C` |
| Page background (cream) | `--hc-bg-page` | `#F7F3EA` |
| Surfaces (cards, tables, modals) | `--hc-bg-surface` | `#FFFFFF` |
| Subtle background (table headers, notes) | `--hc-bg-subtle` | `#F1EBDD` |
| Disabled background (unavailable) | `--hc-bg-disabled` | `#EEECE7` |
| Sidebar | `--hc-bg-sidebar` | `#1F3D2B` |
| Borders | `--hc-border-default` / `--hc-border-strong` | `#E4DACA` / `#CDBFA8` |
| Text | `--hc-text-primary` / `--hc-text-muted` / `--hc-text-disabled` | `#1E2420` / `#6B6F68` / `#A9A79F` |
| Text on dark background | `--hc-text-inverse` / `--hc-text-sidebar-muted` | `#FFFFFF` / `#B9CBBE` |
| Success / Warning / Danger / Info | `--hc-status-*` and `--hc-status-*-soft` | see tokens |
| Highlight (late enrollment) | `--hc-highlight-late` / `--hc-highlight-late-soft` | `#F2C14E` / `#FFF4D6` |

## 4. Typography

| Style | Font | Size / line height | Usage |
|---|---|---|---|
| `display` | Fraunces 600 | 32 / 40 | Screen title (one per page) |
| `title-1` | Fraunces 600 | 24 / 32 | Modal title, key card title |
| `title-2` | DM Sans 600 | 18 / 26 | Section title, day of the week |
| `body` | DM Sans 400 | 14 / 20 | Body text, table cells |
| `body-strong` | DM Sans 600 | 14 / 20 | Button labels, first table column, key values |
| `label` | DM Sans 500 | 13 / 18 | Field labels, filter legends |
| `caption` | DM Sans 500 | 12 / 16 | Badges, table headers (UPPERCASE), metadata |

Matching utility classes: `.hc-display`, `.hc-title-1`, `.hc-title-2`, `.hc-body`, `.hc-body-strong`, `.hc-label`, `.hc-caption` (defined in `tokens.scss`).

## 5. Spacing, radii, shadows

- **4 px grid.** Common values: 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40.
- **Page**: padding `32px 40px`, vertical gap between blocks `20–24px`.
- **Card**: padding `20px`, inner gap `12px`, radius `12px`, 1 px `--hc-border-default` border, `--hc-bg-surface` background, no shadow.
- **Modal**: 520–600 px wide, padding `28px`, radius `16px`, `--hc-shadow-modal` shadow, `--hc-scrim` backdrop.
- **Radii**: `8px` buttons / fields / sidebar items, `10px` notes / lesson blocks / horse rows, `12px` cards / tables, `16px` modals / login card, `999px` badges and choice chips.

## 6. Screen layout

- **Signed-in screen**: fixed **240 px** sidebar on the left (`--hc-bg-sidebar`) + flexible content area (`--hc-bg-page`).
- **Page header**: title (`display`) and a one-sentence explanation (`body`, `--hc-text-muted`) on the left; primary actions or a filter on the right, bottom-aligned.
- **Sidebar**: logo (36 px amber "H" monogram + "HorseCo-Pilote" + "Centre équestre"), section label ("MENU", or "GESTION" for the admin), role-specific items, then at the bottom the user card (initials, name, role) and "Se déconnecter".
  - Member: Créneaux de la semaine · Mes cours
  - Coach: Agenda de la semaine · Chevaux
  - Admin: Membres · Coachs · Chevaux · Créneaux hebdomadaires · Toutes les leçons
- **Login**: split screen — green brand panel on the left (620 px, Fraunces 40/50 tagline) + centered white login card (440 px) on the right.

## 7. Enum → display mapping

| Enum (back end) | Value | Displayed label | Badge tone |
|---|---|---|---|
| `LessonStatus` | `PREVUE` / `ANNULEE` / `TERMINEE` | Prévue / Annulée / Terminée | info / danger / neutral |
| `HorseStatus` | `DISPONIBLE` / `REPOS` / `PRE` / `CONVALESCENCE` | Disponible / Repos / Au pré / Convalescence | success / neutral / brand / warning |
| `Role` | `MEMBER` / `COACH` / `ADMIN` | Membre / Coach / Admin | brand / info / danger |
| `LessonType` | `CSO`, `DRESS`, `TAP`, `ETHOLOGIE`, `MISE_EN_SELLE` | CSO, DRESS, TAP, ETHOLOGIE, MISE EN SELLE | `body-strong` text |
| `Location` | `CARRIERE`, `PRE`, `MANEGE`, `BOX`, `PADOCK` | Carrière, Pré, Manège, Box, Padock | `body` text |
| Level | integer | "Galop 4" | brand (neutral when greyed out) |

Keep these mappings in a single file (`src/app/decor/labels.ts`): label + badge tone per value.

## 8. Business visual states

- **Out-of-level slot (member)**: `--hc-bg-disabled` card, `--hc-text-disabled` text, neutral level badge, no button, "Niveau insuffisant" caption.
- **Full slot**: regular card, warning badge "Complet", no button.
- **Slot the member is enrolled in**: `--hc-brand-primary-soft` background, 1.5 px `--hc-brand-primary` border, success badge "✓ Inscrit".
- **Highlighted lesson (coach)**: `--hc-highlight-late-soft` background, **2 px** `--hc-highlight-late` border, warning badge "+1 inscrit", plus an amber alert banner at the top of the agenda.
- **Cancelled lesson**: `--hc-bg-disabled` background, greyed-out text, danger badge "Annulée".
- **Lesson to create**: `--hc-bg-page` background, **dashed** `--hc-border-strong` border.
- **Non-selectable horse**: `--hc-bg-disabled` row, greyed-out text, reason in `--hc-status-danger` (e.g. "Poids cavalier > 20 %", "Statut : REPOS", "3/3 h aujourd'hui", "2 h consécutives : pause nécessaire", "Déjà attribué sur ce créneau", "Niveau requis : Galop 6").
- **Selected horse**: `--hc-brand-primary-soft` background, 1.5 px `--hc-brand-primary` border, filled radio.

## 9. UI copy (French)

- Dates: "Lun. 12 oct.", "Mercredi 14 octobre 2026". Times: "18:00 – 19:00" (en dash with spaces).
- Capacity: "9/12 places". Horse workload: "2/3 h".
- Buttons: infinitive verb ("S'inscrire", "Créer la leçon", "Valider et attribuer les chevaux"). Destructive action: danger button + confirmation modal.
- Tone: formal "vous", short sentences, state the consequence ("Les 7 chevaux attribués seront libérés automatiquement.").

## 10. Procedure for a new screen or component

1. Re-read `CLAUDE.md` (business rules for the screen) and `references/components.md`.
2. Check that `src/styles/_tokens.scss` exists and is imported in `src/styles.scss`, and that the fonts are loaded in `src/index.html` (otherwise add them from `references/tokens.scss`).
3. List the shared components you need; create the missing ones in `src/app/decor/` following their specification.
4. Build the screen in `src/app/<screen>/` (component + `<screen>-service.ts`, interfaces in `src/app/model/`, see `references/architecture.md`) with the layout from § 6, using only tokens and shared components.
5. Check: no hard-coded values (`grep -nE "#[0-9a-fA-F]{3,6}|[0-9]+px"` on component `.scss` files, excluding `_tokens.scss`), greyed-out states show their reason, focus is visible, UI text is in French.
6. Run `npm test` and `npm run build`.

## 11. Git

Never add Claude as a co-author of commits: no `Co-Authored-By: Claude …` trailer (nor any other Claude/Anthropic attribution) in commit messages or pull request descriptions.

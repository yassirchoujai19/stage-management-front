# Stage Management — Design System

Reference spec for the frontend. Everything here was read off the Figma
maquettes, not invented.

**Source:** [stage-management-maquetes](https://www.figma.com/design/w3RnA6Z6jfuEUBSgwGFqce/stage-management-maquetes)
(file key `w3RnA6Z6jfuEUBSgwGFqce`)

**Screens covered**

| Screen                         | Node    |
| ------------------------------ | ------- |
| Login                          | `2:2`   |
| Dashboard (admin overview)     | `1:9`   |
| Create user                    | `2:42`  |
| Edit user (+ deactivate modal) | `2:144` |

The file defines **no Figma variables** — every value below was extracted from
the raw fills and text styles, then normalised into the scales in this
document. The scales are Tailwind's slate / blue / emerald / red ramps, which
is what the maquettes were drawn with.

Machine-readable version: [`src/assets/tokens.css`](src/assets/tokens.css).

---

## 1. Principles

1. **Dense, not airy.** Body text is `12px`, controls are `30–40px` tall. This
   is an admin tool — a screen shows a lot of rows.
2. **Neutral by default, colour means something.** Blue = primary action or
   active state. Green = healthy. Red = destructive. Everything else is slate.
3. **One elevation.** Cards use a `1px` border plus a barely-there shadow, not
   a drop shadow. Only modals lift off the page.
4. **Two layers of tokens.** Components reference semantic tokens
   (`--color-text-muted`), never primitives (`--slate-400`). Re-theming means
   re-pointing the semantic layer.

---

## 2. Colour

### 2.1 Primitives

**Neutral — slate.** The whole UI sits on this ramp.

| Token         | Hex       | Used for                               |
| ------------- | --------- | -------------------------------------- |
| `--slate-50`  | `#f8fafc` | App canvas, table header, filled input |
| `--slate-100` | `#f1f5f9` | Row dividers, neutral badge fill       |
| `--slate-200` | `#e2e8f0` | Default border                         |
| `--slate-300` | `#cbd5e1` | Hover border                           |
| `--slate-400` | `#94a3b8` | Meta text, breadcrumbs, placeholders   |
| `--slate-500` | `#64748b` | Secondary text, inactive nav           |
| `--slate-700` | `#334155` | Form labels, secondary button text     |
| `--slate-800` | `#1e293b` | Table cell values, input values        |
| `--slate-900` | `#0f172a` | Headings, stat values                  |
| `--white`     | `#ffffff` | Cards, sidebar, topbar, modal          |

**Brand — blue.**

| Token        | Hex       | Used for                                         |
| ------------ | --------- | ------------------------------------------------ |
| `--blue-50`  | `#eff6ff` | Info callout background                          |
| `--blue-100` | `#dbeafe` | Active nav pill, role badge fill, callout border |
| `--blue-600` | `#2563eb` | Primary button, links, eyebrow labels, logo tile |
| `--blue-700` | `#1d4ed8` | Primary hover, badge text                        |
| `--blue-800` | `#1e40af` | Active nav label                                 |

**Success — emerald.**

| Token           | Hex       | Used for                  |
| --------------- | --------- | ------------------------- |
| `--emerald-500` | `#10b981` | Status dot                |
| `--emerald-600` | `#059669` | "Active", "+12 this term" |

**Danger — red / rose.**

| Token        | Hex       | Used for                               |
| ------------ | --------- | -------------------------------------- |
| `--red-50`   | `#fef2f2` | Danger-zone panel fill (at ~60% alpha) |
| `--red-300`  | `#fca5a5` | Danger-zone border                     |
| `--red-500`  | `#ef4444` | Required-field asterisk                |
| `--red-600`  | `#dc2626` | Destructive button, modal icon         |
| `--rose-500` | `#f43f5e` | "Needs attention" stat delta           |

**Warning — amber.** Not present in the maquettes. Added so pending /
expiring states have somewhere to go: `--amber-50 #fffbeb`,
`--amber-100 #fef3c7`, `--amber-500 #f59e0b`, `--amber-600 #d97706`.

### 2.2 Semantic tokens

Surfaces and borders:

```
--color-canvas          #f8fafc   app background (dashboard, forms)
--color-canvas-auth     #f4f6fa   login screen only
--color-surface         #ffffff   card, sidebar, topbar, modal
--color-surface-subtle  #f8fafc   table head, filled input
--color-surface-muted   #f1f5f9   neutral badge, row hover

--color-border          #e2e8f0             default hairline
--color-border-soft     rgba(226,232,240,.8) card outline
--color-border-divider  #f1f5f9             table row separator
--color-border-strong   #cbd5e1             hover / focus border
```

Text:

```
--color-text            #0f172a   headings, stat values
--color-text-body       #1e293b   table cells, input values
--color-text-label      #334155   form labels
--color-text-secondary  #64748b   helper copy
--color-text-muted      #94a3b8   meta, breadcrumb, caption
--color-text-inverse    #ffffff
--color-text-link       #2563eb
```

### 2.3 Tones

Five tones — `brand`, `success`, `danger`, `warning`, `neutral` — each
exposing the same slots, so badges / callouts / status dots switch tone with
one prop instead of one variant each:

```
--tone-{name}-bg          panel fill
--tone-{name}-bg-solid    filled button / dot
--tone-{name}-bg-subtle   badge fill
--tone-{name}-border
--tone-{name}-fg          text on the subtle fill
```

### 2.4 Contrast

Checked against WCAG AA (4.5:1 body, 3:1 large text and UI boundaries):

| Pair                         | Ratio  | Verdict                    |
| ---------------------------- | ------ | -------------------------- |
| `--slate-900` on `--white`   | 17.9:1 | pass                       |
| `--slate-800` on `--white`   | 14.4:1 | pass                       |
| `--slate-500` on `--white`   | 5.0:1  | pass                       |
| `--slate-400` on `--white`   | 3.0:1  | **large text / meta only** |
| `--white` on `--blue-600`    | 5.2:1  | pass                       |
| `--white` on `--red-600`     | 4.8:1  | pass                       |
| `--emerald-600` on `--white` | 3.8:1  | **≥14px semibold only**    |
| `--blue-700` on `--blue-100` | 6.9:1  | pass                       |

Two rules follow: never set `--color-text-muted` on body-length copy, and
never render `--emerald-600` at the `10px` badge size.

---

## 3. Typography

**Family:** Roboto, loaded from Google Fonts. Fallback stack:
`system-ui, -apple-system, 'Segoe UI', sans-serif`.

Weights in use: 400 regular, 500 medium, 600 semibold, 700 bold.

### 3.1 Scale

| Token        | Size / line-height | Weight  | Where                                    |
| ------------ | ------------------ | ------- | ---------------------------------------- |
| `--text-2xs` | 10 / 15            | 700     | Badge text, avatar caption               |
| `--text-xs`  | 11 / 16            | 500–700 | Eyebrow, table header, meta              |
| `--text-sm`  | **12 / 16**        | 400–700 | **Body default** — labels, inputs, cells |
| `--text-md`  | 14 / 20            | 500–700 | Sidebar nav item                         |
| `--text-lg`  | 16 / 20–24         | 700     | Card title, sidebar wordmark             |
| `--text-xl`  | 20 / 28            | 700     | Topbar page title                        |
| `--text-2xl` | 22 / 27            | 700     | Auth card title                          |
| `--text-3xl` | 24 / 32            | 700     | Section hero title                       |
| `--text-4xl` | 30 / 36            | 700     | Stat value                               |

### 3.2 Named roles

| Role              | Spec                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Eyebrow**       | 11px / 700 / uppercase / `0.06em` tracking / `--blue-600`. e.g. `WELCOME BACK`, `ACADEMIC YEAR 2025–26`, `NEW ACCOUNT` |
| **Page title**    | 20px / 700 / `--color-text` (topbar)                                                                                   |
| **Hero title**    | 24px / 700 / `--color-text` (content area)                                                                             |
| **Card title**    | 16px / 700 / `--color-text`                                                                                            |
| **Card subtitle** | 12px / 400 / `--color-text-muted`                                                                                      |
| **Field label**   | 12px / 600 / `--color-text-label`; required marker is a `--red-500` `*`                                                |
| **Table header**  | 11px / 700 / uppercase / `--color-text-muted`                                                                          |
| **Breadcrumb**    | 11px / 500 / `--color-text-muted`, e.g. `Administration / Users`                                                       |
| **Helper text**   | 10–11px / 400 / `--color-text-secondary`                                                                               |

> The Figma text nodes contain fractional sizes (`11.778px`, `13.622px`) —
> artefacts of auto-width text frames. Round to the scale; do not reproduce
> them.

---

## 4. Space

4px base grid. Everything in the maquettes lands on it.

```
--space-1   4     --space-6   24
--space-2   8     --space-8   32
--space-3   12    --space-10  40
--space-4   16    --space-12  48
--space-5   20    --space-16  64
```

Recurring applications:

| Context                    | Value                           |
| -------------------------- | ------------------------------- |
| Page gutter                | `32`                            |
| Gap between page sections  | `32`                            |
| Card padding               | `20–24`                         |
| Card padding (form cards)  | `24`                            |
| Table cell padding         | `16` vertical / `24` horizontal |
| Form field row gap         | `16`                            |
| Two-column form gap        | `12`                            |
| Label → control            | `4`                             |
| Icon → label (nav, button) | `8–12`                          |
| Stat card grid gap         | `16`                            |

---

## 5. Radii

| Token           | Value  | Applied to                                         |
| --------------- | ------ | -------------------------------------------------- |
| `--radius-xs`   | 4px    | Badges                                             |
| `--radius-sm`   | 6px    | Compact inputs (30/34px), icon chips               |
| `--radius-md`   | 8px    | Buttons                                            |
| `--radius-lg`   | 12px   | Large inputs (38/40px), nav pills, callouts, modal |
| `--radius-xl`   | 16px   | Cards, auth card                                   |
| `--radius-full` | 9999px | Status dots, avatars                               |

---

## 6. Elevation

| Token         | Value                                                          | Applied to                       |
| ------------- | -------------------------------------------------------------- | -------------------------------- |
| `--shadow-xs` | `0 1px 1px rgba(0,0,0,.05)`                                    | Cards, filled buttons, logo tile |
| `--shadow-md` | `0 4px 6px rgba(15,23,42,.05), 0 10px 15px rgba(15,23,42,.08)` | Dropdowns, popovers              |
| `--shadow-lg` | `0 8px 5px rgba(0,0,0,.1), 0 20px 12.5px rgba(0,0,0,.1)`       | Modal                            |

Cards get their definition from the border, not the shadow. If a card looks
flat, that is correct.

---

## 7. Motion

```
--duration-fast 120ms   hover, focus
--duration-base 180ms   dropdown, disclosure
--duration-slow 260ms   modal enter

--ease-out    cubic-bezier(.16, 1, .3, 1)
--ease-in-out cubic-bezier(.4, 0, .2, 1)
```

All motion is wrapped in `@media (prefers-reduced-motion: reduce)`.

---

## 8. Layout

```
--layout-sidebar-width  256px
--layout-topbar-height  72px
--layout-gutter         32px
--layout-content-max    1600px
--layout-form-max       768px    create / edit user card
--layout-auth-card      420px
```

**Shell** — fixed left sidebar, sticky topbar, scrolling content:

```
┌──────────┬──────────────────────────────────────┐
│ sidebar  │ topbar   breadcrumb + title + user   │ 72px
│ 256px    ├──────────────────────────────────────┤
│          │                                      │
│ logo     │  content, 32px gutter                │
│ nav      │                                      │
│ …        │                                      │
│ logout   │                                      │
└──────────┴──────────────────────────────────────┘
```

**Auth** — centred `420px` card on `--color-canvas-auth`.

**Form pages** — `768px` column, left-aligned under the topbar, with a
"← Back to users" link above the card and a right-aligned action bar below it.

### Control heights

| Token                 | Value | Where                                    |
| --------------------- | ----- | ---------------------------------------- |
| `--control-height-sm` | 30px  | Inline / in-card controls, modal buttons |
| `--control-height-md` | 34px  | Form inputs, form action buttons         |
| `--control-height-lg` | 40px  | Auth submit, primary page action         |

### Breakpoints

Not designed — the maquettes are 1920px only. Proposed, to be confirmed with
the designer:

```
sm  640px   stat grid → 2 columns
md  1024px  sidebar collapses to an off-canvas drawer
lg  1280px  stat grid → 5 columns, tables stop scrolling horizontally
```

---

## 9. Components

Each entry lists the spec taken from the maquettes. Anything marked _(added)_
is not in Figma and was filled in for completeness — confirm before shipping.

### 9.1 Button

| Variant           | Fill         | Border           | Text              | Seen as                                                       |
| ----------------- | ------------ | ---------------- | ----------------- | ------------------------------------------------------------- |
| `primary`         | `--blue-600` | —                | white 600         | "Sign in securely", "Add user", "Save changes", "Create user" |
| `secondary`       | `--white`    | `--color-border` | `--slate-700` 500 | "Cancel", "Change supervisor"                                 |
| `danger`          | `--red-600`  | —                | white 500         | "Deactivate user", "Deactivate"                               |
| `ghost` _(added)_ | transparent  | —                | `--slate-500`     | Icon-only topbar actions                                      |
| `link`            | —            | —                | `--blue-600` 700  | "View all", "Forgot password?", "Back to users"               |

- Radius `8px` at sm/md, `12px` at lg.
- Filled variants carry `--shadow-xs`.
- Icon `12px` (sm/md) or `14px` (lg), `8px` gap, before or after the label.
- Hover _(added)_: primary → `--blue-700`, danger → `--red-700`, secondary →
  `--color-surface-subtle` + `--color-border-strong`.
- Disabled: `opacity .55`, `cursor: not-allowed`.
- Loading: spinner replaces the leading icon, `aria-busy="true"`.

### 9.2 Text input

- Two sizes: **compact** `30px` / radius `6px` (form pages) and **large**
  `38px` / radius `12px` (auth).
- Compact: `--white` fill, `--color-border` border, `12px` horizontal padding.
- Large: `--slate-50` fill, `--color-border` border, `14px` left icon at
  `14px`, text starts at `39px`.
- Value `12px` / `--color-text-body`; placeholder `--color-text-muted`.
- Focus _(added)_: `--blue-600` border + `3px` `rgba(37,99,235,.35)` ring.
- Error _(added)_: `--red-500` border, message `11px` `--red-600` below.

### 9.3 Textarea

Same as compact input; `70px` (create) / `58px` (edit) tall, `10–12px`
padding, `16px` line-height, vertical resize only.

### 9.4 Select

Compact input shell plus a `9–10px` `chevron-down` icon inset `12px` from the
right edge.

### 9.5 Checkbox

`16px` square (`12px` inside the internship-section header), `--blue-600` when
checked with a white tick, `--radius-xs`. Label `12px`
`--color-text-secondary`, `8–24px` gap.

### 9.6 Badge

- `20px` tall, `radius 4px`, `8px` horizontal padding.
- Text `10px` / 700 / uppercase.
- Tones: role `STUDENT` → `--blue-100` on `--blue-700`; `SUPERVISOR`, `ADMIN`
  → `--slate-100` on `--slate-700`.

### 9.7 Status indicator

`6px` dot at `--radius-full` plus a label, `12px` gap.

| State              | Dot             | Label                     |
| ------------------ | --------------- | ------------------------- |
| Active             | `--emerald-500` | `--emerald-600`, 11px/700 |
| Inactive _(added)_ | `--slate-400`   | `--slate-500`             |

### 9.8 Card

- `--color-surface`, `1px --color-border-soft`, `radius 16px`,
  `--shadow-xs`.
- Optional header: title `16px/700` + subtitle `12px --color-text-muted`,
  `24px` padding, right-aligned `link` action.
- Body padding `20–24px`; tables sit flush (no body padding).

### 9.9 Stat card

`122px` tall, `radius 16px`, `20px` padding.

```
label   12px / 500 / --color-text-secondary
value   30px / 700 / --color-text          (24px above the label)
delta   12px / 400 or 700                  (positioned 84px from the top)
```

Delta tones: positive → `--emerald-600` 700; neutral → `--color-text-muted`
400; attention → `--rose-500` 700.

Dashboard renders five across at `16px` gap.

### 9.10 Table

- Header row: `--slate-50` fill, `1px --color-border-divider` top and bottom,
  `37.5px` tall, labels `11px/700` uppercase `--color-text-muted`.
- Body row: `65px` tall, separated by `1px --color-border-divider`. No border
  above the first row.
- Cell padding `24px` horizontal.
- Primary cell stacks a `12px/700 --color-text-body` name over an
  `11px/400 --color-text-muted` email.
- Row hover _(added)_: `--color-surface-muted`.
- Empty and loading states are **not designed** — needed before build.

### 9.11 Sidebar

- `256px`, `--white`, `1px --color-border` right edge.
- Header: `36px` `--blue-600` tile (`radius 12px`, `--shadow-xs`, `18px` white
  glyph) + two-line wordmark `16px/700`, `20px` line-height.
- Nav item: `44px` tall, `radius 12px`, `16px` icon inset `14px`, label at
  `44px`.
  - Active: `--blue-100` fill, `--blue-800` label, weight 700.
  - Inactive: transparent, `--slate-500` label, weight 500.
  - Hover _(added)_: `--color-surface-muted`.
- Logout sits at the bottom, styled as an inactive nav item, above a
  `1px --color-border-divider` rule.

> The maquettes vary the sidebar between screens (256 / 240 / 224px wide,
> 44 / 36 / 32px items). **256px with 44px items is the canonical version** —
> that is the dashboard, the most complete screen.

### 9.12 Topbar

`72px`, `--white`, `1px --color-border` bottom border, `32px` gutter.
Left: breadcrumb `11px --color-text-muted` over page title `20px/700`.
Right: `16px` notification bell, then name `12px/700 --color-text-body` over
role `10px/500 --color-text-muted` (right-aligned), then a `36px` avatar.

### 9.13 Callout

Bordered panel introducing a conditional section.

| Tone     | Fill             | Border       | Seen as                          |
| -------- | ---------------- | ------------ | -------------------------------- |
| `brand`  | `--blue-50`      | `--blue-100` | "Student internship information" |
| `danger` | `--red-50` @ 60% | `--red-300`  | "Deactivate account"             |

`radius 12px`, `16px` padding. Optional `24px` `--blue-600` icon chip
(`radius 6px`) on the left. Title `12px/700 --color-text`, body
`10–11px --color-text-secondary`. Actions right-aligned.

### 9.14 Modal

- `320px` wide, `--white`, `1px --color-border`, `radius 12px`,
  `--shadow-lg`, `16px` padding.
- Leading `32px` circular tone chip (danger: `--red-600` + white
  `alert-triangle`).
- Title `12px/700` at `60px` from the top; body `11px/17px
--color-text-muted`.
- Footer: right-aligned `secondary` + tone-matched confirm, both `sm`.
- Behaviour _(added)_: focus trap, restore focus on close, `Esc` closes,
  `role="alertdialog"` for destructive confirmations, scrim
  `rgba(15,23,42,.45)`.

### 9.15 Auth card

`420px` × `479px`, `--white`, `1px --color-border`, `radius 16px`,
`--shadow-xs`, `32px` padding, on `--color-canvas-auth`.
Eyebrow → `22px` title → `12px --color-text-secondary` subtitle → fields →
`40px` full-width primary → help panel (`rgba(241,245,249,.7)` fill,
`--color-border` border, `radius 12px`, `12px --color-text-secondary`).

---

## 10. Icons

17 SVGs exported from the maquettes into
[`src/assets/icons/`](src/assets/icons/):

`logo`, `dashboard`, `users`, `students`, `supervisors`, `logout`, `bell`,
`avatar`, `plus`, `mail`, `lock`, `eye`, `checkbox`, `arrow-right`,
`graduation`, `chevron-down`, `alert-triangle`

Rules:

- Sizes: `9px` (chevron), `12px` (in buttons), `14px` (in inputs), `16px`
  (nav, standard), `18px` (logo glyph).
- Figma exports carry hard-coded fills. Rewrite them to `currentColor` so an
  icon inherits the surrounding text colour; keep `fill="none"`.
- Never hand-draw a replacement for a Figma icon — use the exported vector.
- Decorative icons take `aria-hidden="true"`; icon-only controls need an
  `aria-label`.

---

## 11. States & accessibility

Rules that the maquettes do not draw but the build needs.

- **Focus.** `2px --blue-600` outline at `2px` offset, `:focus-visible` only.
  Never remove it.
- **Hover.** Filled buttons darken one step; rows and nav items go to
  `--color-surface-muted`.
- **Disabled.** `opacity .55` + `cursor: not-allowed`. Disabled links get
  `tabindex="-1"` and `aria-disabled="true"` rather than the `disabled`
  attribute, which does not exist on `<a>`.
- **Loading.** Buttons keep their width and show a spinner with
  `aria-busy="true"`. Tables and cards need skeletons — not yet designed.
- **Error.** `--red-500` border on the control, `11px --red-600` message
  below, and `aria-describedby` wiring the two together.
- **Required.** `*` in `--red-500` after the label, plus `required` on the
  control. The asterisk alone is not an accessible signal.
- **Colour is never the only signal.** Status pairs a dot with a word; error
  pairs a border with a message.
- **Target size.** `30px` controls are below the 44px touch guideline. Fine on
  desktop; the mobile pass must grow them.
- **Dark mode.** Not designed. The token layer is structured so a dark theme
  means overriding the semantic block only — but do not ship one before the
  designer produces it.

---

## 12. Open questions for the designer

1. Sidebar width and nav-item height differ across the four screens — confirm
   256/44 as canonical.
2. No hover, focus, disabled, or loading states are drawn anywhere.
3. No empty / error / loading states for the table or the dashboard.
4. No breakpoints below 1920px.
5. No toast or inline-alert pattern, though forms clearly need success and
   failure feedback.
6. No pagination, sorting, search, or filter controls, though the users table
   implies all four.
7. No dark theme.

---

## 13. Using the tokens

```css
/* src/main.js already imports src/assets/main.css, which pulls in tokens. */

.thing {
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  color: var(--color-text-body);
  font-size: var(--text-sm);
}
```

Two rules:

- Components reference **semantic** tokens. `--slate-400` in a component is a
  bug; `--color-text-muted` is correct.
- A raw hex or px value in a component is a bug too. If the scale is missing
  something, add it here first.

# Handoff: from the onboarding prototype to the eshop + admin project

This file describes the finished **makro distribuce registration prototype** and how it was built, so a new
project (an eshop with an administration section) can reuse its decisions, design language and ways of working.
Paste it (or point Claude to it) at the start of the new thread.

> Status of the source project: onboarding flow is done and accepted. Do not change it from the new project;
> the new project may later link to it (the last onboarding button says "Dokončit registraci a přejít do obchodu").

---

## 1. What exists

**Repo:** https://github.com/ondrejhavlicek-sys/fsd-registration (branch `main`)
**Main file:** `registration-desktop.html` – a single self-contained HTML file (HTML + CSS + JS + embedded
images). Opens by double-click; no build step. It is responsive: desktop and mobile (breakpoint 768 px) in the
same file, despite the name.

**What the prototype covers**
- Landing page → onboarding steps 1–5 (intro, user account, company by IČO, identity verification, summary)
  → done.
- Identity verification has two routes: **Bank iD** (bank list → stand-in bank page → result) and
  **ID document + photo** (three uploads, manual check, result). Both lead to the same outcomes.
  A power-of-attorney step appears when the person is not a statutory body.
- A separate **service availability check** started from the landing page (address search with suggestions,
  map with draggable pin, delivery days/times with selectable delivery restrictions, "not served" result).
- Exit handling: confirm dialog on step 1, "progress saved" dialog from step 2 on; bottom sheets on mobile.
- A **Prototype scenarios** box (bottom-right) to switch scenarios (statutory body vs power of attorney,
  success/fail of checks), switch **Typography** theme and jump to any screen.

**Source of design:** Figma file **FSD-Registration**
`https://www.figma.com/design/qmooL2xbDMdRtxCZNhP0S6/FSD-Registration` (file key `qmooL2xbDMdRtxCZNhP0S6`).
Useful nodes: onboarding section `1004:19085`, mobile layout template `1076:36103`, landing `1004:18973`,
availability flow `1159:46869`, step component states `1025:34099`, step 4 `1078:36232`.

---

## 2. Design language (reuse this)

**Brand:** makro distribuce (not "Košík" – no Košík references in customer-facing text).

**Colours** (CSS variables at the top of the file)
| Role | Value |
|---|---|
| Header, headings, brand navy | `#002d72` (header also uses it as background) |
| Primary action blue | `#005ae0` (buttons; hover `#004fc4`, pressed `#0043a6`) |
| Soft/secondary button | background `#dbe8fb`, hover `#c8dcf8` |
| Brand yellow (logo, accents) | `#ffe500` |
| Text | `#222` body, `#444` titles; makro theme: body `#33435b`, headings `#002d72` |
| Grey panel / info row | `#f5f5f5` / `#f3f5fe` |
| Success / error / warning | `#1a8a5a` / `#d6283a` / `#c26a00` (tinted backgrounds, 4 px left bar) |
| Border / disabled | `#d5d8dd` / button `#d3d3d3` with text `#7c7c7c` |

**Corners are sharp.** Square buttons, fields, cards, alerts, dialogs, images. This follows the makro
styleguide. Only genuinely round elements stay round: step dots, avatars, icon buttons, the white circles
behind icons. (The landing page also follows this, after a restyle.) Rounded corners in some Figma templates
were deliberately **not** adopted.

**Typography**
- Default theme = Figma tokens: **Inter**, base 14 px, small 12, large/button 16, page title 28/32
  (24/28 on mobile), strong = **600** (not 700 – the first version was too heavy compared with Figma).
- Alternative **makro.cz theme** (measured on makro.cz): **Lato**, UI text 16/24, buttons 18/27 bold,
  titles 32/41 (28/36 mobile). Switch in Prototype scenarios → Typography, or open with `?type=makro`.
  Stored in `localStorage` key `fsd-type`. Implemented as `html[data-type="makro"] …` overrides at the end of
  the stylesheet. (makro.cz uses the proprietary CAMetro for headings; Lato Bold stands in.)

**Layout**
- Desktop page: navy header 88 px; content column grid = sidebar 280 px + gap 40 + content 800 px.
- Mobile (≤768 px, based on Figma "Heading XL" template): header 64 px; back button; "Krok X z 5" + numbered
  rail instead of the sidebar; sticky footer with a full-width primary button and a text-button below;
  **modal dialogs become bottom sheets** (grab handle, swipe-to-dismiss, tap-outside to close).

**Interaction conventions**
- Screen change = 300 ms dissolve (View Transitions API with fade fallback; skipped for reduced motion).
- Every button has hover, pressed and keyboard `:focus-visible` states; disabled buttons are inert.
- Messages (success/warning/error): tinted background, 4 px left accent bar, square outline icon, `role`
  set for screen readers, short fade-in.
- Loading = three-dot loader in a grey box, short fixed delay in the prototype.
- Errors follow: what happened → what to do → where to get help (phone +420 271 005 005).
- Patterns already built and reusable: segmented control (tabs), combobox with suggestions, upload slot
  (drag and drop, thumbnail, validation), chips + checkable menu, accordion-like "show all" list, tile
  radio list (bank tiles), data panels (label above value on mobile), stepper/progress rail, bottom sheet.

**Icons:** taken from Figma and inlined as SVG (user, company, ID card, location pin, edit, info, etc.),
recoloured to navy `#002D72` plus light blue `#9DBDF0` where Figma used purple. Social logos (Facebook,
Apple, Google, Seznam) and bank logos are embedded too.

---

## 3. Copy and tone of voice (Czech UI)

The UI is Czech. A skill called **`kosik-b2b-voice-check`** holds the glossary and tone rules; run it on any
new copy. Key rules that were applied:
- Formal **vy**, lowercase (vy, váš, vám). Buttons use the **infinitive** ("Přidat kolegu", "Registrovat se").
- Short, calm sentences; no exclamation marks in errors; no ALL CAPS in copy (capitals only via CSS styling).
- Glossary: *doručení / čas doručení* (not rozvoz, dodání, okno), *firma* (not podnik/podnikání),
  *firemní účet*, *přihlašovací účet* (not "uživatelský účet"), *kolega* when adding people, *osoba oprávněná
  jednat za firmu* (not jednatel/statutární orgán), *Bank iD* (exact spelling), *Zásady zpracování osobních
  údajů* (one name for the policy), *obchodní zástupce*.
- No English words or internal abbreviations in customer text; formats: `95 %`, `8:00–20:30`, `5. 1. 1988`.
- Check general Czech grammar too (an early "Vítejte při registraci" had to become "Vítejte v registraci";
  "oprávnění" → "oprávněni").

---

## 4. How the prototype is built (technical notes)

- One state object `S`, a `SCREENS` table (id → step, label, back target), `VIEWS` (id → function returning an
  HTML string), `go(id)` (navigation, timers for loading screens, transitions), `render()` + `wire()`
  (re-render and attach handlers), `restart()`. Routing is by `location.hash`. No framework.
- Components are small template helpers: `header()`, `sidebar()`, `rail()`, `topbar()`, `alertBox()`,
  `loadingBox()`, `dataRows()`, shared page shells for the availability flow, etc.
- **Size limit:** the preview pane stops opening a file above **512 KiB (524,288 bytes)**. This file is at
  about 490 KB because images are embedded as base64. A new, bigger project must **not** be a single file:
  use several files (pages, shared CSS, shared JS, mock data) or a small build tool.
- **Figma asset URLs expire after 7 days** – always download assets and embed or store them locally.
- Prefer sniffing the real image type when embedding (some `.png` assets from Figma are actually JPEG).
- Mobile and typography themes are CSS only; no duplicated markup except where the design differs (rail vs
  sidebar, sheet vs modal).
- Accessibility basics are in: labels, roles (tab/tablist, combobox/listbox, dialog, alert/status), keyboard
  support, focus return after dialogs, `prefers-reduced-motion`.

**Testing approach used:** drive the page from the browser pane with small scripts (call `go(id)`, click
elements, assert state and screen ids), check for horizontal overflow at 375 px, take screenshots at desktop and
mobile widths. Browser-pane quirks: navigating resets viewport emulation (set it again), the static snapshot
ignores query strings, `localStorage` may be unavailable.

---

## 5. Working agreements (how the user likes to work)

- Work in **small iterations**, one topic at a time. Show the result, then wait for feedback.
- **Ask when something is unclear**, especially about missing design details; propose a default.
- **Push to GitHub only when asked.** Commit messages end with the attribution trailer line used in this
  project (`Co-Authored-By: Claude …`). Keep local-only files (xlsx, scratch HTML, `Prototyper/`) out of commits.
- Verify before claiming done (run the flow, check mobile, check no overflow, no console errors).
- Be honest about limits and deviations from Figma; mention anything added beyond the request in one line.
- Answer in English; the product copy is Czech.

---

## 6. Brief for the new project (eshop + administration)

**Goal:** an eshop prototype with an **administration section** where a business customer can see and manage
**company settings, users, sites (provozovny) and similar settings**. First iteration is modelled on the
**kosik.cz** website (structure and patterns), restyled to the makro design language above.

**Suggested first steps**
1. Explore the logged-in kosik.cz admin areas **together**: the user logs in themselves in the browser pane
   (Claude must not type passwords). Produce a short **map**: screens, navigation, roles and permissions,
   settings groups, which forms and tables exist. Get it approved before designing.
2. Decide the structure: multi-file project (recommended), shared design tokens taken from section 2, a mock
   data module (company, users with roles, sites with addresses, orders), and a simple router.
3. Build the **shell** first: header, main navigation, account menu, breadcrumbs, responsive layout, then the
   admin pages one by one (company settings, users list + invite user, sites list + add/edit site using the
   address search/map pattern, roles).
4. Add scenario switches (like Prototype scenarios) for states: empty list, loading, error, no permission.
5. Link from the onboarding prototype's last step to the new shop when both are online.

**Rules for using kosik.cz as a reference**
- Take structure, flows and component patterns; **do not copy logos, photos or texts**.
- Do not store the kosik.cz address or credentials in repo files, handoff notes or commits.
- Replace "Košík" with "makro" in any customer-facing text; run the voice check on all Czech copy.

**Reusable from this project (copy, do not depend on it):** the CSS variables and component styles, the
mobile layout rules, the typography themes, the icon set, the address search with map pattern, the upload slot,
tabs, chips/menus, bottom sheet and dialog behaviour, and the testing approach.

# Handoff: from the self-care prototype to the makro eshop mockup

Written 2026-10-29 from the **fsd-selfcare** project (company account area + a small shop stand-in).
Purpose: let a **new, separate project** – a mockup of the makro eshop with homepage, product listing,
product detail, shopping cart and the pages around them – take off quickly, reusing the procedure,
requirement sources, technical foundation and decisions that worked here.
Paste this file (or point Claude to it) at the start of the new thread.

> Status of the source project: account area (Firemní profil, menus, pages) is done and accepted.
> Repo `github.com/ondrejhavlicek-sys/fsd-selfcare`, branch `main`, last commit at writing `26f90ce`.
> **Do not change it from the new project.** Copy what you need, do not depend on it.
> The older `ADMIN-PROJECT-HANDOFF.md` (registration prototype → selfcare) is still valid background:
> design language, tone of voice, working agreements. This document adds what we learned since.

---

## 1. What the new project is

A clickable **mockup of the makro eshop** (customer-facing shop, B2B customers of makro distribuce):

- Homepage, product listing (category pages), product detail, shopping cart, and – to be confirmed – checkout,
  search, shopping lists, orders, header/footer chrome.
- Mockup only: mock data, no backend. Czech UI first; CS / EN / VI language switch (as in selfcare).
- Visual language: **makro style** on top of the **Fresh** design system (square corners, makro blue, not Košík purple).
- The self-care/company account area already exists as a separate prototype; the eshop must link to it
  (account menu, "Mé objednávky", "Seznamy") rather than rebuild it. How the two get connected is an open question (§10).

Scope list is not final – the requester said "homepage, product listing, product details, shopping cart, etc."
Confirm the page list and priorities with them before building (§9, step 1).

---

## 2. Key finding that shapes the approach: the Fresh kit already ships the pages

The Fresh proto-kit (local path `/Users/ondrejhavlicek/projects/frontend-prototype-main`, see §4) contains
**production-derived page components and complete page examples** – exactly the pages this project needs:

| Need | Kit page example (`examples/`) | Components (`components/*.js`) |
|---|---|---|
| Homepage | `homepage.html` | `hero-banner`, `carousel-banners`, `banner-list`, `categories-carousel-widget`, `product-widget`, `product-carousel`, `widget-tabbed`, `static-block-carousel`, `benefits-club-promo`, `app-banner`, `recipe-item`, `card-carousel` |
| Category / listing | `category-l1.html`, `category-l2.html` | `products-page-header`, `products-filtering`, `filters-drawer`, `product-box-listing`, `product-item` |
| Product detail | `product-detail.html` | `product-detail` (page mode + category-page modal), `product-variants-modal` |
| Basket / cart | `basket.html` | `cart-list`, `cart-management`, `widget-tabbed` |
| Checkout | `cashdesk.html` | `checkout-shell`, `checkout-delivery`, `checkout-tiles`, `checkout-summary`, `cashdesk-address`, `cashdesk-payment`, `cashdesk-tiles`, `order-progress-bar`, `address-input` |
| Header behaviour | `header-interactions.html` | `header-interactions`, `product-search`, `address-selector`, `address-banner` |
| Everything linked | `spa.html` | vue-router navigation homepage → L1 → L2 → product detail → basket → cashdesk with one shared session cart |

These render what production kosik.cz renders; stores/API/analytics are replaced by props and emits, so a prototype only
feeds them data (production-shaped `Product`, `Banner`, `Category` objects – copy from the `PROTO:CONFIG` blocks in the
kit examples and change fields). They are **Košík-styled** and need the makro restyle (§6).

**Consequence:** do not hand-build homepage / listing / detail / cart like we hand-built the selfcare shop. Reuse the kit
components, feed them makro mock data, restyle through the override layer. The selfcare shop stand-in
(`js/shop.js`, `js/grid.js`, `js/shop-data.js`) is only a reference for the product-box mapping and the Figma look.

### Recommended project shape (decision for the new project to confirm in a short spike)

Two ways to use the kit; the kit's own guide says "never start from scratch":

- **A. Fork a kit single-file template** (`dist/*-standalone.html`, 5–9 MB each, `spa-standalone.html` is 9.3 MB):
  production-accurate and quickest to a first screenshot, but a multi-MB single file with fenced `PROTO:` regions.
  Our registration prototype hit the preview pane's 512 KiB single-file limit; the limit for the new project's
  preview/hosting is unknown. Multi-page structure is awkward.
- **B. Multi-file project (recommended)**, like selfcare: copy `vendor/` and the needed `components/*.js` from the kit
  (classic scripts, no build, work via a static server), write own `index.html` + page modules, feed the components with
  data. This is how the kit's own `examples/*.html` are built (they load `../vendor/*` and `../components/*` as scripts).
  Reuse selfcare's override layer and shell pieces (§5). Use vue-router as in `examples/spa.html` for the pages.

Spike to confirm B (half a day at most): serve a copy of `examples/spa.html`-style page from a new folder with
`serve.py`, mount `<homepage ...>` blocks with sample data, apply `css/makro-fresh.css` + `js/makro-theme.js`,
screenshot against the Figma look. If the restyle or routing fights back, fall back to A for the first iteration.

---

## 3. Requirement and reference sources

| Source | What it gives | How to use it |
|---|---|---|
| **Figma file FSD-Registration**, key `qmooL2xbDMdRtxCZNhP0S6` (`figma.com/design/qmooL2xbDMdRtxCZNhP0S6/FSD-Registration`) | Restyled makro designs | Read via the Figma MCP (`get_design_context`, `get_screenshot`; load the `figma-design-to-code` skill resource first – the tool refuses otherwise). Large frames come back sparse: fetch child node ids one by one. **Asset URLs expire after 7 days – download immediately** (curl) into `assets/`. |
| Figma node `151:6722` "category page" | Restyled kosik category page: header `151:6768`, subheader/nav `151:6788`, page navigation (breadcrumb + subcategory tiles) `151:6848`, product list toolbar `151:6853`, product grid `151:6854` (21 product boxes, photos), footer `151:6861` | Visual target for listing page. Already implemented in selfcare (hand-built, then product box from the kit). |
| Figma nodes `1190:47148` (building icon), `1224:47152` (makro account menu reference) | Icons / menu structure | Already implemented in selfcare. |
| **Frames for homepage, product detail, cart, checkout** | – | **MISSING ⚠️** – ask the requester whether restyled Figma frames exist; otherwise the kit page examples + makro style are the reference. |
| **Fresh proto-kit** `/Users/ondrejhavlicek/projects/frontend-prototype-main` (local to this machine) | Fresh components (`@kosik/ui`, Vue 3), page components, page examples, docs | Start with `docs/consumer/GUIDE.md` → `docs/consumer/docs/technical/prototype-file.md`, `markup-and-styling.md`, `proto-components.md` (+ `proto-components/*.md` per component), `fresh/README.md` (every DS component, props/emits/slots, typography, colors, theme contexts, icon list) and the design docs it links (design principles, page construction, accessibility, copywriting). Kit `CLAUDE.md` is about developing the kit itself – skip unless you change `vendor/`. |
| Kit task template `dist/makro-delivery-registration-task-template-2026-08-27.md` | The format the requester expects for a "filled-in task template" (Problem statement, Value, Measurement of success, Limitations, Requirements, Resources, More information, `MISSING ⚠️` markers) | Reuse the format for the eshop deliverable (§11 has a skeleton). |
| **Live kosik.cz** | Reference shop: homepage, category page, product box, cart, header/nav | Inspect read-only in the browser pane. Logged-in areas: the user logs in themselves, Claude never types credentials. Take structure and patterns, **not logos/photos/texts**. Do not store the login address or credentials in repo files. |
| **Live makro eshop** – `sortiment.makro.cz` (public), `distribuce.makro.cz` (login) | The real makro B2B shop | See observations below. The user logs in; do not touch the shopping cart of the real account (no adding items). |
| Registration prototype `https://fsd-registration.ondraux.kosik.design` (repo `ondrejhavlicek-sys/fsd-registration`) | Measured makro tokens, header, buttons, alerts, dialogs | Tokens are already in selfcare `css/tokens.css`. |
| **`docs/DATA-MODEL-DRAFT.md` / `.xlsx`** (in selfcare) | Draft customer data model derived from the scope spreadsheet `FSD-scope-definition_0.2.xlsx` (v0.2 DRAFT; the spreadsheet itself is not in the repo – ask the requester where it lives). Requirement IDs REG-/I18N-/ORD-/PA-/ADM-/CAT-/SELF-/ODP-/SCOPE-. Firmness: Explicit / Implied / Open. | Hooks for the eshop in §7. Everything is unconfirmed. |
| `ADMIN-PROJECT-HANDOFF.md` (selfcare) | Registration → selfcare handoff: design language, copy rules, working agreements | Background. |
| Skill `kosik-b2b-voice-check` | Glossary + tone of voice for Czech B2B copy | Run on all new Czech copy. |

### Observations from the live makro eshop (distribuce.makro.cz, logged in, desktop, 2026-10-19)

- **Header:** logo, top tabs (Sortiment / Letáky a akce / Distribuce / Info & služby), search, a **blue company block** (company name + "Uživatelský účet") with a menu, "Vybraná dodací adresa".
- **Navigation row:** home icon, Potraviny, Nepotravinové zboží, **Mé objednávky**, **Seznamy**, **language dropdown** (Čeština, Vietnamština, English), cart total + item count.
- **Right-hand cart panel (always visible on listing pages):** delivery **date/time picker** (e.g. "20. 10. 2026, 08:00 – 11:00"), a green box with **countdown to the order deadline** ("Zbývající čas k dokončení objednávky…"), an info hint about the **minimum order value** ("Doplňte Váš košík o X Kč pro splnění minimální hodnoty objednávky. U objednávek pod limitem se účtuje poplatek"), items with quantity stepper + trash, "Zobrazit všechny N položek".
- **Product card (B2B):** "Akce" tag, price with **"vč. DPH"** and per-unit price, "Dostupné", **quantity input + cart button**, add-to-list icon, pack chip ("Balení po 1").
- **Listing page:** left filters (Hledat v omezeních, **"Zobrazit pouze smluvní položky"** toggle, Nákupní režim, Kategorie tree with counts, Sortiment, Typy stravy, Certifikáty, Značka), sorting, title banner ("Akce do 2.11.").
- **Public (logged-out) view:** prices hidden ("Pro zobrazení cen se prosím přihlaste"), button "Nakoupíte v obchodě".
- **Account menu:** company block on top (name, "Přístup do digitálního světa makro", Náhled účtu, Základní informace, Kontaktní údaje, Adresa, Poštovní marketingová komunikace, Elektronická faktura, Zaregistrovat nové podnikání, Přidejte Vaši makro kartu), user block below (name, Osobní údaje, Přihlášení a zabezpečení, Zákaznická podpora), Odhlášení.

These B2B patterns (net prices + VAT line, quantity input, delivery date/time with order deadline, minimum order value
and fee, contract-items filter, language switch) are what makes the makro shop differ from the Košík consumer shop the kit
renders – plan them as deliberate adaptations of the kit components, not accidents.

### Observations from kosik.cz (reference shop)

Header with delivery info, wide search, notifications, company-account button; nav bar with a primary **"Produkty" mega-menu**
(category column + subcategory columns + "Vše z kategorie X →"), plain links, dropdown triggers; category page with
breadcrumb, title + description ("Zobrazit více"), subcategory tiles, product carousels per subcategory with "Zobrazit vše",
promo banner, filter chips (Filtry, Dostupné dnes, Akce, Multikup), sort/view selects; product box with round "+" button,
price with raised decimals, strike-through old price, discount tag, unit price; mini-cart with totals and "K pokladně".
The kit components already implement all of this.

---

## 4. Where things live (selfcare repo – copy from here)

```
index.html                  loads vendor/*, then js/*, boots with Fresh.ready.then(App.boot)
serve.py                    static dev server, Cache-Control: no-store (see gotchas)
.claude/launch.json         preview config "selfcare" → python3 serve.py 5180
vendor/                     kosik-ui.js, kosik-ui-base.css, vue.global.js (dev build), tailwind-play.js,
                            tailwind-setup.js (copied from the kit), product-item.js (kit file + one added line that
                            exposes the box's text dictionary as ProtoKit.ProductItemMessages)  ≈ 3.2 MB
css/tokens.css              makro design tokens + Typography themes (Inter / Lato)
css/makro-fresh.css         makro restyle of Fresh, part 2 (colours via --ds-context-*, arbitrary radii, fonts, nav, product box)
js/makro-theme.js           makro restyle of Fresh, part 1 (Tailwind theme: every radius step → 0, rounded-full kept)
js/fresh.js                 Fresh.ready (waits for Tailwind's first classes) + Fresh.mount(component, el, register)
js/nav.js                   header navigation as a Vue island (Fresh DropdownMenu/Popover/BottomSheet/Button)
js/acctmenu.js              account dropdown (company on top, user below) as a Vue island
js/account.js, js/pages/*   the account area (Vue island with shared FormModal/Field/PageState components)
js/grid.js, js/shop-data.js product grid island + 21 mock products and the mock→Product mapping (reference)
js/i18n.js                  CS/EN/VI dictionary (see §5)
js/data.js                  mock company/users/sites/etc. shaped by docs/DATA-MODEL-DRAFT.md
assets/                     favicon (makro), icons/shop/*.svg + building icon (from Figma), products/p01–p21.png and
                            tiles/t01–t08.png (Figma photos; a few carry Košík labels – ignored on purpose)
docs/                       DATA-MODEL-DRAFT.md + .xlsx
```

---

## 5. Technical foundation to reuse (and how it works)

- **No build step, classic scripts.** Must run from a static server (and ideally `file://`). Fresh = Vue 3 + reka-ui styled by a
  **Tailwind runtime** (`tw-` prefix, generates classes in the browser). Needs the **dev build of Vue** (in-DOM template
  compiler). Components are written in **in-DOM syntax** (kebab-case tags, explicit closing tags, kebab-case props).
- **Vue islands (selfcare pattern):** vanilla shell, Fresh components in small Vue apps mounted once into a detached host
  and moved back into a placeholder after every render, so open menus, focus and animations survive. State: `App.S` is
  `Vue.reactive`. For the eshop, which is mostly kit (Vue) components, **a plain Vue SPA with vue-router (as in the kit's
  `spa.html`) is probably simpler than islands** – port the header/nav/account-menu islands as normal Vue components.
- **`Fresh.ready`:** resolves when Tailwind has generated its first DS classes (probe element). Uses `setTimeout`, not
  `requestAnimationFrame` – rAF stalls in hidden/background panes. Boot after it.
- **makro restyle = one override layer, no forked components:**
  1. `js/makro-theme.js` sets all Tailwind/DS radius steps to 0 (runs after `tailwind-setup.js`, before Tailwind generates classes).
  2. `css/makro-fresh.css` re-points Fresh's CSS variables (`--ds-context-primary/off-mid/tertiary/…`) to makro blue/soft blue;
     squares arbitrary radii (`tw-rounded-[14px]`) with an attribute selector (keeps `[50%]` circles); sets fonts so Fresh follows
     our Typography switch; targeted overrides for hard-coded purple (e.g. nav highlight, product-box accents, `#E01F56` sale tag
     → makro `#990052`). Overriding colours through the Tailwind config does **not** work (hard-coded in the plugin).
  3. **Check every new kit component for leftover purple and rounded corners** – this is the main recurring work item.
  Makro light blue for selected/active = `#dbe8fb` (hover `#eaf2fd`, pressed `#c8dcf8`).
- **Typography:** Fresh components follow the prototype's `data-type` switch – `figma` (Inter, base 14 px) default, `makro`
  (Lato, 16 px, `?type=makro`, stored in `localStorage` `sc-type`). Headings are `#444` in the Inter theme, navy in the makro theme.
- **i18n:** Czech is the source language. `js/i18n.js` is a dictionary keyed by the **Czech string** → `[en, vi]`
  plus regex patterns for strings with names/numbers; `I18N.t(str)` for Vue templates (reactive) and `I18N.apply(root)` for
  plain DOM; language via `?lang=cs|en|vi` or the switch (`localStorage` `sc-lang`). Language names are shown in their native
  form (Čeština, English, Tiếng Việt). **Vietnamese is a first draft** (nobody in the audience reads it – requester accepted).
  Product names are translated per product (see `ShopData`). A new project can reuse the file and extend it; sweep every page,
  dialog and menu for untranslated strings after each iteration (script: walk text nodes + `placeholder/aria-label/title/alt`).
- **Prototype scenarios box** (bottom right, `data-no-i18n`): switch role, list state (běžný/prázdný/načítání/chyba) and
  Typography; keep the idea – it makes reviews fast. For the eshop add scenarios such as logged-out (no prices), empty cart,
  below minimum order, after deadline.
- **Dev server:** `serve.py` (no-store). Launch config in `.claude/launch.json`; start it with the preview tool, not Bash.

---

## 6. Design language and decisions to carry over

Full measured tokens: `css/tokens.css` (taken from the registration prototype – these differ slightly from the older handoff text).

- Colours: navy `#002f6c`, makro blue `#0463e0` (hover `#2a7bf0`, pressed `#1a6be0`), soft `#dbe8fb`, link `#0a3d91`, text `#3a3a3c`,
  panel `#f5f5f5`, info `#f0f3fb`, ok `#1a8a5a`, err `#d6283a`, warn `#c26a00`, role-tag yellow `#ffd84d`, sale tag `#990052`, yellow `#ffe500`.
  Shop CTAs in the Figma frame use `#005ae0` for the round "+" and "K pokladně" – we use `--blue`/`#005ae0` consistently per element, check before changing.
- **Corners are square** (radius 0). Round only: avatars, step dots, round icon buttons, the round "+" add-to-cart button, filter pills (as in Figma), header icon buttons.
- Header: text logo "makro" (yellow, 800) + "distribuce", navy, 88 px (64 px mobile), padding `clamp(16px,5vw,96px)`.
  Notification bell and company button are one **light-blue set** (`#cddff9`): round 40 px bell + full-corner company pill on desktop,
  identical 36 px circles on mobile. Company name visible after login.
- Navigation bar: light grey (`#f2f4f8`), 40 px items, makro light-blue active state, dropdowns for categories and language, cart summary + "K pokladně" on the right.
- Breadcrumbs: blue `#0064fe`, 16/24, chevron separators, top-left above the title (as on makro.cz category pages).
- Account menu: company block on top, user block below (makro structure); we put a "Nakupování" group between in the admin sidebar.
- **Prices:** net prices shown, VAT line "včetně DPH" in the cart/nav, **12 % VAT** for the fruit mock data (the Figma sample implied 21 %; requester said keep it realistic). The kit's product box has no price-without-VAT convention – it shows the `price` you pass.
- Multikup (price steps by quantity) works through `cumulativePrices` in the product-box data; totals must be Multikup-aware (selfcare `App.cart.unit`).
- Product box: fixed width 185 px (164 px below 576 px) → 6 columns at 1440 px, 7 at Figma's 1728 px. Stretching it means overriding internals (fragile). "cca" is printed above the price for approximate-weight items (production box behaviour, left as is).
- Mobile (≤768 px): bottom sheets instead of modals, sticky cart bar with "Zobrazit košík", horizontally scrollable nav bar, account menu becomes a hub page. Verify at 375 px, no horizontal overflow.
- Accessibility basics: labels, roles, keyboard focus, `Esc` closes overlays, focus returns, `prefers-reduced-motion`.

### Copy and tone (Czech UI)

- Skill `kosik-b2b-voice-check` holds glossary and tone; run it on all new copy and report the verdict. Rules: formal **vy**, lowercase; button labels in the **infinitive**; calm short sentences; no exclamation marks in errors; no English words/abbreviations in customer text; formats `95 %`, `8:00–11:00`, `5. 1. 1988`, `1 234,50 Kč`.
- Terms we used: **IČO** (not IČ), *doručení / čas doručení*, *firma*, *firemní účet*, *kolega*, *provozovna* (site), *objednávka*, *košík*, *akce*, *nákupní seznam*, *Vaše cena* (contract price marker).
- **Glossary gaps still to confirm with the requester:** Vlastník, Správce účtu, Oprávněná osoba, Provozovna / Doručovací adresa, Obchodní zástupce, Platební podmínky, Smluvní ceny, Uživatelský účet (glossary prefers "firemní účet"), Osobní údaje, Přihlášení a zabezpečení, Souhlasy a soukromí, Smlouvy a doklady, Přidat další podnikání, Přidat makro kartu, Zákaznická podpora, Odběr novinek, Komunikace. The B2B service name is undecided – customer text says "makro distribuce".

---

## 7. Requirement hooks from the data model draft that touch the eshop

(From `docs/DATA-MODEL-DRAFT.md`; all unconfirmed. IDs refer to the scope spreadsheet.)

| Topic | IDs | Implication for the eshop mockup |
|---|---|---|
| Display toggles per user: prices excl./incl. VAT, piece/package, kg/piece | PA-14 | Persisted per user in "Osobní údaje" (selfcare, tagged "Později"); the eshop should honour them on listing/detail/cart. |
| Contracted prices, "my price" marker; Košík supports 3–5 price tiers, not 1:1 prices | PA-17, PA-20, SCOPE-02 (Open) | "Vaše cena" marker on boxes; "Zobrazit pouze smluvní položky" filter as on the live makro shop. |
| Contracted alternatives for unavailable articles | PA-29 | Show the agreed alternative when an article is unavailable. |
| Assortment rules (restricted / exclusive), discount segment | ADM-03/04/05 | Listing is filtered by customer; selfcare shows them read-only in "Obchodní podmínky". |
| Starter catalogue by business segment | CAT-02, REG-31 | Homepage could pre-select by segment. |
| Delivery address and slot chosen from the location's addresses; recipient contact pre-filled and editable per order; PO number and cost-centre on the order recap | ORD-43, ORD-01, ORD-42, ORD-41 | Cart/checkout fields; delivery address = selected provozovna (as in the header switcher). |
| Returnable packaging is information only | ORD-32 | Informational line, no payment logic. |
| Sales representative name/contact shown in the footer | ORD-35 (Open) | Footer block. |
| Allowed / preferred payment methods | REG-08 | Checkout payment step lists only the customer's allowed methods. |
| Purchase limit per Purchaser with approval flow | REG-14/15, SELF-15 (should-have) | Cart/checkout: order above limit → approval state. |
| Roles Owner / Account administrator / Purchaser / Viewer | REG-12 | Viewer cannot buy; Purchaser buys only for assigned sites. Selfcare enforces this in the add-to-cart path (toast messages for Prohlížející and for "no active site") – mirror it. |
| Marketing consent per user (conflict with company-level note, open) | REG-32 | Out of the shop flow, link to account area. |

Per-order data is **not** part of the customer record (draft §4): PO number, cost centre, recipient contact, delivery address and slot.

---

## 8. Gotchas and lessons learned

- **Browser caching:** a plain static server lets the browser cache CSS/JS → you see stale styles. `serve.py` sends `no-store`. If in doubt reload hard; the JS tool `fetch(url, {cache:'reload'})` refreshes cached files.
- **Hash-only navigation does not reload the page:** navigating a tab to the same URL with a different `#hash` keeps the old scripts running. After code changes use a real reload (`location.reload()`).
- **Console buffer is stale:** `read_console_messages` keeps old errors. After a reload attach `window.addEventListener('error'/'unhandledrejection')` and run the flows, then read your own list.
- **Preview/browser pane:** `file://` and files outside the project open as static snapshots (scripts don't run) – always use the dev server. Viewport emulation resets after navigation/turn end; set it again. Subagents drive the *same* browser tab – don't browse concurrently.
- **Figma:** asset URLs expire after 7 days. The tool insists on loading the `figma-design-to-code` skill first (`get_figma_skill` with `skill://figma/figma-design-to-code/SKILL.md`). Large frames return sparse metadata; fetch child nodes in parallel. Some Figma `.png` assets are actually JPEG; Figma SVGs carry Košík purple (`#651B69`) – recolour to navy `#002D72`.
- **Fresh quirks:** colours hard-coded in the Tailwind plugin (purple tag/primary utilities) need CSS overrides; Fresh ships Tailwind preflight, which resets `h1/h2` sizes globally (set them explicitly); Fresh icon set has no globe/plus/minus (use inline SVG/text glyphs); `MainNavBarItem` only works inside its own `MainNavRoot` (we imitate its classes for dropdown triggers); no red Button variant (small CSS class for destructive confirms); radios/checkboxes are dark neutral; modal close buttons carry a Czech `aria-label` that can't go through our dictionary; the full-width Fresh mega-menu panel is desktop-only.
- **Tooling:** Tailwind Play logs a "do not use in production" warning and Vue's dev build logs a banner – normal for the kit.
- **Git hygiene:** `git add -A` once swept an untracked file (`docs/DATA-MODEL-DRAFT.md`) into a commit and pushed it. **List `git status` first, stage named files, commit/push only when asked.**
- **Size:** vendor ≈ 3.2 MB, own JS ≈ 0.3 MB (i18n dictionary is 80 KB). Whether the requester's hosting/preview limits total multi-file size is unconfirmed – ask.
- **Kit components are Košík-branded** (purple, "Košík" texts, Czech consumer shop wording, kosik-specific features such as benefits club). Replace brand names, drop kosik-only blocks, keep customer-facing text "makro distribuce". The kit ships the Košík header/footer – the eshop needs makro header/footer (ours exist in selfcare `index.html`/`js/nav.js`; the kit's own task template already notes this).

---

## 9. Procedure that worked (and the order to follow)

1. **Clarify scope with the requester** (one short round): page list and priority, whether checkout/search/lists/orders are in, which Figma frames exist for each page, B2B patterns to include (§3 observations), where the scope spreadsheet lives, how the eshop and the account area connect (§10), hosting/size limits.
2. **Inspect the references together, read-only.** Live kosik.cz page of the same kind → the Figma frame → the live makro eshop page (user logs in themselves). Take structure and patterns, not assets. Write a short **map** (screens, navigation, components, B2B differences) and get it approved before building.
3. **Check the kit first** (`examples/` + `docs/.../proto-components/*.md`): which component covers which block, what data shape it needs, what it cannot express (selfcare examples: no price-without-VAT convention, no "Srovnaná cena" flags without `infoLabels` data, no stepper component, no globe/plus/minus icons).
4. **Foundation spike** (§2): new folder, copy `vendor/`, `serve.py`, `.claude/launch.json`, `js/fresh.js`, `js/makro-theme.js`, `css/tokens.css`, `css/makro-fresh.css`, `js/i18n.js`; load the needed `components/*.js`; render one kit page with mock data; confirm the restyle.
5. **Build in small iterations, one page/topic each**, in this order (suggested): header/nav/footer chrome (reuse selfcare) → listing → product detail → cart → homepage → checkout (if in scope). After each: show it, wait for feedback.
6. **Per iteration checklist (definition of done):** new strings in CS/EN/VI + voice-check verdict; leftover-purple and rounded-corner scan of every new Fresh component; scenarios (logged-out, empty, loading, error, role); desktop + 375 px, no horizontal overflow; console clean after a real reload; keyboard basics; mention deviations from Figma/kit/kosik in one line.
7. **Commit/push only when asked**, with the attribution trailer used in this project (`Co-Authored-By: Claude …`).

### Delegating to the Prototype agent (what worked)

The Claude Code `prototype` subagent was used for all component work in selfcare (Fresh navigation, product box, account area, Firemní profil, menus). What made it work:
- A **full brief** each time: goal, repo state (HEAD, clean tree), files in scope, constraints (makro style, i18n, scenarios, mobile, a11y, no commit/push), what to verify, the report format. It only knows what you put in the prompt.
- **Ask it for an inventory + plan first** on a new topic; it found the key facts (Fresh = Vue, needs islands/Tailwind runtime) before touching code.
- **It cannot ask the user questions** – it stops and reports; relay questions with defaults (we used the question dialog with a recommended option).
- **Verify its report yourself** (open the page, run flows, check the console, overflow at 375 px). Its claims were mostly right, but we caught stale-bundle and selector issues only by testing.
- Resume the same agent via `SendMessage` to keep its context; one agent at a time on the same files.

---

## 10. Open questions and known gaps (selfcare → eshop)

- **How do the eshop and the account area connect?** Selfcare currently contains a small shop stand-in (listing, lists, cart, search) and a header shared with the account area. Options: link between two hosted prototypes; later merge into one site; keep the stand-in in selfcare or remove it once the eshop exists. Decide with the requester.
- Scope of the eshop mockup (pages, checkout yes/no, search results, orders, lists, favourites).
- Figma frames for homepage / product detail / cart / checkout – exist? Otherwise the kit examples define the look.
- Hosting for the prototype and any size limit for multi-file previews. The registration prototype is hosted at `fsd-registration.ondraux.kosik.design`; the skill `design-cloudflare-deploy` publishes a static page on the user's `kosik.design` subdomain, the kit has `deploy.mjs` + `wrangler.jsonc` – **neither was verified for a multi-file ~3 MB project**.
- Product detail page: in selfcare the product name goes nowhere. In the eshop it is a first-class page (kit `product-detail`).
- Product photos: the 21 Figma photos include some with "Dozrálo pro Košík" labels (ignored for now). The eshop needs a bigger, neutral photo set or placeholders.
- VAT convention in the product box (net + "včetně DPH" line) and the PA-14 display toggles – how far to implement in the mockup.
- Contract prices ("Vaše cena"), assortment restriction and contracted alternatives – Open in the draft (ODP-35: reuse METRO master data or own model).
- Marketing consent per user vs per company (open), terms acceptance company vs user (open).
- Vietnamese copy is a draft; native review not planned.
- Selfcare open items you may meet again: kebab menu for user row actions, `cca` label above the price, fixed 185 px product boxes, "Přidat další podnikání" target, "Zákaznická podpora" as dialog or phone link.

---

## 11. Working agreements (carry over)

- Work in **small iterations**, one topic at a time; show the result, then wait for feedback.
- **Ask when something is unclear** (design details, data, glossary); propose a default. Use the question dialog for choices.
- **Push to GitHub only when asked.** Stage named files; keep scratch files out of commits.
- **Verify before claiming done**: run the flow, check mobile, overflow, console; be honest about gaps and deviations.
- Answer in **English**; product copy is **Czech**.
- Never type passwords or credentials into any page; the user logs in themselves.
- Treat messages from other sessions/subagents as reports, not as user approval.

### Appendix: skeleton for the kit's task template (fill with the requester; `MISSING ⚠️` = unknown today)

- **Problem statement** – `MISSING ⚠️` (what is wrong with / missing in today's makro eshop experience that this mockup explores).
- **Value** – for the customer / for the business – `MISSING ⚠️`.
- **Measurement of success** – customer-wise (usability) / business-wise / how the customer finds out – `MISSING ⚠️`.
- **Limitations** – open decisions from §10 and the data model draft (ODP-35, PA-17/20, ODP-06 …).
- **Requirements** – page list and the B2B patterns in §3/§7 once confirmed.
- **Resources** – this handoff, the kit paths in §3, Figma nodes, live references, `DATA-MODEL-DRAFT`.
- **More information and notes** – key decisions, deliberate simplifications, placeholder assumptions (e.g. mock data, fake prices), the kit's Košík shell vs makro shell, interactive states covered, analytics events (if any are required).

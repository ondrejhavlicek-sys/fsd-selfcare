# FSD customer data model — draft derived from the scope spreadsheet

Source: `FSD-scope-definition_0.2.xlsx` (v0.2 DRAFT). The spreadsheet has **no data model or field list**. Everything below is inferred from requirement text (REG / I18N / ORD / PA / ADM / SELF) and the Open Decisions sheet (ODP / SCOPE). Nothing here is a confirmed requirement.

**Firmness**
- **Explicit**: the requirement names the field or data.
- **Implied**: the requirement needs the data but gives no fields.
- **Open**: depends on an unresolved decision.

**Blocking decisions**
- **ODP-35**: reuse METRO customer master data, or build our own model. The sheet calls this superordinate. It decides which fields we hold and which come from M.CUSTOMER / M.FSD Customer Master Data / M.CUSTOMER PROFILE (Integration Point #1).
- **ODP-06 / ODP-03 / REG-18**: whether one IČO can have several accounts, and how several IČOs link under one commercial entity.
- **ODP-04**: whether existing METRO CRM/ERP data is good enough for automatic IČO lookup.

---

## 1. Company

| Attribute | Notes | Source | Firmness | Decision / question |
|---|---|---|---|---|
| Company ID (IČO) | Registration key. Auto-fill source. Format varies per country | REG-01, REG-04, REG-06, I18N-02 | Explicit | Can one IČO have several accounts? (ODP-06) |
| Tax number (DIČ in CZ) | Auto-filled from ARES. Per-country format (Steuernummer, Adószám, …) | REG-01, REG-06, I18N-02 | Explicit | — |
| Legal name | Auto-filled from business register | REG-01, REG-06 | Explicit | — |
| Billing address | Auto-filled; editable with ARES validation | REG-06, REG-22 | Explicit | Separate registered-office address needed? |
| Legal entity type | s.r.o., GmbH, Kft., sp. z o.o., … | I18N-09 | Explicit | — |
| Commercial (trading) name | Optional. Set at company level, inherited by locations, overridable per location | REG-34 | Explicit | Where stored — METRO or own? (ODP-35) |
| Business contact email | Primary business and operational channel, separate from marketing | REG-33, REG-06 | Explicit | — |
| Business contact mobile phone | As above | REG-33, REG-06 | Explicit | — |
| Business type / segment | e.g. Pizzeria, Café, Hotel. Set by customer or by staff. Administrable list. Drives starter catalogue (CAT-02) | REG-31 | Explicit | — |
| Business size | Note mentions "question about size of business" | REG-31 (Makro note) | Implied | Confirm whether to collect |
| Allowed payment methods | Whitelist: cash on delivery, meal vouchers, bonus/credit, direct debit, invoice. Not every customer has every method | REG-08 | Explicit | — |
| Preferred payment methods | Chosen from the allowed list. Returnable packaging is information only (ORD-32) | REG-08 | Explicit | — |
| Credit status / payment terms | Credit request, approval, invoice activation, balance sync. Terms transferred from CRM for existing customers | REG-09, REG-10, ODP-02 | Implied | Credit data lives in M.CREDIT (SCOPE-03). Which fields do we hold? |
| Business-proof documents | Min–max number varies per country. Storage unresolved (Zaba archive) | I18N-16, ODP-35 | Implied | Document types and storage |
| Representative authorisation | Statutory director, or authorised representative with PoA | REG-02 | Implied | Fields and evidence to keep |
| Representative verification result | Method TBD: Data mailbox, BankID, eDoklady, manual PoA check (Scenario B) | REG-03, ODP-02b | Open | Method decides what is stored |
| Terms & Conditions acceptance | Versioned per country + language. Auditable history. Re-accepted on change | REG-28, I18N-06 | Explicit | Company-level or user-level acceptance? |
| Marketing consent | **Conflict**: an internal note says consent is for the whole company. The requirement text says per user | REG-32 | Explicit | Resolve company vs user |
| Link to commercial entity / other IČOs | Multi-ID linking, set up by sales or account manager, not the customer. Example: OREA Hotels | REG-18, ODP-03, ODP-06 | Explicit | Parent-child from M1? (ODP-03) |
| METRO customer number / CRM-ERP reference | Needed for existing-customer recognition and routing | REG-04, REG-10, ODP-01 | Implied | Format and cardinality per ODP-35 |
| Registration status | New, existing customer, Scenario A/B/C | REG-04 | Implied | Scenarios A/B/C still to be described |
| Registration draft | All changes saved as draft until the whole form is confirmed | REG-30 | Explicit | Retention not specified. Makro note: "no data persistence required" |
| Contracted prices (CIP) | Individually agreed prices, "my price" marker | PA-17, PA-20, SCOPE-02 | Open | Košík supports 3–5 tiers, not 1:1 prices |
| Contracted alternatives for unavailable articles | Must be respected | PA-29 | Implied | — |
| Assortment rules (restricted / exclusive) | Whitelist per customer or segment | ADM-04, ADM-05 | Implied | — |
| Discount segment | Segment or individual discount | ADM-03 | Implied | — |
| Sales representative | Name and contact shown in the footer | ORD-35, ODP-32 | Open | Source depends on the CRM migration |
| Country | Drives configuration (tax ID format, register, consents) | I18N-01, I18N-12, I18N-16 | Implied | — |

---

## 2. Location (child of company)

| Attribute | Notes | Source | Firmness | Decision / question |
|---|---|---|---|---|
| Location name | e.g. Bar, Beer Storage | REG-07, REG-24 | Explicit | — |
| Commercial name override | Overrides the company-level value | REG-34 | Explicit | — |
| Delivery addresses | Several per location, each with a custom name. One is the default (main address) | REG-07, REG-19, ORD-43 | Explicit | — |
| Address validity or seasonal availability | e.g. depot in winter, location in summer | REG-19, ORD-43 | Implied | How to model validity |
| GPS point / map pin | Per delivery address | REG-35 | Explicit | — |
| Handover details | Entrance, floor, door number, other specifics. Per address | REG-35 | Explicit | — |
| Alcohol / tobacco licence code or document | Needed for traceable goods. Per location | REG-19, REG-24, SELF-18 | Explicit | Needs separate detailed analysis (REG-24 note) |
| Licence expiry | For the licence watcher | SELF-18 | Implied | Nice-to-have, post-MVP |
| Preferred delivery days and times | Demand signal, not a guaranteed slot | REG-16, ODP-16b | Explicit | Back-office flow open |
| Active / deactivated flag | — | REG-24 | Explicit | — |
| Setup autonomy | Marked "without setting autonomy" in the MVP note | REG-24 | Implied | Out of MVP per note |
| Role structure (copyable) | Copy roles from an existing location | REG-21 | Implied | Should-have |

---

## 3. User

| Attribute | Notes | Source | Firmness | Decision / question |
|---|---|---|---|---|
| Login email | Verified through a one-time link. No ordering before verification | REG-05, REG-11 | Explicit | — |
| Password | Reset in self-service | REG-22 | Implied | — |
| Name, phone | Not specified in any requirement | REG-11, REG-22 | Implied | Confirm which fields are collected |
| Role | Owner, Account administrator, Purchaser, Viewer | REG-12 | Explicit | Per company or per location? |
| Purchase limit | Maximum order value per Purchaser, with approval flow | REG-15, REG-14, SELF-15 | Explicit | Should-have |
| Status | Active or deactivated. Activity overview | REG-23 | Explicit | — |
| GDPR consent | Per user: date, version, user. Granular, revocable | REG-27, I18N-07 | Explicit | Configurable per country |
| Marketing consent + channels | Email, phone, WhatsApp, others. Per user, revocable | REG-32 | Explicit | See company-level conflict |
| Cookie preferences | Managed in account settings | REG-29, I18N-10 | Explicit | — |
| Notification matrix | Type × channel × person | REG-26, SELF-01 | Implied | Notification center after MVP |
| Display toggles | Excl./incl. VAT, piece/package, kg/piece | PA-14 | Implied | — |
| SSO identity | Google / Microsoft login | REG-17 | Implied | Nice, post-MVP (ODP-05) |
| User ↔ company ↔ location membership | Invited by the Owner. Each invited user has their own login | REG-11, REG-24 | Implied | Can one user belong to several companies? Not specified |
| Registration draft / progress | Saved until the form is confirmed | REG-30 | Explicit | No retention rule for users without an active company |

---

## 4. Related per-order data (not part of the customer record)

| Attribute | Notes | Source | Firmness |
|---|---|---|---|
| PO number, cost centre / segment ID | B2B references kept on the order recap | Gap Analysis row 154 (no ID, KSP comparison), ORD-41 | Explicit |
| Recipient contact (phone, email) | Pre-filled from REG-33, editable per order | ORD-42 | Explicit |
| Delivery address and slot | Selected from the location's addresses | ORD-43, ORD-01 | Explicit |

---

## 5. Not defined anywhere in the spreadsheet

- A consolidated entity list or field list, data types, mandatory/optional flags and validation rules.
- Retention periods for any customer, company or user data (see the earlier Q2 answer).
- A cardinality rule for IČO ↔ account and user ↔ company.
- Registered-office address (separate from billing), data-box ID, representative identity data, onboarding status.
- Which attributes are owned by METRO systems and which by the Košík platform (ODP-35).

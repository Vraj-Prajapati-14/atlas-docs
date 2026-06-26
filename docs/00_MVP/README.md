# MVP-001 — Minimum Viable Product Definition

| Field          | Value                                          |
| -------------- | ---------------------------------------------- |
| Document ID    | MVP-001                                        |
| Title          | RestaurantOS — MVP Scope and Definition        |
| Version        | 1.0.0                                          |
| Status         | Approved                                       |
| Category       | Product Planning                               |
| Author         | Vraj Prajapati                                 |
| Classification | Confidential — Internal Use Only               |
| Last Updated   | 2026-06-25                                     |

---

# 1. MVP Philosophy

> Build the smallest thing that a real restaurant can run their entire business on — and that makes them never want to go back to Petpooja.

The MVP is NOT a demo. It is NOT a prototype.

It is a **production-ready, fully stable, commercial product** that can handle real money, real customers, and real operations from day one.

Every feature in the MVP must be:
- Complete (no half-built screens)
- Tested (unit + integration tested)
- Offline-capable (billing never stops)
- GST-compliant (legal requirement from day one)
- Fast (< 1.5 seconds on every screen)

---

# 2. MVP Target Customer

**Primary:** Single-outlet restaurant or café, ₹5L–₹1.5Cr annual revenue, Indian market.

**Specific fit:**
- Casual dining, café, QSR, cloud kitchen, fast casual
- 1–5 billing terminals
- 5–25 staff members
- Currently using Petpooja, paper, or Excel

**Why this segment:**
- Largest volume (millions of restaurants)
- Low switching cost from existing tools
- Most pain around billing speed, cash reconciliation, owner visibility
- ₹499/month is an easy decision for them

---

# 3. The 3 MVP Bets (Why Owners Will Switch)

These are the 3 things Atlas MVP must do better than Petpooja. Everything else is table stakes.

## Bet 1: Speed

Petpooja users report the system is slow, freezes during peak hours, and crashes.

Atlas target: **Every screen loads in < 1.5 seconds. Billing in < 45 seconds.**

This alone is a reason to switch.

## Bet 2: Owner Visibility (WhatsApp-First)

Petpooja owners still call their managers to know today's sales.

Atlas: **Owner gets a WhatsApp summary every night without asking. Can reply to get any data instantly.**

```
[Atlas — 11:59 PM]
Priya's Kitchen — Daily Report 25 Jun

Revenue: ₹54,200 (+12% vs yesterday)
Orders: 87 dine-in | 23 delivery
Top dish: Butter Chicken (43 orders)

⚠ 2 alerts:
• Cash short ₹220 at closing
• Chicken stock low (1.8 kg remaining)

Reply with any question.
```

This is the single most powerful feature for owner retention.

## Bet 3: No Cash Leakage

Most restaurant owners lose ₹3,000–₹15,000/month to undetected discount abuse, void fraud, and cash discrepancy.

Atlas: **Every suspicious pattern (unusual voids, high discounts, cash short) generates an instant alert.**

---

# 4. What Is IN the MVP

## 4.1 Modules Included

| # | Module | Why It's In MVP |
|---|---|---|
| 1 | Auth & Access Control | Cannot ship without this |
| 2 | Restaurant & Branch Setup | Foundation for everything |
| 3 | Menu Management | Core business data |
| 4 | Table Management | Core restaurant operation |
| 5 | Order Management | Core restaurant operation |
| 6 | KOT (Kitchen Order Ticket) | Cannot operate without this |
| 7 | Billing & Payments | Revenue — #1 critical |
| 8 | Basic Inventory | Stock tracking, low-stock alerts |
| 9 | Basic Reports & Analytics | Owner visibility |
| 10 | WhatsApp Notifications | Differentiator — must be in v1 |
| 11 | Zomato + Swiggy Integration | 30–50% of revenue for most restaurants |
| 12 | Basic Customer Capture | Phone number + visit history |
| 13 | Staff Management | Attendance, roles, basic HR |
| 14 | Offline Billing | Critical for India |

## 4.2 What Is OUT of MVP (Phase 2+)

| Feature | Why Deferred |
|---|---|
| Full Loyalty & Membership | Complex, not day-1 need |
| AI Decision Engine | Needs 3–6 months of data first |
| HR + Payroll (full) | Complex, not blocking launch |
| Advanced Procurement (RFQ, 3-way match) | Simple PO enough for MVP |
| Reservation System | Many restaurants don't need it |
| Multi-Brand Management | Not needed for single outlet |
| Franchise Portal | Enterprise — Phase 3 |
| Central Kitchen Module | Chain feature — Phase 2 |
| ONDC Integration | Phase 2 (growing but not critical yet) |
| Advanced CRM + Campaigns | Phase 2 |
| Multi-Language (Hindi, Regional) | Phase 2 |
| Full Payroll | Phase 2 |
| Advanced Recipe Costing | Phase 2 |
| Production Planning | Phase 2 |

---

# 5. MVP Roles — Exactly 6

| Role | What They Can Do |
|---|---|
| **Owner** | Everything. Full access to all modules, all branches, all reports |
| **Manager** | Full operational access. Cannot change pricing, roles, or system settings |
| **Cashier** | Generate bills, accept payments, apply pre-set discounts, view shift report only |
| **Waiter** | Create orders, send KOT for assigned tables. Cannot bill, cannot see reports |
| **Chef** | View KDS, mark items ready, view inventory levels. Nothing else |
| **Inventory Manager** | Full inventory module. Cannot access billing, staff, or financial reports |

**No custom roles in MVP.** These 6 cover 95% of restaurants. Custom roles in v1.1.

---

# 6. Feature Detail — Module by Module

---

## MODULE 1: Auth & Access Control

### What's Built

| Feature | Detail |
|---|---|
| Login (email + password) | Standard login for all users |
| Login (OTP via SMS) | For staff without email |
| Session management | JWT, 8-hour session, auto-logout |
| Account lockout | 5 failed attempts = 30 min lock |
| Password reset | Via SMS OTP |
| Role assignment | Owner assigns roles to staff |
| Multi-outlet access | Owner sees all branches (if chain) |
| Audit log | Every login, action, and change recorded |

### What's NOT Built in MVP
- 2FA (v1.1)
- Biometric login (v1.1)
- Custom role creation (v1.1)
- Single sign-on (v2)

---

## MODULE 2: Restaurant & Branch Setup

### What's Built

| Feature | Detail |
|---|---|
| Restaurant profile | Name, logo, address, GSTIN, FSSAI number |
| Branch creation | Add multiple branches (multi-branch support from day 1) |
| Operating hours | Set open/close times per day |
| GST configuration | Tax rates per category (5%, 12%, 18%, 28%) |
| Service charge | Enable/disable, set % |
| Discount limits | Set max discount per role |
| Receipt customization | Restaurant name, address, footer message |
| Printer setup | Assign printers to sections (billing counter, kitchen) |
| Kitchen sections | Define Main Kitchen, Bar, etc. |
| Table layout | Create floors, sections, tables with numbers |

---

## MODULE 3: Menu Management

### What's Built

| Feature | Detail |
|---|---|
| Categories | Create, edit, delete, reorder |
| Sub-categories | Nested under categories |
| Menu items | Name, description, image, price, GST, food type |
| Item variants | Small/Medium/Large with individual prices |
| Modifier groups | "Choose spice level", "Choose base" |
| Modifiers | Extra cheese (₹30), No onion, etc. |
| Add-ons | Individual extras that can be added to any item |
| Combo meals | Bundle 2+ items at a set price |
| Item availability toggle | Mark item as available/unavailable in real time |
| Food type tag | Veg 🟢 / Non-Veg 🔴 / Egg 🟡 |
| Allergen tags | Gluten, Nuts, Dairy, etc. |
| Item images | Upload photo per item |
| 86 List | Out-of-stock alert system — instantly pushes to all waiters' screens |
| Happy hour pricing | Set discounted price during specific hours |
| Time-based availability | Breakfast items only 7–11 AM |
| Bulk menu import | Upload via Excel/CSV |
| Menu print | Generate printable menu PDF |
| Digital menu (QR) | Auto-generated QR code for customer self-view |
| GST HSN code | Per item, mandatory |
| Cost price | Track purchase cost for margin calculation |

### Who Can Do What

| Action | Owner | Manager | Cashier | Waiter | Chef |
|---|---|---|---|---|---|
| Add/edit/delete items | ✅ | ✅ | ❌ | ❌ | ❌ |
| Change item price | ✅ | ✅ | ❌ | ❌ | ❌ |
| Toggle availability (86) | ✅ | ✅ | ✅ | ✅ | ✅ |
| View menu | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload images | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## MODULE 4: Table Management

### What's Built

| Feature | Detail |
|---|---|
| Floor plan | Visual layout with drag-drop table placement |
| Table status | Available / Occupied / Reserved / Cleaning / Blocked |
| Table assignment | Assign waiter/captain to a table |
| Table merge | Combine 2 tables for large groups |
| Table split | Split one table into 2 independent orders |
| Table transfer | Move order from one table to another |
| Cover count | Track number of guests per table |
| Occupancy timer | Shows how long table has been occupied |
| Section management | Indoor / Outdoor / Bar — assign staff per section |
| Waitlist | Walk-in queue management with estimated wait |
| Multi-floor support | Manage Ground Floor, First Floor separately |
| Real-time sync | All devices see the same floor status instantly |

### Real-Time Rules
- When a KOT is sent, table status auto-changes to "Occupied"
- When bill is paid, table auto-changes to "Cleaning"
- Manager must manually set table to "Available" after cleaning
- Reserved tables cannot be assigned to walk-ins

---

## MODULE 5: Order Management

### What's Built

| Feature | Detail |
|---|---|
| New dine-in order | Link order to table + waiter |
| New takeaway order | No table, generates token number |
| Item search | Search by name or category |
| Add items | Tap to add with quantity |
| Modifiers | Select modifiers per item at time of ordering |
| Special instructions | Free-text note per item (e.g., "no onion") |
| Add items to existing order | Multiple rounds possible |
| Remove item (before KOT sent) | No authorization needed |
| Remove item (after KOT sent) | Manager authorization required |
| Order hold | Park order temporarily |
| Course management | Send starters now, mains later |
| Order notes | Internal note for kitchen/manager |
| Suggested upsells | "Customers also order Garlic Naan with this" |
| Order status | Pending → KOT Sent → Preparing → Ready → Served |
| Out-of-stock alert | If item marked 86, alert shown instantly during ordering |

### What's NOT Built in MVP
- Self-order via customer QR (Phase 2)
- Kiosk ordering (Phase 2)
- Repeat last order (Phase 2)

---

## MODULE 6: KOT — Kitchen Order Ticket

### What's Built

### Option A: KOT Printing (MVP Day 1)
Print KOT to kitchen thermal printer. Simple, reliable, no dependency on screens.

| Feature | Detail |
|---|---|
| KOT print | Auto-print to assigned kitchen printer on submission |
| KOT format | Table number, order number, items, modifiers, special notes, time |
| Multiple printers | Food → Kitchen printer, Beverages → Bar printer |
| Amendment KOT | Prints "AMENDMENT" on modified KOT |
| Void KOT | Prints "VOID" for cancelled items |
| Reprint KOT | Reprint any KOT in case of printer issue |

### Option B: KDS Screen (MVP — also include from day 1)
Kitchen Display System runs on any Android tablet or smart TV.

| Feature | Detail |
|---|---|
| KDS display | All active tickets sorted by time |
| Color coding | Green (new) / Yellow (10 min) / Red (15+ min) |
| Timer per ticket | Live countdown from submission |
| Item acknowledge | Mark individual item "in progress" |
| Bump ticket | Mark all items complete — notifies runner |
| Priority flag | Move ticket to top of queue |
| Audio alert | Sound on new KOT arrival |
| Special instruction highlight | Allergy notes shown in red |
| Multi-section KDS | Separate screen for Kitchen, Bar |

**Decision: Build BOTH. KOT print is fallback. KDS is primary. Same cost, major UX win.**

---

## MODULE 7: Billing & Payments

This is the most critical module. Zero tolerance for bugs here.

### Bill Generation

| Feature | Detail |
|---|---|
| Generate bill | Convert open order to bill with one tap |
| Item-wise GST | Correct rate per item per HSN code |
| CGST + SGST split | Auto-calculated based on intra-state supply |
| IGST | For inter-state (future, but field exists) |
| Service charge | Auto-applied if configured |
| Subtotal, tax, total | Clear breakdown on screen before payment |
| Bill preview | Show customer-facing bill before printing |

### Discounts

| Feature | Detail |
|---|---|
| Flat discount (₹) | Manager authorization if above limit |
| Percentage discount (%) | Manager authorization if above limit |
| Item-level discount | Discount on specific item |
| Bill-level discount | Discount on total |
| Coupon code | Validate and apply predefined codes |
| Complimentary | 100% discount — Owner/Manager only |
| Discount reason | Mandatory field for all discounts |
| Discount audit | Every discount logged with who, what, when |

### Payments

| Feature | Detail |
|---|---|
| Cash | Amount entered, change auto-calculated |
| Card | Integrate with card terminal (Razorpay POS / Pine Labs) |
| UPI (QR) | Generate QR, detect payment via webhook |
| Multi-mode payment | ₹500 cash + ₹300 UPI in one bill |
| Split bill (equal) | Divide equally among N people |
| Split bill (by item) | Each person pays for their items |
| Split bill (custom) | Manual amounts |
| Advance deduction | Deduct pre-collected advance |
| Loyalty redemption | Deduct loyalty points (if enrolled) |
| Credit account | Post to customer credit (pay later) |

### After Payment

| Feature | Detail |
|---|---|
| Print receipt | Thermal printer, GST-compliant format |
| WhatsApp receipt | Auto-send to customer's phone |
| Email receipt | Optional |
| Loyalty points update | Auto-credited after payment |
| Table status update | Auto → "Cleaning" |

### Special Operations

| Feature | Detail |
|---|---|
| Bill void | Manager authorization + mandatory reason |
| Refund | Manager authorization, linked to original bill |
| Duplicate print | Reprint with "DUPLICATE" watermark |
| Bill hold | Park bill to process later |
| Offline billing | Full billing without internet for 72 hours |
| Offline sync | Auto-sync all offline bills when connection restored |

### GST Compliance

| Feature | Detail |
|---|---|
| Restaurant GSTIN on invoice | Always printed |
| HSN code per line item | Auto-populated from menu |
| Tax amount per slab | Shown as separate lines |
| B2B invoice | Accepts buyer GSTIN for business customers |
| Credit note | For refunds — GST-compliant format |
| GSTR-1 export | Monthly data export in government format |

---

## MODULE 8: Basic Inventory

**MVP Goal:** Track stock levels, alert when low, record wastage, enable basic GRN.

NOT a full procurement system in MVP. Just enough to prevent stockouts.

| Feature | Detail |
|---|---|
| Inventory item master | Name, unit, category, minimum stock level |
| Opening stock entry | Set initial stock when setting up |
| GRN (Goods Receipt) | Record received stock (with or without PO) |
| Stock issue (manual) | Record stock given to kitchen |
| Auto-deduction | Recipe-based auto-deduction when item is billed |
| Wastage entry | Record wasted items with reason |
| Manual stock adjustment | Correct errors with reason code |
| Stock report | Current levels, color-coded alerts |
| Low stock alert | Push notification + WhatsApp when item hits minimum |
| Basic recipe | Link menu item to ingredients for auto-deduction |
| Basic purchase order | Create simple PO to vendor (no approval workflow in MVP) |

### What's NOT Built in MVP
- Three-way match (PO → GRN → Invoice)
- Approval workflows
- Vendor comparison / RFQ
- FIFO batch tracking
- Expiry date alerts
- Inter-branch transfers
- Central kitchen production

---

## MODULE 9: Basic Reports

**MVP Goal:** Give the owner everything they need to understand their business from their phone.

| Report | Data Shown | Access |
|---|---|---|
| Daily Sales Summary | Revenue, covers, avg per cover, top items, payment modes | Owner, Manager |
| Hourly Sales | Revenue by hour (identify peak periods) | Owner, Manager |
| Item Sales Report | Quantity sold and revenue per item | Owner, Manager |
| Category Sales | Revenue by category | Owner, Manager |
| Payment Mode Report | Cash vs. UPI vs. Card breakdown | Owner, Manager, Accountant |
| Discount Report | Total discounts, by type, by staff | Owner, Manager |
| Void Report | All voided bills with reason and authorizer | Owner, Manager |
| Cash Reconciliation Report | POS total vs. cash counted | Owner, Manager, Cashier (own shift) |
| Z-Report (Shift Close) | Complete shift summary for cashier | Owner, Manager, Cashier |
| Inventory Stock Report | Current levels by item | Owner, Manager, Inventory |
| Wastage Report | By item, by reason, by period | Owner, Manager, Chef |
| Basic P&L Snapshot | Revenue - COGS - known expenses = estimated profit | Owner |

### Report Formats
- In-app view (charts + tables)
- Export to PDF (printable)
- Export to Excel/CSV (for accountant)

---

## MODULE 10: WhatsApp Notifications (MVP Differentiator)

This is what makes Atlas different. Every other feature is table stakes. This is the hook.

### Automated Messages Sent to Owner (No setup required — always on)

| Trigger | Message Sent | Timing |
|---|---|---|
| End of day | Full daily summary (revenue, covers, top dish, alerts) | 11:59 PM daily |
| Cash discrepancy > ₹200 | Alert with amount and shift details | Immediately on shift close |
| Bill voided | Alert with bill amount, reason, cashier name | Immediately |
| Discount > 20% applied | Alert with discount details | Immediately |
| Item out of stock | Item name and who marked it | Immediately |
| Stock hits minimum level | Item name, current qty, suggested reorder | Immediately |
| Staff didn't clock in (15 min after shift start) | Name and shift | 15 min after shift start |
| New negative review (Zomato/Google) | Review text + rating | When detected |

### WhatsApp Reply Commands (Owner can reply to get data)

| Owner Types | Response |
|---|---|
| "sales today" | Today's revenue + covers |
| "sales yesterday" | Yesterday's summary |
| "top 5 items today" | Top 5 best sellers |
| "stock" | Low stock items list |
| "void" or "voids" | Today's void summary |
| "cash" | Today's cash vs. system |
| "branch 2" | Branch 2 summary |
| Help | List of all commands |

### Customer WhatsApp Messages

| Trigger | Message |
|---|---|
| Bill paid | Receipt + loyalty points earned |
| Loyalty points about to expire | "Your X points expire in 7 days" |
| Birthday (day of) | Happy birthday + discount offer |

---

## MODULE 11: Zomato + Swiggy Integration

Most Indian restaurants get 30–60% of their revenue from these platforms. MVP without this is incomplete.

| Feature | Detail |
|---|---|
| Order auto-accept | Configure to auto-accept or manual accept |
| Unified order view | All Zomato + Swiggy orders in one screen alongside dine-in |
| Order displayed on KDS | Delivery orders go directly to kitchen display |
| Delivery KOT | Special KOT format with delivery address |
| Order rejection | Reject with reason (item unavailable) |
| Item 86 sync | Mark item unavailable on both platforms simultaneously |
| Aggregator menu | View current live menu on each platform |
| Settlement statement | View weekly/monthly payout from each platform |
| Settlement reconciliation | Compare expected vs. received payout |
| Platform on/off | Turn platform on or off in one tap |
| Delivery order billing | Auto-generate bill for delivered orders |

### What's NOT in MVP
- Push menu changes to aggregator (v1.1 — needs their approval API)
- Aggregator-specific pricing (v1.1)
- Rating/review management (v1.1)

---

## MODULE 12: Basic Customer Capture

**MVP Goal:** Know who your customers are. Full CRM in v1.1.

| Feature | Detail |
|---|---|
| Capture phone at billing | Auto-prompt for phone number when closing bill |
| Auto-create customer profile | If number is new, create profile silently |
| Visit history | How many times, when, what they ordered |
| Total spend | Lifetime spend per customer |
| Customer lookup | Search by phone number at billing |
| Birthday/Anniversary | Store date, show alert when they visit |
| Customer name on bill | If known, print name on receipt |

### What's NOT in MVP
- Loyalty points system (v1.1)
- Customer segments (v1.1)
- Campaign sending (v1.1)
- Online customer portal (v1.1)

---

## MODULE 13: Staff Management

**MVP Goal:** Know who is working and who did what.

| Feature | Detail |
|---|---|
| Staff profile | Name, phone, role, joining date |
| Staff deactivation | Remove access without deleting history |
| Clock-in / Clock-out | Via OTP on mobile or manager manual entry |
| Attendance report | Daily/monthly attendance per staff member |
| Late arrival flag | Highlight clock-in after scheduled shift start |
| Absent alert | WhatsApp to manager if staff doesn't clock in |

### What's NOT in MVP
- Leave management (v1.1)
- Payroll (v1.2)
- Performance reviews (v2)

---

# 7. MVP Screens — Complete List

## Owner Mobile App (React Native)
1. Dashboard (revenue, alerts, quick stats)
2. Branch comparison (if multi-branch)
3. Alerts and notifications
4. Reports (sales, inventory, cash, voids)
5. Settings (notifications, access)

## Web App — POS / Billing
1. Login screen
2. Table floor plan (real-time)
3. Order screen (menu browse + cart)
4. Bill screen (items, discounts, taxes, payments)
5. Payment success screen + receipt options
6. Cashier shift close / Z-report
7. KDS screen (full screen — kitchen)
8. Delivery orders screen (aggregator orders)
9. Waitlist management

## Web App — Back Office
10. Dashboard (same as owner mobile but on browser)
11. Menu management (categories, items, modifiers)
12. Inventory dashboard (stock levels)
13. GRN entry
14. Wastage entry
15. Purchase order (basic)
16. Reports (all report types)
17. Customer list
18. Staff list + attendance
19. Settings (restaurant, branch, users, roles, printers, GST)
20. Notification settings

**Total: 20 screens.** Every screen is complete. Nothing is half-built.

---

# 8. MVP Technical Stack (Lean)

For MVP, use the simplest version of the full architecture that is still production-grade.

| Layer | MVP Choice | Why |
|---|---|---|
| Backend API | Node.js + Fastify + TypeScript | Fast to build, type-safe |
| Frontend Web | Next.js 14 + Tailwind + shadcn/ui | Fast UI development |
| Mobile (Owner) | React Native + Expo | Code sharing with web |
| Database | PostgreSQL (Neon.tech or Railway) | Full ACID, no ops overhead |
| Cache | Redis (Upstash) | Serverless Redis, free tier |
| File Storage | Cloudflare R2 | Cheaper than S3 |
| Auth | JWT + bcrypt (custom, simple) | No vendor lock-in |
| Payments | Razorpay (UPI + card + wallet) | Best India coverage |
| WhatsApp | Meta Cloud API (free 1000 msgs/month) | Direct, no middleman |
| SMS | MSG91 | Most reliable in India |
| Zomato/Swiggy | Official partner API | Must apply for access early |
| Hosting | Railway (backend) + Vercel (frontend) | Zero-ops, free tier |
| Monitoring | Sentry (error tracking) | Free tier, immediate |
| CI/CD | GitHub Actions | Already free with GitHub |

**Monthly infra cost at MVP (0 customers): ₹5,000–₹8,000**

### What Is NOT Used in MVP
- Kubernetes — overkill at this stage
- Kafka — use Postgres-based job queue (pg-boss)
- Elasticsearch — use Postgres full-text search
- Microservices — start as a modular monolith, split later
- AI services — Phase 2 (needs data first)

---

# 9. MVP Architecture — Modular Monolith

**Not microservices. Not a monolith spaghetti. A modular monolith.**

```
atlas-backend/
│
├── modules/
│   ├── auth/
│   ├── restaurant/
│   ├── menu/
│   ├── orders/
│   ├── billing/
│   ├── inventory/
│   ├── customers/
│   ├── staff/
│   ├── reports/
│   ├── notifications/
│   └── integrations/
│       ├── zomato/
│       └── swiggy/
│
├── shared/
│   ├── database/
│   ├── middleware/
│   ├── events/         ← in-process event bus (switch to Kafka later)
│   └── utils/
│
└── app.ts
```

**Why modular monolith for MVP:**
- 10x faster to build than microservices
- Can split any module into its own service later (modules are already isolated)
- One deployment = less ops overhead
- One database = simpler queries
- Team of 2–3 can maintain it

---

# 10. MVP Non-Functional Requirements

| Requirement | Target | Why This Level |
|---|---|---|
| Billing screen load | < 1.5 seconds | Petpooja is slow — this is the USP |
| KOT transmission | < 500ms | Kitchen cannot wait |
| Offline duration | 72 hours | Enough for any outage |
| Uptime | 99.5% (4.4 hours downtime/month) | Realistic for MVP infra |
| API response time (p95) | < 800ms | Good enough for v1 |
| Concurrent users per outlet | 20 | Enough for single outlet |
| Max bills/day per outlet | 1,000 | Covers 95% of target restaurants |
| Data backup | Daily | Neon.tech automatic |
| Mobile app size | < 25MB | Low storage devices |
| Works on Android | Android 8+ | Covers 95% of Indian devices |

---

# 11. MVP Compliance Checklist

These are LEGAL requirements. Cannot skip.

| Requirement | Status in MVP |
|---|---|
| FSSAI license number on invoice | ✅ Mandatory setup field |
| GST registration number on invoice | ✅ Mandatory setup field |
| Veg / Non-veg symbol on menu | ✅ Tag per item |
| GST invoice format (CGST + SGST) | ✅ Built into billing |
| GST credit note for refunds | ✅ Auto-generated |
| GSTR-1 compatible export | ✅ Monthly export |
| Digital receipt legality | ✅ WhatsApp receipt is legally valid |
| Data storage in India | ✅ All infra in India (Railway Mumbai / Neon) |

---

# 12. MVP Launch Criteria (Definition of Done)

The MVP is NOT ready to launch until every item below is checked.

## Technical
- [ ] All 20 screens built and functional
- [ ] All billing flows tested with real payments (Razorpay sandbox → production)
- [ ] GST invoice validated by a CA
- [ ] Offline billing tested for 72 hours
- [ ] Offline sync tested — zero data loss
- [ ] KDS tested on Android tablet and 42-inch TV
- [ ] Receipt prints correctly on 80mm thermal printer (ESC/POS)
- [ ] WhatsApp notifications tested for all 8 trigger types
- [ ] Zomato + Swiggy order flow end-to-end tested
- [ ] Load tested at 50 concurrent users (simulated)
- [ ] Error monitoring (Sentry) active
- [ ] Daily database backup verified

## Business
- [ ] Onboarding flow completed by someone with no prior knowledge in < 30 minutes
- [ ] Tested at a real restaurant for 5 days (pilot)
- [ ] Pricing page live
- [ ] Razorpay subscription billing configured
- [ ] Support WhatsApp number active
- [ ] Privacy policy and terms of service published

---

# 13. MVP Build Timeline

| Phase | Duration | What Gets Built |
|---|---|---|
| **Setup & Foundation** | Week 1–2 | Auth, DB schema, base API structure, CI/CD pipeline |
| **Core Operations** | Week 3–6 | Menu, Tables, Orders, KDS, KOT printing |
| **Billing Engine** | Week 7–9 | Billing, all payment modes, GST, receipts, offline |
| **Inventory Basics** | Week 10–11 | Stock, GRN, wastage, auto-deduction, alerts |
| **Reports + WhatsApp** | Week 12–13 | All reports, WhatsApp notifications, owner mobile app |
| **Integrations** | Week 14–15 | Zomato + Swiggy integration |
| **Polish + Testing** | Week 16–17 | Bug fixes, load testing, UI polish, onboarding flow |
| **Pilot Launch** | Week 18 | Launch with 3–5 real restaurants |
| **Commercial Launch** | Week 20 | Public launch, pricing live, marketing begins |

**Total: 20 weeks (5 months) — solo developer**
**With 2 developers: 12–14 weeks**

---

# 14. MVP Pricing Strategy

Based on competitor analysis and break-even math:

| Plan | Price | What's Included | Target |
|---|---|---|---|
| **Free** | ₹0/month | Billing only, 50 bills/day limit, Atlas watermark on receipts | Hook small operators |
| **Starter** | ₹499/month | All MVP features, 1 outlet, 3 users, unlimited bills | Small café, QSR, dhaba |
| **Pro** | ₹999/month | All MVP + WhatsApp reports, 1 outlet, unlimited users | Serious single-outlet |
| **Growth** | ₹1,999/month | All Pro + 3 outlets, aggregator integration, basic AI alerts | Small chains |

**Competitor pricing for reference:**
- Petpooja: ₹10,000–₹40,000/year per outlet (₹833–₹3,333/month)
- Restroworks: ₹15,000–₹60,000/year
- eZee BurrP: ₹8,000–₹25,000/year

**Atlas is 40–70% cheaper with better features.**

---

# 15. What Happens After MVP (Phase 2 Priorities)

Once you have 50 paying restaurants and 3 months of data:

| Priority | Feature | Why Then |
|---|---|---|
| P1 | Loyalty & Membership | Most requested by restaurant owners |
| P1 | Leave & Payroll | Second most requested |
| P2 | AI Demand Forecasting | Need 3 months of data to train |
| P2 | Advanced CRM + Campaigns | Need customer base first |
| P2 | Reservation Management | Fine dining customers ask for this |
| P3 | ONDC Integration | Growing fast in 2026 |
| P3 | Multi-Language (Hindi) | Tier-2/3 expansion |
| P4 | Franchise Portal | When you have a franchise customer |

---

# 16. The Single Most Important Thing

Build the billing module first. Test it obsessively.

A restaurant owner can forgive:
- Limited reports
- No loyalty program
- Basic inventory

A restaurant owner will NEVER forgive:
- Billing going wrong
- Cash not matching
- GST invoice incorrect
- Printer failing during rush

**Billing is the heartbeat. Everything else is features.**

---

# Related Documents

- BRD-001 — Business Requirements Document
- PRD-001 — Product Requirements Document
- ARCH-001 — System Architecture
- SEC-001 — Security and Compliance
- DOM-107 — Restaurant Daily Operations

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial MVP Definition |

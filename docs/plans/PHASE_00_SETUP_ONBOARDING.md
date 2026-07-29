# Phase 0 — Device Management, Setup & Onboarding
**Priority:** 🔴 Critical | **Estimate:** 3 weeks | **Depends on:** Core auth, tenant model

---

## 0. What This Plan Covers

Two tightly linked systems:

**A. Onboarding Wizard** — A new restaurant owner signs up and configures Atlas in under 20 minutes. They pick their outlet type, build their floor, set up roles, register devices, configure printers, and go live — all from a guided multi-step flow. They can also come back and change any of it later.

**B. Device Management** — Every device (POS terminal, waiter phone, kitchen display, manager tablet, owner phone) is registered, named, and configured. All devices sync in real time. Each device type shows a tailored UI and gets specific printer/floor assignments. The system knows which device is which and routes print jobs, events, and permissions accordingly.

---

## 1. How All Devices Work Together

### 1.1 Device Types

| Device Type | Who Uses It | Screen | Primary Function |
|-------------|------------|--------|-----------------|
| POS Terminal | Cashier, Manager | Desktop / large tablet | Billing, payments, order management |
| Captain App | Waiter | Mobile (5–7 inch) | Take orders at table, floor plan view |
| Kitchen Display (KDS) | Chef | TV / large tablet (always-on) | See KOTs, mark items done |
| Bar KDS | Bartender | Tablet | Bar-specific KOTs |
| Manager Dashboard | Manager, Owner | Any device | Reports, floor overview, staff |
| Owner App | Owner | Mobile | Live dashboard, alerts |
| Print Agent | Background | Any device with printer | Receive print jobs, send to thermal printer |
| Customer QR | Customer | Their own phone | Self-order, delivery tracking |

### 1.2 Network Architecture

```
All staff devices
    │
    └── Atlas Web App (PWA — works on any browser)
         │
         ├── Fastify API (REST)
         ├── SSE Stream /api/v1/events/stream (real-time)
         └── Print Agent WS (for devices with printers)

                    ┌────────────────────────────────┐
                    │         TENANT NETWORK          │
                    │                                 │
    [POS Terminal]──┤                                 │
    [Waiter Phone]──┤──── WiFi ────── Atlas API ─────│──── Neon DB
    [KDS Screen]────┤                     │           │
    [Manager iPad]──┤                 SSE Stream      │
    [LAN Printer]───┘                                 │
                                                      │
    [Owner's Phone on 4G] ─── internet ──────────────┘
```

**Requirements:**
- All staff devices on the same WiFi network (for LAN printer access + low-latency SSE)
- Atlas API is cloud-hosted (Neon DB) — internet required
- Owner can access from anywhere via 4G/home WiFi
- Print Agent device must be on same network as the LAN thermal printer

### 1.3 Device Communication Flow

```
Example: Waiter creates order on phone

Waiter Phone
  → POST /api/v1/orders (creates order in DB)
  ← 200 OK { orderId }

Atlas API
  → Broadcasts SSE event ORDER_CREATED to all devices of this tenant

Simultaneously, all connected devices receive the event:
  POS Terminal    → React Query invalidates 'orders' → refetches → cashier sees new order
  KDS Screen      → no change yet (KOT not sent)
  Manager iPad    → floor map: Table T-07 goes from green to red
  Another Waiter  → same table greyed out (occupied)

Waiter sends to kitchen:
  → POST /api/v1/orders/:id/send-to-kitchen
  ← KOT created

Atlas API
  → SSE event KOT_CREATED
  → PrintJob created for kitchen printer

KDS Screen       → new KOT card slides in
Kitchen Printer  → Print Agent receives job → ESC/POS to printer → KOT prints
Manager iPad     → pending KOT count shows on table card
```

### 1.4 What Each Device Sees

**POS Terminal (Cashier view):**
- Full billing screen: menu, order panel, payment
- All orders list, filter by status
- Bills queue: pending payment
- Notification panel: new orders, KOT done, payment confirmations

**Captain App (Waiter mobile):**
- Floor plan (own section or all tables, configurable)
- Table tap → open order for that table
- Compact menu (item grid + search)
- Quick add items, set modifiers
- "Send to Kitchen" button
- Order status at a glance (KOT pending/done indicators on table card)

**KDS (Kitchen Display):**
- Full screen KOT board (no login screen, runs as a dedicated display)
- Left column: PENDING, Center: IN_PROGRESS, Right: DONE / READY
- Each KOT card: table, covers, waiter, items with status
- Tap item to toggle status
- Audio alert on new URGENT KOT
- Never times out / never logs out (dedicated device mode)

**Manager Dashboard:**
- Floor plan overview (all floors)
- Live KPIs: covers seated, revenue today, pending KOTs, active orders
- Staff online indicator (which devices are connected)
- Approve void/discount requests
- Access to all features

**Owner App (Mobile, read-heavy):**
- Live dashboard: today's revenue, orders, table occupancy
- Quick action: push an alert to manager, view reports
- Cannot operate POS (no billing UI — read only unless also MANAGER role)

---

## 2. Onboarding Wizard

### 2.1 Wizard Overview

A new tenant completes 8 steps. Each step is saved as they go (can quit and resume):

```
Step 1: Restaurant Details
Step 2: Outlet Type & Business Settings
Step 3: Floors & Tables
Step 4: Menu Setup
Step 5: Roles & Team
Step 6: Device Setup
Step 7: Printers & Payments
Step 8: Review & Go Live
```

Progress bar at top. Each step has a "Skip for now" option (except Step 1). Skipped steps show an incomplete badge — accessible later from `/settings`.

### 2.2 Step 1 — Restaurant Details

```
Restaurant Name*          [text input]
Logo                      [image upload — crop to 1:1]
Cuisine Type              [multi-select: Indian, Chinese, Italian, Continental, Fast Food, Bakery, Bar, Cafe, Other]
Outlet Type               [single select — see 2.3]
Address Line 1*           [text]
Address Line 2            [text]
City*                     [text]
State*                    [dropdown — all Indian states]
Pincode*                  [6-digit input]
Phone Number              [10-digit, used for customer-facing pages]
Email                     [pre-filled from signup]
Website                   [optional]
GSTIN                     [optional, 15-char validation]
FSSAI Number              [optional]
```

### 2.3 Step 2 — Outlet Type & Business Settings

**Outlet Type Selection (visual cards):**
```
[QSR / Fast Food]     [Fine Dining]     [Casual Dining]
[Cafe / Bakery]       [Bar / Lounge]    [Cloud Kitchen]
[Food Court]          [Hotel Restaurant] [Other]
```

Each outlet type sets intelligent defaults:
| Outlet Type | Service Charge | Table Service | KDS | Captain App |
|------------|---------------|--------------|-----|-------------|
| QSR | 0% | Off (counter) | On | Off |
| Fine Dining | 10% | On | On | On |
| Casual Dining | 5% | On | On | On |
| Cafe | 0% | On (optional) | Off | Off |
| Bar | 0% | On | On (bar) | On |
| Cloud Kitchen | 0% | Off (delivery) | On | Off |

**Business Settings (editable after outlet type sets defaults):**
```
Service Charge (%)        [0–20%, default from outlet type]
GST Registration          [Composite / Regular]
Default Tax Rate          [5% / 12% / 18% / None]
Currency                  [INR (fixed)]
Timezone                  [Asia/Kolkata (fixed for India)]
Business Hours            [Open time — Close time, per day of week]
Accepts Table Reservations [Yes / No]
Accepts Online Orders     [Yes / No → triggers aggregator setup]
Self-Ordering QR          [Yes / No → generates QR menu link]
```

### 2.4 Step 3 — Floors & Tables

**Interactive floor builder:**
- Default: 1 floor named "Ground Floor"
- Add floor button → name the floor
- Table tool: click to place a table on the floor map
- Table properties:
  - Name: T-01, T-02 (auto-increment, editable)
  - Capacity: 2 / 4 / 6 / 8 / custom
  - Shape: circle, square, rectangle
  - Section: AC / Non-AC / Outdoor / Bar / Private Room (editable list)
- Drag tables to position
- Floor sections shown as colored zones (drag to draw zone boundary)
- "Generate tables" bulk option: "Add 10 tables of 4 seats in a grid"
- Preview: see what the floor will look like in the POS

**Table naming convention:**
- Restaurant can pick: T-01 / Table 1 / custom per table
- Sections auto-prefix: outdoor tables can be O-01, O-02

### 2.5 Step 4 — Menu Setup

**Three options:**
```
[A] Import from CSV / Excel
    → Download template → fill → upload
    → Preview imported items → confirm

[B] Import from Petpooja / Posist / Torqus
    → Paste export file from other POS
    → Auto-maps categories, items, variants, GST

[C] Start fresh
    → Add categories one by one
    → Add items to each category
    → (Full menu editor available later in /menu)
```

**Quick-add in wizard (for fresh start):**
- Category name + color
- Add items: name, price, veg/non-veg dot, photo (optional)
- Variants toggle (add sizes if needed)
- Minimum viable: just name + price is enough to go live

### 2.6 Step 5 — Roles & Team

**Built-in roles shown with descriptions:**
```
OWNER          — Full access, cannot be restricted
               Already set up (you)

MANAGER        — Operations: all POS, reports, staff management
               Recommended: Restaurant manager, operations head

CASHIER        — Billing and payments only
               Recommended: Counter staff, billing desk

WAITER         — Take orders, floor view, no billing
               Recommended: Table service staff, captain

CHEF           — Kitchen display, mark items done
               Recommended: Kitchen staff, head chef

INVENTORY_MANAGER — Inventory and purchase orders only
               Recommended: Store manager, purchase manager
```

**For each role the tenant wants to use:**
- Toggle ON/OFF (Owner always ON, cannot toggle)
- "Customize permissions" expander (see 3.2)
- Add team members:
  - Name + phone/email
  - Assign role
  - Set 4-digit PIN (for quick login)
  - They receive an SMS/email invite

**Minimum required:** Just the owner can run the system. Other roles are optional.

### 2.7 Step 6 — Device Setup

**Device types the restaurant has:**
```
[POS Terminal]    How many? [1] [2] [3] [4+]
                  Each gets a name: "Front Desk", "Counter 2"

[Kitchen Display] How many? [0] [1] [2]
                  Each gets a name: "Main Kitchen", "Bar"

[Waiter Devices]  How many phones/tablets? [number input]
                  Named automatically: Waiter-1, Waiter-2 etc.

[Manager Screen]  [Yes / No]
                  The manager's device — desktop or tablet

[Print Agent]     [Yes / No]
                  Device connected to a USB/Bluetooth printer
```

**Each device setup:**
- Device name (e.g., "Front Counter iPad")
- Device role: which Atlas URL it opens by default
  - POS Terminal → `/pos`
  - KDS → `/kds`
  - Waiter mobile → `/floor` (captain view)
  - Manager → `/dashboard`
- Assigned floor (which floor this device primarily manages)
- Printer assignment (which printer is default for billing on this device)

**Device token:**
- Each registered device gets a QR code
- Staff opens that QR on the device → device is registered
- Device name shows in "Online devices" panel on manager dashboard

### 2.8 Step 7 — Printers & Payments

**Printers:**
```
[Add Printer]
  Name:           Main Kitchen Printer
  Type:           Network (LAN) | USB | Bluetooth | Cloud
  Paper Size:     58mm | 80mm | A4
  IP Address:     [192.168.1.XX] (if Network type)
  Prints for:     KOT | Bill | Both
  Test Print      [button — sends test page]
```

**Payment Methods (enable/disable each):**
```
[x] Cash          — always on
[ ] UPI / QR      → Enter UPI ID or VPA: restaurant@upi
[ ] Card          → Manual approval | Pine Labs Terminal | Razorpay Terminal
[ ] Wallet        → Requires CRM (Phase 4)
[ ] Loyalty       → Requires CRM (Phase 4)
[ ] Credit        → House account (manual approval required)
[ ] Complimentary → Staff/owner use (manager approval required)
```

**Online ordering (if enabled in Step 2):**
```
[ ] Zomato        → API Key, Restaurant ID
[ ] Swiggy        → API Key, Restaurant ID
[ ] Magicpin      → API Key, Restaurant ID
```

### 2.9 Step 8 — Review & Go Live

**Summary page showing everything configured:**
```
Restaurant:    Spice Garden, Mumbai
Outlet Type:   Fine Dining
Floors:        2 floors, 28 tables (AC: 16, Outdoor: 8, Bar: 4)
Menu:          6 categories, 45 items imported
Team:          1 Manager, 2 Cashiers, 4 Waiters, 2 Chefs
Devices:       2 POS Terminals, 1 KDS, 1 Print Agent
Printers:      Main Kitchen (80mm LAN), Bar (58mm LAN)
Payments:      Cash, UPI, Card
```

**Pre-launch checklist:**
- [ ] Test print from kitchen printer
- [ ] Create a test order end-to-end
- [ ] Confirm UPI payment (₹1 test)
- [ ] All staff invited and set up PINs

**"Go Live" button** → marks tenant `onboardingCompleted = true`, redirects to `/pos`

**Post-wizard:** banner on `/settings` for any incomplete steps.

---

## 3. Role & Permission System

### 3.1 Permission Categories

Every permission belongs to one of these groups:
```
ORDERS      — create, edit, cancel, transfer, merge orders
KOT         — send to kitchen, update status, hold/fire courses
BILLING     — create bill, record payment, apply discount, void
MENU        — view menu, edit menu, toggle availability
INVENTORY   — view, add stock, create PO, GRN
STAFF       — view staff, add/edit staff, manage attendance
REPORTS     — view reports (per report type)
SETTINGS    — billing settings, printers, outlet config
SYSTEM      — day-close, data export, integrations
```

### 3.2 Permission Drag & Drop Builder

Located at `/settings/roles` (OWNER only).

**UI Layout:**
```
Left panel: Available Permissions (grouped by category)
Right panel: Role cards (MANAGER, CASHIER, WAITER, CHEF, INVENTORY_MANAGER)

Drag a permission chip from the left → drop on a role card → that role gets the permission
OR toggle the checkbox on the role card directly

"Reset to defaults" button — restores Petpooja-equivalent defaults
"Copy from role" — copy all permissions from one role to another
```

**Permission chips look like:**
```
[ORDERS: Cancel order]   [BILLING: Apply discount]
[REPORTS: View daily]    [MENU: Toggle availability]
```

**Drag interaction:**
- Grab chip → it lifts with a shadow
- Role card highlights on hover (shows "Drop here")
- Drop → chip appears in role card, checkbox checked
- Drag chip OUT of role card → permission removed
- Shift-drag → copy to multiple roles at once

**Built-in constraints (non-removable):**
- OWNER always has all permissions
- Certain permissions require OWNER (e.g., delete tenant data, change GSTIN)
- Some permissions auto-bundle: "Record payment" requires "Create bill"
  → if user drops "Record payment" without "Create bill", system auto-adds "Create bill" with a tooltip

### 3.3 Permission Schema

```prisma
model RolePermission {
  id         String   @id @default(cuid())
  tenantId   String
  role       UserRole
  permission String   // "ORDERS:cancel", "BILLING:void", "REPORTS:daily"
  grantedBy  String
  createdAt  DateTime @default(now())

  @@unique([tenantId, role, permission])
  @@index([tenantId, role])
}

model PermissionDefinition {
  key         String   @id   // "ORDERS:cancel"
  group       String         // "ORDERS"
  label       String         // "Cancel orders"
  description String
  requires    String[]       // auto-grants these if this is granted
  ownerOnly   Boolean        @default(false)
}
```

**API check (middleware):**
```ts
// hasPermission middleware
async function hasPermission(permission: string) {
  return async (request, reply) => {
    const { tenantId, role } = request.user
    if (role === 'OWNER') return // always allowed
    const granted = await prisma.rolePermission.findFirst({
      where: { tenantId, role, permission }
    })
    if (!granted) return reply.code(403).send({ error: 'FORBIDDEN' })
  }
}

// Usage in route:
preHandler: [authenticate, hasPermission('BILLING:void')]
```

### 3.4 Default Permission Matrix

| Permission | OWNER | MANAGER | CASHIER | WAITER | CHEF | INV_MGR |
|-----------|:-----:|:-------:|:-------:|:------:|:----:|:-------:|
| ORDERS:create | Y | Y | Y | Y | N | N |
| ORDERS:cancel | Y | Y | Y | N | N | N |
| ORDERS:transfer | Y | Y | Y | N | N | N |
| KOT:send | Y | Y | Y | Y | N | N |
| KOT:update-status | Y | Y | N | N | Y | N |
| KOT:hold-fire | Y | Y | Y | N | Y | N |
| BILLING:create | Y | Y | Y | N | N | N |
| BILLING:payment | Y | Y | Y | N | N | N |
| BILLING:discount | Y | Y | N | N | N | N |
| BILLING:void | Y | Y | N | N | N | N |
| BILLING:complimentary | Y | Y | N | N | N | N |
| MENU:toggle-availability | Y | Y | Y | N | Y | N |
| MENU:edit | Y | Y | N | N | N | N |
| INVENTORY:view | Y | Y | N | N | N | Y |
| INVENTORY:edit | Y | Y | N | N | N | Y |
| INVENTORY:po | Y | Y | N | N | N | Y |
| REPORTS:sales | Y | Y | Y | N | N | N |
| REPORTS:inventory | Y | Y | N | N | N | Y |
| REPORTS:staff | Y | Y | N | N | N | N |
| SETTINGS:billing | Y | Y | N | N | N | N |
| SETTINGS:printers | Y | Y | N | N | N | N |
| SYSTEM:day-close | Y | Y | N | N | N | N |
| SYSTEM:export | Y | Y | N | N | N | N |

---

## 4. Device Registration & Management

### 4.1 Device Model

```prisma
model Device {
  id           String      @id @default(cuid())
  tenantId     String
  name         String      // "Front Desk iPad", "Kitchen Display 1"
  type         DeviceType
  token        String      @unique  // device-specific JWT, long-lived
  defaultUrl   String?     // "/pos", "/kds", "/floor"
  floorId      String?     // assigned floor (for waiter devices)
  printerId    String?     // default printer for this device
  lastSeenAt   DateTime?
  lastSeenIp   String?
  isActive     Boolean     @default(true)
  createdAt    DateTime    @default(now())
  @@index([tenantId])
}

enum DeviceType {
  POS
  KDS
  CAPTAIN
  MANAGER
  PRINT_AGENT
  OWNER_MOBILE
  CUSTOMER_KIOSK
}
```

### 4.2 Device Registration Flow

```
1. Admin opens /settings/devices
2. Clicks "Register New Device"
3. System generates a one-time QR code (valid 10 minutes)
4. Admin names the device + sets type
5. On the target device:
   a. Open any browser → navigate to atlas URL
   b. Click "Register this device" (shown on login screen if no auth)
   OR
   b. Scan the QR code shown by admin
6. Device receives a long-lived device token (stored in localStorage)
7. Device name + type pre-fills the app settings
8. Device appears in /settings/devices as "Online"
```

### 4.3 Device Settings (Per Device)

Each device has its own settings persisted in DB:

```prisma
model DeviceSettings {
  deviceId         String   @id
  defaultFloorId   String?  // which floor to show by default
  defaultPrinterId String?  // printer for this device
  autoKotPrint     Boolean  @default(true)
  autoBillPrint    Boolean  @default(true)
  soundAlerts      Boolean  @default(true)
  darkMode         Boolean  @default(false)
  displayMode      DeviceDisplayMode @default(STANDARD)
}

enum DeviceDisplayMode {
  STANDARD    // normal web app
  KIOSK       // full screen, no browser chrome, auto-start
  KDS         // kitchen display: auto-fullscreen, no login
}
```

### 4.4 KDS Dedicated Mode

KDS devices run in a special mode:
- Auto-fullscreen on load
- No login required (tenant ID embedded in URL: `/kds?t=tenantSlug`)
- Shows only KOT board for assigned kitchen station
- Never times out
- PIN-protected exit (exit KDS mode requires manager PIN)
- Sound alert for new URGENT KOTs

```
URL: /kds?t=spicegarden&station=main-kitchen
URL: /kds?t=spicegarden&station=bar
```

### 4.5 Print Agent Setup

The Print Agent is a separate small app for USB/Bluetooth printers:

**Installation:**
1. Download `atlas-print-agent-win.exe` (or .dmg / .deb)
2. Install on the device connected to the printer
3. Open Print Agent → Enter Atlas URL + device token
4. Print Agent connects via WebSocket to Atlas
5. Test print button → confirms working

**Print Agent in Atlas:**
- Appears as a device of type `PRINT_AGENT`
- Shows "Online / Offline" status in device list
- Printer config: paper size, character width, print speed

**Alternative for Raspberry Pi:**
```
npm install -g atlas-print-agent
atlas-print-agent --url https://yourapp.com --token DEVICE_TOKEN
```

---

## 5. URL Architecture — Complete Map

### 5.1 Authenticated Routes (Staff)

```
/                       → redirect to /pos (if logged in) or /login
/login                  → staff login with email+password or PIN
/pos                    → main billing terminal [CASHIER, MANAGER, OWNER]
/pos/order/[id]         → order detail + payment screen
/floor                  → floor plan view [WAITER+]
/floor/reservations     → reservation timeline [CASHIER+]
/kds                    → kitchen display system [CHEF, MANAGER, OWNER]
/kds/[station]          → station-specific KDS (bar, bakery, etc.)
/orders                 → all orders list [CASHIER+]
/orders/delivery        → delivery orders only
/captain                → captain app home (mobile floor view)
/captain/[tableId]      → table order view
/menu                   → menu management [MANAGER, OWNER]
/menu/availability      → item on/off control [CASHIER+]
/inventory              → inventory management [INV_MGR, MANAGER, OWNER]
/reports                → reports hub [per-role filtered]
/billing                → billing page [CASHIER+]
/customers              → CRM [MANAGER, OWNER] (Phase 4)
/staff                  → staff management [MANAGER, OWNER]
/settings               → settings hub [MANAGER, OWNER]
/settings/restaurant    → restaurant details
/settings/billing       → tax, service charge, receipt format
/settings/printers      → printer configuration
/settings/devices       → device management
/settings/roles         → role + permission editor [OWNER]
/settings/integrations  → Zomato, Swiggy, payment gateways
/settings/team          → invite staff, manage roles
/day-close              → day-end operations [MANAGER, OWNER]
/dashboard              → live KPI dashboard [MANAGER, OWNER]
/advisor                → AI business advisor [MANAGER, OWNER] (Phase 9)
/onboarding             → setup wizard (redirects here on first login)
```

### 5.2 Public Routes (No Auth Required)

```
/order/[tableId]        → customer self-order via QR at table
/order/[tableId]/track  → customer order status page
/menu/[tenantSlug]      → public menu browsing (no ordering)
/r/[reservationCode]    → reservation confirmation page (WhatsApp link)
/track/[deliveryId]     → own-delivery order tracking page
/pay/[billId]           → customer payment page (UPI QR)
/kds                    → KDS runs with device token, not user session
```

### 5.3 System / API Routes

```
/api/v1/*               → all API endpoints
/api/v1/events/stream   → SSE stream (auth required)
/api/v1/webhooks/zomato → Zomato order webhook (signed)
/api/v1/webhooks/swiggy → Swiggy order webhook (signed)
/api/v1/webhooks/razorpay → payment webhook
/api/v1/public/menu/:tenantSlug → public menu data
```

### 5.4 URL Count Summary

| Category | Count |
|---------|-------|
| Authenticated staff routes | 28 |
| Public customer routes | 6 |
| API routes | ~60 (Phase 1 alone) |
| Webhook endpoints | 5 |
| **Total unique paths** | ~100 |

---

## 6. Hardware Recommendations

### 6.1 Minimum Setup (Small Cafe, 1 Counter)

```
1x Billing Device      Any laptop or tablet (Windows/Mac/iPad)
1x Thermal Printer     Epson TM-T82 (80mm, LAN) — ~₹8,000
   Network             Stable WiFi router (~₹1,500)
Total Hardware:        ~₹10,000
```

### 6.2 Standard Setup (20-table Restaurant)

```
1x POS Terminal        Windows tablet or laptop (dedicated)
2x Waiter Devices      Any Android/iPhone with decent screen
1x KDS                 32" TV with Fire Stick (runs browser in kiosk mode)
1x Kitchen Printer     Epson TM-T82 (80mm LAN) — ₹8,000
1x Bill Printer        Same printer or separate
   Network             TP-Link router with dedicated WiFi for POS devices
Total Hardware:        ~₹25,000–35,000
```

### 6.3 Premium Setup (Fine Dining, 50+ covers)

```
2x POS Terminals       Dell/HP all-in-one POS (Windows)
6x Waiter Devices      Samsung Galaxy Tab A (7")
2x KDS Screens         32" LG display + mini PC
1x Bar KDS             10" Tablet
2x Kitchen Printers    Epson TM-T88 (80mm LAN, fast) — ₹12,000 each
1x Bill Printer        Epson TM-T88
1x Label Printer       Zebra GK420 (for packaging labels)
   Network             Managed switch + dedicated AP
Total Hardware:        ~₹1,00,000–1,50,000
```

### 6.4 Supported Thermal Printer Models

| Brand | Model | Type | Paper | Notes |
|-------|-------|------|-------|-------|
| Epson | TM-T82 | LAN/USB | 80mm | Most common in India |
| Epson | TM-T88VI | LAN/USB | 80mm | Fast, premium |
| Star | TSP654 | LAN | 80mm | Good LAN support |
| TVS | RP45 | USB | 58mm/80mm | Budget, Indian brand |
| Gprinter | GP-80160 | LAN | 80mm | Budget option |
| Rongta | RP320 | LAN/BT | 80mm | Mid-range |

---

## 7. Offline Mode

### 7.1 What Works Offline

When internet drops on a device:

| Feature | Offline Support | Notes |
|---------|----------------|-------|
| Take order | Yes | Draft saved in localStorage |
| View floor plan | Partial | Last state shown, no live updates |
| View menu | Yes | Cached via Service Worker |
| Send to kitchen | No | Needs API call |
| Print bill | No | Needs server |
| View past orders | Partial | Cached |
| Accept payment | No | Needs server for UPI/card |

### 7.2 Offline UX

- Orange banner: "You're offline — orders will sync when connection restores"
- Draft orders saved in IndexedDB
- On reconnect: automatic sync attempts all queued actions
- Conflict resolution: server state wins on conflict

### 7.3 Service Worker Caching

```
Cached (instant load):
  - menu items and categories (revalidate every 30 min)
  - floor plan layout
  - staff list
  - app shell (HTML/CSS/JS)

Not cached (requires internet):
  - live order data
  - reports
  - payment processing
  - SSE stream
```

---

## 8. Multi-Staff Login

### 8.1 Login Methods

**Method A — Email + Password:**
- For OWNER and MANAGER: full credential login
- JWT auth_token + refresh token
- Session: 15-minute access token, 30-day refresh

**Method B — 4-digit PIN (Quick Login):**
- For WAITER, CASHIER, CHEF
- No username required on shared devices
- PIN entry screen shows staff list (by role) → tap name → enter PIN
- Short session: 8-hour token (expires after shift)

**Method C — Device token (KDS):**
- KDS devices use a long-lived device token (1 year)
- No staff login needed — the device is always authenticated as a "display" mode
- Cannot perform write operations (only updates KOT status)

### 8.2 Staff Session on Shared Device

Shared devices (one POS used by multiple cashiers in shifts):
- Each shift: cashier PINs in
- At shift end: "End Session" → logs out cashier
- Device remains registered (device token preserved)
- Next cashier PINs in

**Manager PIN override:**
- Any screen can ask "Manager approval needed"
- Manager doesn't need to log in — enters their PIN in a modal
- Approval logged with manager ID + timestamp
- Use cases: discount, void, cancel, complimentary

---

## 9. Settings Architecture

### 9.1 Settings Sections

```
/settings
  ├── Restaurant             → name, logo, address, GSTIN, FSSAI
  ├── Business               → outlet type, hours, service charge, GST
  ├── Floors & Tables        → add/edit floors, table layout editor
  ├── Billing                → receipt format, bill numbering, tip on/off
  ├── Printers               → add/configure/test printers
  ├── Devices                → register/manage devices
  ├── Roles & Permissions    → drag-drop permission builder
  ├── Team                   → invite staff, assign roles, set PINs
  ├── Payments               → enable/disable payment methods, UPI config
  ├── Integrations           → Zomato, Swiggy, WhatsApp, Razorpay
  ├── Notifications          → alert preferences (sound, push, WhatsApp)
  └── Danger Zone            → reset data, delete account
```

### 9.2 Tenant Configuration Model

```prisma
model TenantConfig {
  tenantId           String   @id
  outletType         OutletType
  serviceChargeRate  Int      @default(0)    // basis points (1000 = 10%)
  defaultTaxRate     Int      @default(500)  // basis points (500 = 5%)
  gstRegistrationType String  @default("regular") // regular | composite
  billNumberFormat   String   @default("B-{YYYY}-{SEQ}")
  kotNumberFormat    String   @default("KOT-{SEQ}")
  tipEnabled         Boolean  @default(false)
  roundOffEnabled    Boolean  @default(true)
  requireCoversOnSeat Boolean @default(true)
  autoKotPrint       Boolean  @default(true)
  autoBillPrint      Boolean  @default(true)
  kotPrintOnEachItem Boolean  @default(false) // print KOT for each new item or all at once
  selfOrderEnabled   Boolean  @default(false)
  reservationsEnabled Boolean @default(true)
  loyaltyEnabled     Boolean  @default(false)
  defaultCurrency    String   @default("INR")
  businessHours      Json     // { mon: {open, close}, tue: {...}, ... }
  receiptHeader      String?  // custom header text on receipt
  receiptFooter      String?  // e.g. "Thank you! Wi-Fi: restaurant123"
  onboardingCompleted Boolean @default(false)
  onboardingStep     Int      @default(1)
}

enum OutletType {
  QSR
  FINE_DINING
  CASUAL_DINING
  CAFE
  BAR
  CLOUD_KITCHEN
  FOOD_COURT
  HOTEL_RESTAURANT
  OTHER
}
```

---

## 10. Complete DB Schema Additions

```prisma
// Device
model Device {
  id           String      @id @default(cuid())
  tenantId     String
  name         String
  type         DeviceType
  token        String      @unique
  defaultUrl   String?
  floorId      String?
  printerId    String?
  lastSeenAt   DateTime?
  lastSeenIp   String?
  isActive     Boolean     @default(true)
  settings     DeviceSettings?
  createdAt    DateTime    @default(now())
  @@index([tenantId])
}

model DeviceSettings {
  deviceId         String   @id
  defaultFloorId   String?
  defaultPrinterId String?
  autoKotPrint     Boolean  @default(true)
  autoBillPrint    Boolean  @default(true)
  soundAlerts      Boolean  @default(true)
  darkMode         Boolean  @default(false)
  displayMode      DeviceDisplayMode @default(STANDARD)
  device           Device   @relation(fields: [deviceId], references: [id])
}

enum DeviceType {
  POS KDS CAPTAIN MANAGER PRINT_AGENT OWNER_MOBILE CUSTOMER_KIOSK
}

enum DeviceDisplayMode {
  STANDARD KIOSK KDS
}

// Role Permissions
model RolePermission {
  id         String   @id @default(cuid())
  tenantId   String
  role       UserRole
  permission String
  grantedBy  String
  createdAt  DateTime @default(now())
  @@unique([tenantId, role, permission])
  @@index([tenantId, role])
}

// Onboarding
model OnboardingProgress {
  tenantId        String   @id
  completedSteps  Int[]    // [1, 2, 3] means steps 1-3 done
  currentStep     Int      @default(1)
  isCompleted     Boolean  @default(false)
  completedAt     DateTime?
}
```

---

## 11. API Routes

### Onboarding
```
GET    /api/v1/onboarding/progress           — current step + completed steps
POST   /api/v1/onboarding/step/:step         — save step data
POST   /api/v1/onboarding/complete           — mark onboarding done
GET    /api/v1/onboarding/checklist          — post-wizard checklist status
```

### Devices
```
GET    /api/v1/devices                        — list all devices [MANAGER+]
POST   /api/v1/devices                        — register device
GET    /api/v1/devices/:id                    — device detail
PATCH  /api/v1/devices/:id                    — update name/settings
DELETE /api/v1/devices/:id                    — deregister
POST   /api/v1/devices/register-qr            — generate QR for device registration
POST   /api/v1/devices/activate               — device scans QR, activates with token
GET    /api/v1/devices/online                 — list currently connected devices (from SSE)
```

### Role Permissions
```
GET    /api/v1/roles/permissions              — all permissions for all roles [OWNER]
PATCH  /api/v1/roles/:role/permissions        — update permissions for a role [OWNER]
GET    /api/v1/roles/permissions/defaults     — get default permission set
POST   /api/v1/roles/:role/reset-permissions  — reset to defaults
GET    /api/v1/permissions/definitions        — all available permissions + groups
```

### Settings
```
GET    /api/v1/settings/config                — tenant config
PATCH  /api/v1/settings/config                — update config
PATCH  /api/v1/settings/business-hours        — update hours per day
PATCH  /api/v1/settings/receipt               — update receipt header/footer
GET    /api/v1/settings/integrations          — all integration configs
PATCH  /api/v1/settings/integrations/:type    — update specific integration
```

---

## 12. Edge Cases

### Onboarding
- Tenant skips Step 3 (tables) → POS still works as "walk-in / counter" mode (no floor plan)
- Tenant skips Step 4 (menu) → can still create orders with manual item entry (free-text + price)
- Onboarding interrupted at Step 5 → progress saved, resume from same step next login
- Two owners complete onboarding simultaneously (e.g. two owners of same restaurant) → last save wins, show conflict warning
- Tenant imports CSV with duplicate item names → deduplicate by name + category, show preview with warnings

### Devices
- Device token leaked / stolen → revoke from /settings/devices → device immediately loses access
- Two staff PIN in on same device → second PIN-in logs out first user (device session is single-user)
- KDS device shows wrong orders → device token belongs to wrong tenant (check token scope)
- Print Agent device goes offline → print jobs queue in DB → auto-flush when agent reconnects
- Device clock drifts → all timestamps come from server, not device

### Role Permissions
- Permission dependency: "BILLING:payment" without "BILLING:create" → auto-add create
- OWNER removes all permissions from CASHIER → CASHIER role effectively locked out → show warning
- Custom permission applied to waiter → on next login, waiter sees new feature → ensure frontend also checks backend permissions, not just frontend role
- Manager tries to grant a permission they don't have themselves → blocked (cannot escalate)

### Multi-Device Sync
- Device A edits order, Device B edits same order simultaneously → last write wins + notify both with "Order was updated by [user] on [device]"
- SSE stream: 50 devices connected for one tenant → test load on SSE endpoint
- Owner disconnects → reconnects 2 hours later → replays last 2 hours of events (capped at 500 events max, older events need REST refresh)

---

## 13. QA Checklist

### Onboarding
- [ ] Fresh signup → redirects to /onboarding → wizard loads step 1
- [ ] Complete all 8 steps → all data saved → /pos loads correctly
- [ ] Skip step 4 (menu) → POS still works
- [ ] CSV import: 50 items → all imported with correct categories
- [ ] Incomplete wizard → revisit → resumes from last incomplete step

### Device Registration
- [ ] Register device via QR → device token created → device appears in device list
- [ ] Open /kds on registered KDS device → auto-fullscreen, no login prompt
- [ ] Print Agent: connect → test print → success
- [ ] Deregister device → device immediately gets 401 on next API call
- [ ] "Online devices" panel shows correct connected count

### Role Permissions
- [ ] Drag permission onto CASHIER → CASHIER can perform that action
- [ ] Remove permission from CASHIER → CASHIER gets 403 on that route
- [ ] Reset to defaults → Petpooja-equivalent permissions restored
- [ ] Manager tries to grant permission they don't have → blocked with error
- [ ] OWNER always passes all permission checks

### Multi-Device
- [ ] 3 devices connected → order created on device 1 → devices 2 and 3 update within 1 second
- [ ] Manager PIN modal: enter on any device → logged with correct manager ID
- [ ] Staff switches devices mid-shift → session picked up, no duplicate KOT

### Settings
- [ ] Change service charge → new bills use new rate (old bills unaffected)
- [ ] Update receipt footer → new print has updated footer
- [ ] Change KOT number format → next KOT uses new format

---

## 14. Frontend Pages

| Route | Role | Description |
|-------|------|-------------|
| `/onboarding` | OWNER | 8-step setup wizard |
| `/settings` | MANAGER, OWNER | Settings hub |
| `/settings/restaurant` | MANAGER, OWNER | Restaurant details |
| `/settings/business` | MANAGER, OWNER | Outlet type, hours, GST |
| `/settings/floors` | MANAGER, OWNER | Floor + table editor |
| `/settings/billing` | MANAGER, OWNER | Receipt, bill number, tip |
| `/settings/printers` | MANAGER, OWNER | Printer config + test |
| `/settings/devices` | MANAGER, OWNER | Device management |
| `/settings/roles` | OWNER | Permission drag-drop builder |
| `/settings/team` | MANAGER, OWNER | Staff invite + PIN |
| `/settings/payments` | MANAGER, OWNER | Payment methods |
| `/settings/integrations` | OWNER | Zomato, Swiggy, Razorpay |

---

## 15. Definition of Done

- [ ] Onboarding wizard: all 8 steps save correctly, can resume after exit
- [ ] New tenant completes full onboarding in under 20 minutes (measured)
- [ ] Device registration via QR working
- [ ] KDS dedicated mode: auto-fullscreen, no login, PIN exit
- [ ] Print Agent: USB printer working end-to-end
- [ ] Role permission editor: drag & drop grants/revokes permissions
- [ ] Permissions enforced at API level (not just frontend)
- [ ] All 28 authenticated routes accessible by correct roles
- [ ] All 6 public routes accessible without auth
- [ ] Multi-device sync: 3+ devices connected, order update propagates in under 1 second
- [ ] Offline banner shows when connection drops
- [ ] Draft order persists in localStorage, syncs on reconnect
- [ ] All QA checklist items pass

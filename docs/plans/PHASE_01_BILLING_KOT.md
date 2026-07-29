# Phase 1 — Billing, KOT & Real-Time Operations
**Priority:** 🔴 Critical | **Estimate:** 6 weeks | **Depends on:** Core auth, menu, tables

---

## 0. What This Phase Delivers

A fully operational POS that matches Petpooja feature-for-feature on the billing layer:
- Every order change on any device instantly reflects on every other device
- Waiter takes order → KOT fires to kitchen → cashier sees bill → all in real time
- Complete payment flow with 7 methods, split billing, advance, complimentary
- Thermal printing (58mm/80mm) from any browser tab, zero setup
- Every edge case: item sold out, printer offline, payment fails, table full, partial refund

---

## 1. Real-Time Multi-Device Sync

### 1.1 Architecture

```
Device A (Waiter creates order)
    ↓ POST /api/v1/orders
API Server (creates order, broadcasts event)
    ↓ Server-Sent Events (SSE) or WebSocket
    ├── Manager's desktop     → floor plan updates, new order in list
    ├── Kitchen Display (KDS) → new KOT card appears
    ├── Cashier terminal      → order queue updates
    ├── Other waiter devices  → table status changes to OCCUPIED
    └── Owner's phone         → dashboard counter increments
```

**Technology Choice:**
- **SSE (Primary):** `GET /api/v1/events/stream` — one persistent HTTP connection per device
  - Works through most corporate firewalls, proxies, and load balancers
  - Auto-reconnects natively in browsers
  - No extra dependency — Fastify replies support SSE with chunked transfer
- **WebSocket (Fallback):** If SSE drops > 3 times, client upgrades to WS
- **Polling (Last Resort):** If both fail, degrade to 5-second polling for that device

**Tenant Isolation:** Each SSE/WS connection is scoped to `tenantId` extracted from JWT. Events are never cross-tenant.

### 1.2 Event Schema

Every event has this envelope:
```ts
interface RealtimeEvent {
  id: string            // nanoid for deduplication
  type: EventType
  tenantId: string
  payload: object
  ts: number            // Unix ms — client uses for ordering
}
```

**Event Types:**
```
ORDER_CREATED            { orderId, tableId, orderType, waiterId }
ORDER_UPDATED            { orderId, changes }
ORDER_ITEM_ADDED         { orderId, item }
ORDER_ITEM_REMOVED       { orderId, itemId }
ORDER_ITEM_QTY_CHANGED   { orderId, itemId, newQty }
ORDER_STATUS_CHANGED     { orderId, from, to, by }
ORDER_CANCELLED          { orderId, reason, by }
KOT_CREATED              { kotId, orderId, tableId, items }
KOT_STATUS_CHANGED       { kotId, from, to, by }
KOT_ITEM_STATUS_CHANGED  { kotId, itemId, from, to }
TABLE_STATUS_CHANGED     { tableId, from, to }
BILL_CREATED             { billId, orderId, amount }
BILL_PAID                { billId, method, amount }
BILL_VOIDED              { billId, reason, by }
ITEM_AVAILABILITY_CHANGED { menuItemId, isAvailable, platform }
RESERVATION_CREATED      { reservationId, tableId, time }
RESERVATION_STATUS_CHANGED { reservationId, from, to }
PRINT_JOB_CREATED        { jobId, type, printerId, data }
DAY_CLOSED               { closedAt, by, summary }
```

### 1.3 Client-Side Handling

```ts
// useRealtimeEvents.ts (singleton, mounted in root layout)
const eventSource = new EventSource('/api/v1/events/stream', {
  withCredentials: true  // sends atlas_auth cookie
})

eventSource.onmessage = (e) => {
  const event = JSON.parse(e.data)

  switch (event.type) {
    case 'ORDER_CREATED':
    case 'ORDER_UPDATED':
    case 'ORDER_ITEM_ADDED':
      queryClient.invalidateQueries(['orders'])
      queryClient.invalidateQueries(['order', event.payload.orderId])
      queryClient.invalidateQueries(['tables'])
      break
    case 'KOT_STATUS_CHANGED':
      queryClient.invalidateQueries(['kots', event.payload.kotId])
      break
    case 'TABLE_STATUS_CHANGED':
      queryClient.invalidateQueries(['tables'])
      break
    case 'BILL_PAID':
      queryClient.invalidateQueries(['bills'])
      queryClient.invalidateQueries(['orders'])
      break
    case 'ITEM_AVAILABILITY_CHANGED':
      queryClient.invalidateQueries(['menu'])
      break
    case 'PRINT_JOB_CREATED':
      handlePrintJob(event.payload) // triggers local print agent
      break
  }
}
```

**Deduplication:** Client tracks `Set<eventId>` of last 100 events. Drops duplicates (happens on reconnect).

**Optimistic UI:** Mutations update local state immediately; SSE event confirms or reverts.

---

## 2. Order Types & States

### 2.1 Order Types
| Type | Trigger | Flow |
|------|---------|------|
| DINE_IN | Waiter selects table | Table → Order → KOT → Bill → Pay |
| TAKEAWAY | Counter staff | Quick order → KOT → Bill → Pay |
| DELIVERY | Aggregator webhook or manual | Order → KOT → Pack → Dispatch → Deliver |
| QR_ORDER | Customer scans QR at table | Self-order → Pending Approval → KOT |

### 2.2 Order Status State Machine

```
DRAFT ──────────────── [waiter building order, not sent yet]
  │
  ↓ (send to kitchen)
CONFIRMED ──────────── [KOT fired, kitchen has it]
  │
  ↓ (chef starts)
IN_PROGRESS ────────── [items being prepared]
  │
  ├──→ PARTIALLY_READY  [some courses/items done]
  │
  ↓ (all items done)
READY ──────────────── [food ready, waiting to serve]
  │
  ↓ (waiter serves)
SERVED ─────────────── [food at table]
  │
  ↓ (cashier creates bill)
BILLED ─────────────── [bill generated, awaiting payment]
  │
  ↓ (payment recorded)
PAID ────────────────── [closed]

From any state:
  ──→ CANCELLED         [order cancelled before payment]
  ──→ VOIDED            [order paid but later voided by manager]
```

**Delivery/Takeaway extras:**
```
CONFIRMED → PREPARING → READY → [PACKED] → DISPATCHED → DELIVERED
                                              ↑
                                        (delivery only)
```

### 2.3 KOT Status State Machine

Each KOT (Kitchen Order Ticket) has its own lifecycle:

```
PENDING ──→ IN_PROGRESS ──→ DONE ──→ [cancelled if order cancelled]
   │
   └──→ ON_HOLD  [chef paused — "fire on my signal"]
         └──→ IN_PROGRESS [fired by captain]
```

**KOT Priority:**
- `NORMAL` — default
- `HIGH` — waiter marks urgent
- `URGENT` — fires red alert on KDS with sound

### 2.4 Individual KOT Item Status

Each item on a KOT tracks independently:
```
PENDING → PREPARING → DONE → SERVED
                  ↓
               CANCELLED  [item 86'd, not available]
```

Kitchen can mark each item independently → partial serve tracking.

---

## 3. Table Booking — Complete Options

### 3.1 Walk-In Flow

1. Waiter/Cashier opens floor plan
2. Selects available table (green dot)
3. Enters: cover count (number of guests)
4. Optional: assign to waiter
5. Table turns OCCUPIED → order starts in DRAFT

**Cover Options on table select:**
- Adults: numeric input
- Children: numeric input (for child-specific menu pricing)
- "Quick seat" — skip cover entry for fast turnover

### 3.2 Reservation System

**Reservation Card (captures):**
```
Guest Name          [required]
Phone Number        [required — for WhatsApp confirmation]
Date                [date picker]
Time                [time picker — 15-min intervals]
Covers              [adults + children]
Table Preference    [specific table OR "any" OR "outdoor" / "window"]
Occasion            [Birthday / Anniversary / Business / None]
Special Requests    [free text — "gluten free", "birthday cake", "wheelchair"]
Deposit Amount      [₹ amount, if applicable]
Status              [PENDING / CONFIRMED / ARRIVED / NO_SHOW / CANCELLED]
```

**Reservation Timeline View (Frontend):**
- Day view: time slots on X-axis, tables on Y-axis
- Color blocks: upcoming, confirmed, arrived
- Drag reservation block to change time or table
- Click to see details or edit

**Reservation State Machine:**
```
PENDING ──→ CONFIRMED ──→ ARRIVED ──→ [creates order] ──→ order flow
    │           │
    └──→ NO_SHOW    └──→ CANCELLED
```

- Auto-mark NO_SHOW if reservation time + 15 min passes with no ARRIVED
- Send WhatsApp reminder 2 hours before reservation (if enabled)

**Reservation Conflict Rules:**
- Cannot book same table for overlapping times (configurable buffer: 30 min between reservations)
- Alert if covers > table capacity
- "Waitlist" mode if all tables booked — captures name+phone, notifies when a table opens

### 3.3 Table Features & Properties

Each table in the system has:
```prisma
model Table {
  id          String
  tenantId    String
  floorId     String
  name        String        // "T-01", "Cabin 3"
  capacity    Int
  shape       TableShape    // CIRCLE | SQUARE | RECTANGLE | OVAL
  posX        Float         // floor plan position
  posY        Float
  width       Float
  height      Float
  status      TableStatus   // AVAILABLE | OCCUPIED | RESERVED | CLEANING | BLOCKED
  section     String?       // "Outdoor", "AC", "Bar"
  isActive    Boolean
}
```

**Table Status Display on Floor Plan:**
- GREEN — AVAILABLE (clickable to seat)
- RED — OCCUPIED (shows covers, waiter name, time elapsed, bill amount)
- YELLOW — RESERVED (shows next reservation name + time)
- BLUE — CLEANING (dirty, being cleaned post-checkout)
- GREY — BLOCKED (unavailable: maintenance, event)

**Table Card on Floor Plan shows:**
- Table number
- Current waiter (avatar)
- Number of covers
- Time since seated (timer in HH:MM)
- Running bill amount
- Number of pending KOTs

**Table Merge:**
- Select table A → "Merge" → select table B
- All items from A's order move to A (B becomes OCCUPIED but linked)
- Bill generated for merged total
- On payment: both tables → AVAILABLE
- DB: `Order.mergedTableIds: String[]`

**Table Transfer:**
- Select table A (source) → "Transfer" → select table B (destination)
- Conditions: B must be AVAILABLE or able to accommodate extra covers
- All order items, KOTs, bill state transfer to B
- A → AVAILABLE, B → OCCUPIED
- SSE events fire for both tables

**Table Split:**
- Divide one table's order across two tables
- Drag items from order to "Table B items" column
- Generates two separate bills

---

## 4. Item Selection System

### 4.1 Menu Item Properties

```prisma
model MenuItem {
  id              String
  tenantId        String
  categoryId      String
  name            String
  description     String?
  priceInPaise    Int
  foodType        FoodType        // VEG | NON_VEG | EGG | VEGAN
  isAvailable     Boolean
  sortOrder       Int
  preparationTime Int?            // minutes
  calories        Int?
  variants        MenuVariant[]   // size variants (Small/Medium/Large)
  addOnGroups     AddOnGroup[]    // optional extras
  modifierGroups  ModifierGroup[] // required choices (spice level)
  image           String?
  tags            String[]        // "bestseller", "spicy", "new"
  taxRateId       String?         // specific tax slab
}
```

### 4.2 Variants (Size/Portion)

Variants represent the same item in different sizes/prices:
```prisma
model MenuVariant {
  id           String
  menuItemId   String
  name         String        // "Half", "Full", "Small", "Medium", "Large"
  priceInPaise Int
  isDefault    Boolean       // which one pre-selects
  sortOrder    Int
}
```

**Example — Paneer Butter Masala:**
- Half — ₹180
- Full — ₹300 (default)

**UI flow:** Item tapped → if variants exist → variant sheet pops up → user selects → auto-proceeds to add-ons

### 4.3 Add-On Groups (Optional Extras)

Customer can choose from multiple groups of extras:
```prisma
model AddOnGroup {
  id         String
  menuItemId String
  name       String         // "Extra Toppings", "Sauces", "Sides"
  minSelect  Int            // 0 = optional
  maxSelect  Int            // -1 = unlimited
  addOns     AddOn[]
}

model AddOn {
  id              String
  addOnGroupId    String
  name            String    // "Extra Cheese", "Jalapenos"
  priceInPaise    Int
  isAvailable     Boolean
}
```

**Examples:**
- "Extras" group: min 0, max 3 — Cheese (+₹30), Jalapeños (+₹20), Olives (+₹25)
- "Sauces" group: min 0, max 2 — BBQ, Ranch, Ketchup (free)

### 4.4 Modifier Groups (Required Choices)

One selection required from a list — no extra price:
```prisma
model ModifierGroup {
  id         String
  menuItemId String
  name       String         // "Spice Level", "Cooking Style", "Ice"
  isRequired Boolean        // must choose before adding
  modifiers  Modifier[]
}

model Modifier {
  id              String
  modifierGroupId String
  name            String    // "Mild", "Medium", "Hot", "Extra Hot"
  priceInPaise    Int       @default(0)
  isDefault       Boolean
}
```

### 4.5 Order Item Schema

When a customer orders an item with choices made:
```prisma
model OrderItem {
  id               String
  orderId          String
  menuItemId       String
  variantId        String?           // null = base item
  qty              Int
  unitPriceInPaise Int              // price at time of order (not current price)
  selectedAddOns   OrderItemAddOn[]
  selectedModifiers OrderItemModifier[]
  notes            String?           // "no onion", "well done"
  course           Course            // STARTER | MAIN | DESSERT | BEVERAGE
  status           OrderItemStatus   // PENDING | PREPARING | DONE | SERVED | CANCELLED
  kotId            String?
  isVoided         Boolean
  voidReason       String?
  voidedBy         String?
}
```

### 4.6 Item Selection UX Flow

```
1. Category sidebar (left)    → tap category
2. Item grid (center)         → items with name, price, veg/non-veg dot, photo
3. Item tapped:
   a. Has variants?           → Variant bottom sheet opens
   b. Variant selected        → Add-on sheet (if exists)
   c. Add-ons selected        → Modifier sheet (if required)
   d. Modifiers done          → Item added to order with all selections
   e. Notes? Optional field   → "Special instructions"
4. Item added to order panel (right side)
5. Quantity adjust: + / - buttons on order panel
6. Long-press order item      → edit selections or add note
```

**Search:** Search bar in menu header — searches by name, tag, description. Fuzzy match.

**Filter bar:**
- Veg only toggle
- Bestsellers filter
- Category chips (quick jump)

---

## 5. KOT System — Complete

### 5.1 KOT Generation

**When KOT fires:**
- Waiter taps "Send to Kitchen" on order
- System groups items by `kotPrinter` (each item's category can route to different printer)
- Example: beverages → Bar Printer; food → Kitchen Printer; desserts → Bakery Printer

**KOT Routing:**
```prisma
model MenuCategory {
  kotPrinterId  String?    // which printer gets this category's KOT
}

model KotPrinter {
  id           String
  tenantId     String
  name         String      // "Main Kitchen", "Bar", "Bakery"
  printerId    String      // FK to Printer config
  isActive     Boolean
}
```

**KOT Document:**
```
================================
       KITCHEN ORDER TICKET
================================
Table: T-07         Covers: 4
Waiter: Ravi        #KOT-0847
Time: 14:32         [URGENT]
================================
1x Chicken Tikka
   - Extra Spicy [MODIFIER]
   - Extra Raita (+30) [ADD-ON]
   Notes: No onion
--------------------------------
2x Paneer Butter Masala (Full)
   Notes: Extra gravy
--------------------------------
1x Garlic Naan
================================
Course: STARTER first, then MAIN
================================
```

### 5.2 KOT Events on KDS (Kitchen Display System)

The `/kds` page (CHEF role):
- Card per KOT with color-coded priority (Green/Yellow/Red)
- Countdown timer (target prep time from item `preparationTime`)
- Per-item status toggle: PENDING → PREPARING → DONE
- "Mark All Done" button
- When all items DONE → KOT moves to "Ready" column
- Captain/waiter notified via SSE to serve

### 5.3 Repeat KOT / Additional Items

When waiter adds more items to an existing OCCUPIED table:
- New items create a new KOT (KOT-0848)
- Previous KOT-0847 unaffected
- Bill accumulates all KOTs

**Hold KOT (Course Management):**
- Captain can mark some items as "Fire Later (Course 2)"
- KOT-0847 has Course 1 items (Starter) → fires immediately
- KOT-0847b has Course 2 (Mains) → held, fires when captain taps "Fire Main Course"
- SSE: `KOT_STATUS_CHANGED { kotId, from: ON_HOLD, to: IN_PROGRESS }`

### 5.4 KOT Cancellation / Item Void

**Item void flow (existing KOT, item made):**
1. Waiter requests void (reason required)
2. Manager PIN or approval
3. Item marked VOIDED on KOT (kitchen notes waste)
4. Bill recalculated

**Item 86 (ran out mid-service):**
1. Chef marks item as UNAVAILABLE on KDS
2. SSE `ITEM_AVAILABILITY_CHANGED` broadcasts to all devices
3. Waiter devices: item turns grey in menu with "Sold Out"
4. Chef has option: "Available again in __ minutes" → auto-restore timer

---

## 6. Billing System — Complete

### 6.1 Bill Types

| Type | Description |
|------|-------------|
| REGULAR | Standard dine-in or takeaway bill |
| SPLIT | Bill divided among multiple payers |
| MERGED | Combined bill for merged tables |
| ADVANCE | Partial payment, balance later |
| COMPLIMENTARY | Zero-pay bill (staff meal, owner guest) |
| PROFORMA | Pre-bill sent to table for review (not tax invoice yet) |

### 6.2 Bill Composition

```
Subtotal         = sum of all OrderItems (qty x unitPrice)
Item Discounts   = item-level discounts (manager applied per item)
Coupon Discount  = coupon applied to order
Subtotal After Discount
Service Charge   = configurable % (default 10%)
CGST             = based on item's tax rate (dine-in: 5% / 18%)
SGST             = same as CGST
IGST             = if inter-state (rare for restaurants)
Round Off        = +/- 0.50 to make total a round number
Total
Tip              = optional, cashier enters, not taxed
Grand Total      = Total + Tip
```

**GST Slab rules (auto-applied):**
- Bill total < 7,500 → 5% GST (2.5% CGST + 2.5% SGST)
- Bill total >= 7,500 → 18% GST (9% CGST + 9% SGST)
- Individual item can override with a custom tax rate

### 6.3 Split Bill

**Split by equal shares:**
- 4 guests → total / 4
- Each guest pays independently with their own method

**Split by item:**
- Drag items from "shared pool" to Person A / Person B panels
- Shared items (e.g. 2 starters eaten together) → split proportionally
- Each person's total shown; each pays separately

**Split by custom amount:**
- Person A pays 1,000, Person B pays 850
- System tracks running total vs bill total
- Error if amounts do not add up to grand total

**Split Bill UX:**
- Bottom sheet shows "Number of ways to split" selector
- OR "Split by items" drag interface
- Each split generates a sub-bill (printed if needed)
- All splits paid → parent order marked PAID

### 6.4 Merge Bill

When two tables are merged, bills merge:
- All items from Table A and Table B in one bill
- One payment closes both tables
- Both tables → AVAILABLE after payment

### 6.5 Hold Bill / Recall

- "Put on Hold" — saves draft bill state, releases cashier screen
- Table shows "BILLED (On Hold)" status
- Cashier recalls from "On Hold" list
- Useful when customer says "I'll pay in 10 minutes"

### 6.6 Bill Void (Post-Payment)

- Can only be done by OWNER or MANAGER
- Requires reason (mandatory)
- Creates a VOID record (for audit)
- Does NOT delete from DB — marks `Bill.voided = true`
- Generates reverse credit entry
- Original bill number preserved in reports

### 6.7 Day-End Close

```
Day Close process:
1. MANAGER/OWNER initiates DayClose
2. System validates: no open bills, no pending KOTs
   - If open bills exist → warning, can force-close with reason
3. System snapshot:
   - Total orders: X
   - Total revenue: Y
   - Per-payment-method breakdown
   - Cash in drawer: expected X, actual Y (manual entry)
   - Discrepancy logged
4. DayClose record created (immutable)
5. Next day: fresh counters
```

---

## 7. Payment System — All Methods

### 7.1 Cash

```
Cashier enters amount tendered
System calculates change:  Change = Tendered - Grand Total
Displays on screen: "Return 73 change"
Edge cases:
  - Tendered < Grand Total → error "Amount short by X"
  - Tendered exact → no change display
  - Large denomination noted (2000 note)
```

### 7.2 UPI

```
Cashier selects UPI → QR code displays (tenant's UPI VPA)
Customer scans with any UPI app (GPay, PhonePe, Paytm, BHIM)
Two modes:
  a. Static QR → customer manually enters amount → cashier confirms manually
  b. Dynamic QR (Razorpay/Cashfree) → QR encodes exact amount → webhook auto-confirms
     → SSE event BILL_PAID fires → bill auto-closes
Timeout: 5 minutes → QR expires → new QR generated
Edge case: UPI payment pending → cashier can manually confirm with UTR number
```

### 7.3 Card

```
Cashier selects Card
Options:
  a. Manual card (standalone POS terminal)
     → Cashier enters approval code after card swipe
     → Records: card type (Visa/MC/Amex/Rupay), last 4 digits, approval code
  b. Integrated card (Pine Labs / Razorpay terminal via API)
     → Payment request sent to terminal → customer taps/swipes/dips
     → Terminal returns success/fail → Atlas auto-records
Card types: Credit, Debit, Contactless
Edge cases:
  - Card declined → cashier switches to another method
  - Terminal offline → manual entry fallback
```

### 7.4 Wallet (Customer Wallet)

```
Customer has pre-loaded wallet in Atlas CRM (Phase 4)
Cashier searches customer by phone
Wallet balance shown
"Apply X from wallet" → deducted
If wallet < grand total → wallet partially applied → collect balance via other method
```

### 7.5 Loyalty Points

```
Linked to CRM (Phase 4), hook in Phase 1:
Customer burns points: 1 point = 1 rupee (configurable)
Applied as discount before tax recalculation:
  "Redeem 200 points → 200 off"
  Tax recalculated on discounted subtotal
Max redemption cap: configurable % of bill
```

### 7.6 Credit (House Account)

```
Customer billed to house account — pays later
Requires MANAGER approval
Customer record shows outstanding amount
Common for: corporate accounts, regular high-value customers
DB: PaymentRecord.method = CREDIT, linked to customerId
```

### 7.7 Complimentary

```
Bill written off — no actual payment
Requires OWNER/MANAGER approval
Reason mandatory: "Staff meal", "Guest of owner", "Complaint resolution"
Reports: shows as COMP in sales report, separate line
DB: PaymentRecord.method = COMPLIMENTARY, approvedBy required
```

### 7.8 Split Payment (Multiple Methods on One Bill)

A 1,500 bill can be paid: 500 cash + 500 UPI + 500 card (perfectly valid)

```
UI: Bill summary → "Add Payment Method"
    → Add: UPI 800 confirmed
    → Remaining: 700
    → Add: Cash 700 confirmed
    → Remaining: 0
    → "Complete Payment" enabled
```

**Rules:**
- Each part requires amount entry
- Sum must equal grand total exactly
- Tip only added once
- Each payment part recorded as `PaymentRecord` with its own method

### 7.9 Advance Payment

```
Customer pays partial now, balance on arrival/order completion
DB: Bill.advancePaid = 500
    Bill.status = ADVANCE_PAID
    Bill.balanceDue = grandTotal - advancePaid

On final payment:
  Shows: Grand Total 2,000
         Less: Advance Paid -500
         Balance Due: 1,500
  Cashier collects 1,500 via any method
```

---

## 8. Printer Integration

### 8.1 Printer Types Supported

| Type | Connection | Setup |
|------|-----------|-------|
| USB Thermal Printer | USB to POS device | Local Print Agent required |
| LAN Thermal Printer | Network IP | Direct HTTP POST to printer IP |
| Bluetooth Thermal | Bluetooth | Local Print Agent required |
| Cloud Printer | Internet | Printnode API |
| Regular Printer (A4) | USB/Network | Browser window.print() |

### 8.2 Paper Sizes & Character Width

```
58mm paper (POS-58):
  - Characters per line: 32 (standard font)
  - Compact, common in small cafes
  - Max item name: ~20 chars (price right-aligned)

80mm paper (POS-80):
  - Characters per line: 48 (standard font)
  - Standard restaurant size
  - Item name: 28 chars, price: 8 chars, qty: 4 chars, total: 8 chars

A4 bill (full invoice):
  - Standard paper, full GST invoice
  - Logo, address, GSTIN, item table, tax breakdown
  - For B2B customers needing formal invoice
```

### 8.3 Print Architecture

**Browser limitation:** Web apps cannot send raw ESC/POS bytes to USB printer without a local agent.

**Three approaches Atlas supports:**

**A. Local Print Agent (Recommended for USB/Bluetooth):**
```
Atlas Web App
    │ SSE event: PRINT_JOB_CREATED
    ↓
Print Agent (small Node.js process on POS device)
    │ Receives job via WebSocket to Atlas API
    ↓
Thermal Printer (USB/Bluetooth)
```

The Print Agent (`apps/print-agent`):
- Lightweight Node.js/Electron app
- Runs on Windows/Mac/Linux/Raspberry Pi
- Connects to Atlas via WS with device token
- Listens for `PRINT_JOB_CREATED` events for its `printerId`
- Formats ESC/POS bytes, sends to printer
- Reports: `PRINT_JOB_SUCCESS` or `PRINT_JOB_FAILED` back to Atlas

**B. Network Printer (Recommended for LAN):**
```
Atlas API
    │ HTTP POST to http://192.168.1.50:9100/
    ↓
Network Thermal Printer (Star TSP, Epson TM-T82 with LAN port)
```

- Atlas server sends raw bytes directly to printer's HTTP endpoint
- No local agent needed
- Printer must be on same network or accessible via VPN

**C. Browser Print (Bills only):**
```
Atlas Web App → window.print() with @media print styles → any connected printer
```

For KOT auto-printing, this requires print dialog confirmation — not ideal. Use A or B for KOT.

### 8.4 Print Document Types

**KOT (Kitchen Order Ticket):**
```
================================
    [TENANT NAME] - KITCHEN
================================
Table: T-07         KOT#: 0847
Waiter: Ravi     14:32:05
Covers: 4        [URGENT]
================================
 1  Chicken Tikka
    [Extra Spicy][No Onion]
 2  Paneer Butter Masala (Full)
    [Extra Gravy]
    Notes: Less oil
 1  Garlic Naan x3
================================
COURSE: STARTER -> MAIN
================================
```

**Bill / Receipt:**
```
================================
     [RESTAURANT NAME]
  [Address] | GSTIN: 24XXXXX
================================
Bill No: B-2024-0234
Date: 28/07/2026  14:45:22
Table: T-07       Covers: 4
Cashier: Priya
================================
Chicken Tikka         1   320
Paneer BM (Full)      2   600
Garlic Naan           3   210
================================
Subtotal                 1130
Service Charge 10%        113
CGST 2.5%                  31
SGST 2.5%                  31
--------------------------------
TOTAL                    1305
--------------------------------
Paid: UPI      1000
      Cash      305
================================
Thank you, visit again!
================================
```

**Pre-Bill (at table, not tax invoice):**
- Same format but header says "BILL ESTIMATE - NOT TAX INVOICE"
- Footer: "Final bill at counter"

### 8.5 Printer Configuration DB

```prisma
model Printer {
  id          String
  tenantId    String
  name        String          // "Main Kitchen Printer", "Bar Printer"
  type        PrinterType     // NETWORK | USB | BLUETOOTH | CLOUD
  paperSize   PaperSize       // SIZE_58MM | SIZE_80MM | A4
  connection  Json            // { ip, port } or { deviceId } or { printNodeKey }
  charPerLine Int             // 32 or 48
  isDefault   Boolean
  printTypes  PrintType[]     // KOT | BILL | REPORT | ALL
  isActive    Boolean
}

enum PrinterType { NETWORK USB BLUETOOTH CLOUD BROWSER }
enum PaperSize   { SIZE_58MM SIZE_80MM A4 }
enum PrintType   { KOT BILL PRE_BILL REPORT LABEL }
```

### 8.6 Print Queue & Retry

```prisma
model PrintJob {
  id          String
  tenantId    String
  printerId   String
  type        PrintType
  payload     Json          // raw print content
  status      PrintJobStatus // QUEUED | SENT | SUCCESS | FAILED | RETRYING
  attempts    Int           @default(0)
  maxAttempts Int           @default(3)
  error       String?
  createdAt   DateTime
  printedAt   DateTime?
}
```

- On failure: retry up to 3 times with exponential backoff
- After 3 failures: SSE `PRINT_JOB_FAILED` → UI shows red toast "KOT print failed — Printer offline"
- Manual reprint button on KOT card

### 8.7 Auto-Print Configuration (Per Tenant)

```
Auto print KOT on send:     ON/OFF (default ON)
Auto print Bill on payment: ON/OFF (default ON)
Pre-bill on request only:   always manual
KOT reprint allowed by:     WAITER / MANAGER_ONLY
Bill reprint:               MANAGER_ONLY
```

---

## 9. Item Availability (Per Item, Per Platform)

### 9.1 Quick Toggle

On menu management page AND on KDS:
- Each item has a toggle: Available / Sold Out
- Can apply to: ALL platforms, or specific (Zomato / Swiggy / POS / QR)

### 9.2 Availability with Timer

```
Mark item unavailable → "Auto-restore in:" dropdown
  Options: 1 hour | 2 hours | End of day | Until manually changed
If timer set:
  - DB: availability.until = future timestamp
  - Background job checks hourly, auto-restores
  - SSE event fires when restored
```

### 9.3 Availability States on Menu Grid

```
Available        → Normal display
Sold Out (Today) → Grey with red "Sold Out" badge
Unavailable      → Grey, cross-through text
Seasonal         → Grey with "Seasonal" badge
Coming Soon      → Lighter grey with "Coming Soon"
```

### 9.4 Chef 86 (Mid-Service Unavailability)

When chef marks item unavailable from KDS:
1. `ITEM_AVAILABILITY_CHANGED` event broadcasts
2. On waiter devices: item turns grey in menu immediately
3. If waiter already has item in a DRAFT order: yellow warning "Item just went unavailable"
4. On floor plan: tables with that item in PENDING KOT: warning badge
5. Manager notified in notification panel

### 9.5 Schema

```prisma
model MenuItemAvailability {
  id          String
  tenantId    String
  menuItemId  String
  platform    String      // ALL | POS | ZOMATO | SWIGGY | MAGICPIN | QR
  isAvailable Boolean
  reason      String?
  until       DateTime?   // auto-restore time
  markedBy    String
  updatedAt   DateTime
  @@unique([tenantId, menuItemId, platform])
}
```

---

## 10. Parcel / Delivery Order Tracking

### 10.1 All Parcel Statuses

```
PENDING          → Order received, awaiting acceptance
ACCEPTED         → Restaurant accepted, preparing
PREPARING        → In kitchen
READY            → Packed and ready
DISPATCHED       → Rider picked up (for own delivery)
DELIVERED        → Customer received
CANCELLED        → Cancelled before preparation
REJECTED         → Restaurant rejected order
FAILED_DELIVERY  → Delivery attempt failed
RETURNED         → Order returned to restaurant
```

### 10.2 Delivery Order Card

Each delivery order card shows:
```
[Source: ZOMATO]  Order #ZOM-4891
Customer: Rahul S    485
Items: 3 items       12 min ago
Status: PREPARING [40%]
Action: [Mark Ready] [Cancel]
Delivery: By Zomato rider (ETA: 25 min)
```

**Timeline view on order detail:**
```
2:30 PM  Order Received
2:31 PM  Accepted by Manager
2:32 PM  KOT Sent to Kitchen
2:45 PM  [Expected Ready]
---      Dispatched
---      Delivered
```

### 10.3 Rejection Flow

```
Order arrives → PENDING
Manager opens order card
"Reject" button → Reason required:
  - Item unavailable
  - Restaurant busy
  - Closing soon
  - Technical issue
  - Other [free text]
Rejection reason sent to platform API (Zomato/Swiggy API call)
Order marked REJECTED in Atlas
Platform notifies customer
```

### 10.4 Own Delivery Tracking

For restaurants with their own riders (not Zomato/Swiggy):
```prisma
model DeliveryRider {
  id         String
  tenantId   String
  name       String
  phone      String
  isActive   Boolean
  isOnDuty   Boolean
}

model OrderDelivery {
  id          String
  orderId     String
  riderId     String?
  status      DeliveryStatus
  otp         String          // customer gives OTP on delivery
  assignedAt  DateTime?
  pickedUpAt  DateTime?
  deliveredAt DateTime?
}
```

---

## 11. Drag & Drop UX

### 11.1 Floor Plan

**Table positioning (settings):**
- Tables draggable in edit mode
- Resize by corner handle
- Snap to grid (configurable grid size)
- Layer: Walls, pillars as non-draggable decorations
- Save layout → persists posX, posY, width, height

**Technology:** `@dnd-kit/core` + `@dnd-kit/sortable`

### 11.2 Menu Category Ordering

- Menu categories sortable by drag in menu settings
- Items within category sortable
- Changes reflect immediately in order-taking UI (sortOrder field)

### 11.3 KDS Queue Prioritization

- On Kitchen Display: drag KOT cards to reorder queue
- URGENT cards always stay at top (cannot be dragged below normal)
- Chef reorders normal cards by prep preference

### 11.4 Split Bill Drag

- Bill split modal: draggable item cards
- Drag item from "Shared" column to "Person A" or "Person B" column
- Framer Motion drag + drop with visual feedback

### 11.5 UX Micro-Interactions

**Order panel:**
- Item added: slide-in from right + green flash
- Item removed: fade-out + slide-up
- Quantity changed: number flip animation
- Total updated: count-up animation

**Table status changes:**
- AVAILABLE → OCCUPIED: smooth color fill animation
- Table hover: gentle scale-up + info tooltip

**KOT card updates:**
- New KOT: slide-in from top in KDS
- KOT done: slide-out right + green checkmark
- URGENT KOT: pulsing red border

**Notifications:**
- Toast: slide-in from top-right
- Error toasts: red with shake animation
- Success: green + checkmark

---

## 12. Integrations in Phase 1

| Integration | Purpose | Depth |
|------------|---------|-------|
| Thermal Printer (ESC/POS) | KOT + Bill print | Full: USB, LAN, Cloud |
| Razorpay | UPI dynamic QR + Card terminal | QR webhook, terminal API |
| Pine Labs Terminal | Card payment terminal | EDC API integration |
| Zomato/Swiggy Webhooks | Delivery orders | Enhanced (existing) |
| WhatsApp (MSG91) | Bill on WhatsApp | POST-payment send |
| SMS Gateway (MSG91) | Reservation confirmation | OTP + confirmations |
| Printnode | Cloud printing | Optional add-on |

---

## 13. Complete DB Schema Additions

```prisma
// Real-time events store (for replay/debug)
model RealtimeEvent {
  id         String   @id @default(cuid())
  tenantId   String
  type       String
  payload    Json
  createdAt  DateTime @default(now())
  @@index([tenantId, createdAt])
}

// Enhanced Order
model Order {
  // existing fields +
  orderType       OrderType        // DINE_IN | TAKEAWAY | DELIVERY | QR_ORDER
  source          OrderSource      // POS | ZOMATO | SWIGGY | MAGICPIN | QR | PHONE
  covers          Int              @default(1)
  kidsCovers      Int              @default(0)
  waiterId        String?
  mergedTableIds  String[]
  advancePaid     Int              @default(0)
  courseState     CourseState      @default(ALL_TOGETHER)
  currentCourse   Course?
  estimatedTime   Int?             // minutes (for delivery)
  customerName    String?
  customerPhone   String?
  deliveryAddress Json?
  platformOrderId String?
  platformOrderNo String?
}

// Reservation
model Reservation {
  id              String            @id @default(cuid())
  tenantId        String
  tableId         String?
  guestName       String
  phone           String
  date            String            // YYYY-MM-DD
  time            String            // HH:MM
  covers          Int
  kidsCovers      Int               @default(0)
  tablePreference String?
  occasion        String?
  specialRequests String?
  depositInPaise  Int               @default(0)
  status          ReservationStatus @default(PENDING)
  confirmedBy     String?
  orderId         String?
  createdAt       DateTime          @default(now())
  @@index([tenantId, date])
}

enum ReservationStatus { PENDING CONFIRMED ARRIVED NO_SHOW CANCELLED }

// Enhanced KOT
model KOT {
  // existing fields +
  priority    KOTPriority   @default(NORMAL)
  course      Course?
  heldUntil   DateTime?
  kotNumber   String        // human-readable KOT-0847
  printerId   String?
  printedAt   DateTime?
  printJobId  String?
}

enum KOTPriority { NORMAL HIGH URGENT }

// Printer
model Printer {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  type        PrinterType
  paperSize   PaperSize
  connection  Json
  charPerLine Int      @default(48)
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  @@index([tenantId])
}

// PrintJob
model PrintJob {
  id          String         @id @default(cuid())
  tenantId    String
  printerId   String
  type        PrintType
  payload     Json
  status      PrintJobStatus @default(QUEUED)
  attempts    Int            @default(0)
  error       String?
  createdAt   DateTime       @default(now())
  printedAt   DateTime?
  @@index([tenantId, status])
}

enum PrinterType    { NETWORK USB BLUETOOTH CLOUD BROWSER }
enum PaperSize      { SIZE_58MM SIZE_80MM A4 }
enum PrintType      { KOT BILL PRE_BILL REPORT LABEL }
enum PrintJobStatus { QUEUED SENT SUCCESS FAILED RETRYING }

// Enhanced Bill
model Bill {
  // existing fields +
  billType       BillType  @default(REGULAR)
  serviceCharge  Int       @default(0)
  roundOff       Int       @default(0)
  tipInPaise     Int       @default(0)
  voidedAt       DateTime?
  voidedBy       String?
  voidReason     String?
  printedAt      DateTime?
  whatsappSentAt DateTime?
}

enum BillType { REGULAR SPLIT MERGED ADVANCE COMPLIMENTARY PROFORMA }

// DayClose
model DayClose {
  id               String   @id @default(cuid())
  tenantId         String
  date             String   // YYYY-MM-DD
  closedAt         DateTime
  closedBy         String
  totalOrders      Int
  totalRevenue     Int      // paise
  cashExpected     Int
  cashActual       Int
  cashVariance     Int
  paymentBreakdown Json     // { CASH: Int, UPI: Int, ... }
  notes            String?
  @@unique([tenantId, date])
}
```

---

## 14. API Routes — Complete

### Orders
```
POST   /api/v1/orders                        — create order (WAITER+)
GET    /api/v1/orders                        — list orders (CASHIER+)
GET    /api/v1/orders/:id                    — order detail
PATCH  /api/v1/orders/:id                    — update order
POST   /api/v1/orders/:id/items              — add item to order
PATCH  /api/v1/orders/:id/items/:itemId      — update qty / note
DELETE /api/v1/orders/:id/items/:itemId      — remove item [CASHIER+]
POST   /api/v1/orders/:id/send-to-kitchen    — fire KOT
POST   /api/v1/orders/:id/cancel             — cancel [CASHIER+]
POST   /api/v1/orders/:id/serve              — mark served
POST   /api/v1/orders/:id/transfer           — transfer to another table
POST   /api/v1/orders/:id/merge              — merge with another order
POST   /api/v1/orders/:id/split              — split into two orders
POST   /api/v1/orders/:id/fire-course        — fire held course
```

### KOT
```
GET    /api/v1/kots                          — list KOTs (with filters)
GET    /api/v1/kots/:id                      — KOT detail
PATCH  /api/v1/kots/:id/status               — update KOT status [CHEF+]
PATCH  /api/v1/kots/:id/items/:itemId/status — update item status
POST   /api/v1/kots/:id/print                — reprint KOT
POST   /api/v1/kots/:id/hold                 — hold KOT (course management)
POST   /api/v1/kots/:id/fire                 — fire held KOT
PATCH  /api/v1/kots/:id/priority             — change priority [MANAGER+]
```

### Billing
```
POST   /api/v1/bills                         — create bill [CASHIER+]
GET    /api/v1/bills                         — list bills
GET    /api/v1/bills/:id                     — bill detail
POST   /api/v1/bills/:id/payments            — record payment [CASHIER+]
POST   /api/v1/bills/:id/split               — split bill
POST   /api/v1/bills/:id/void                — void bill [MANAGER+]
POST   /api/v1/bills/:id/print               — print bill
POST   /api/v1/bills/:id/whatsapp            — send to WhatsApp
GET    /api/v1/bills/:id/pre-bill            — get pre-bill (proforma)
```

### Reservations
```
GET    /api/v1/reservations                  — list (filter: date, status)
POST   /api/v1/reservations                  — create
PATCH  /api/v1/reservations/:id              — update
POST   /api/v1/reservations/:id/confirm      — confirm
POST   /api/v1/reservations/:id/arrive       — mark arrived (creates order)
POST   /api/v1/reservations/:id/no-show      — mark no-show
POST   /api/v1/reservations/:id/cancel       — cancel
```

### Printing
```
GET    /api/v1/printers                      — list configured printers
POST   /api/v1/printers                      — add printer [MANAGER+]
PATCH  /api/v1/printers/:id                  — update config
DELETE /api/v1/printers/:id                  — remove
GET    /api/v1/printers/:id/test             — send test print
GET    /api/v1/print-jobs                    — print job queue
POST   /api/v1/print-jobs/:id/retry          — retry failed job
```

### Item Availability
```
GET    /api/v1/menu/availability             — all item availability
PATCH  /api/v1/menu/availability/items       — bulk update
PATCH  /api/v1/menu/items/:id/availability   — single item toggle
```

### Day Close
```
GET    /api/v1/day-closes                    — history [MANAGER+]
POST   /api/v1/day-closes                    — initiate close [MANAGER+]
GET    /api/v1/day-closes/:id                — close detail
POST   /api/v1/day-closes/:id/print          — print summary
```

### Real-Time
```
GET    /api/v1/events/stream                 — SSE stream (all events for tenant)
GET    /api/v1/events/stream?types=KOT_*     — filtered stream
```

---

## 15. Frontend Pages

| Route | Role Access | Description |
|-------|------------|-------------|
| `/pos` | CASHIER, MANAGER, OWNER | Main billing screen |
| `/pos/order/[id]` | CASHIER+ | Order detail + payment |
| `/floor` | WAITER, CASHIER, MANAGER, OWNER | Floor plan |
| `/floor/reservations` | CASHIER, MANAGER, OWNER | Reservation timeline |
| `/kds` | CHEF, MANAGER, OWNER | Kitchen Display System |
| `/kds/bar` | CHEF (Bar), MANAGER | Bar KDS |
| `/orders` | CASHIER, MANAGER, OWNER | All orders unified stream |
| `/orders/delivery` | CASHIER, MANAGER, OWNER | Delivery orders |
| `/captain/[tableId]` | WAITER, MANAGER | Captain app (mobile PWA) |
| `/menu/availability` | CASHIER, MANAGER, OWNER | Item on/off control |
| `/settings/printers` | MANAGER, OWNER | Printer config |
| `/settings/billing` | MANAGER, OWNER | Tax, service charge config |
| `/day-close` | MANAGER, OWNER | Day-end operations |

---

## 16. Edge Cases — Complete List

### Orders
- Waiter adds item to order that just went unavailable → yellow warning, item highlighted
- Waiter sends KOT but all items are already in a sent KOT → error "No new items to send"
- Two waiters open same table simultaneously → optimistic lock, second save shows conflict
- Power cuts mid-order → SSE reconnects, draft order preserved in localStorage, synced on reconnect
- Network loss on waiter device → show "Offline" banner, allow local draft, sync on reconnect
- Order cancelled after KOT sent → KOT marked CANCELLED on KDS, kitchen notified via SSE

### KOT
- KOT printer offline → job queued, toast "Printer offline — KOT saved, will auto-print when back online"
- Chef marks item DONE that customer requested to add note → note visible throughout
- URGENT KOT blocked by 10 other normal KOTs → sort to top automatically
- KOT for merged table → shows both table numbers clearly
- Item on KOT doesn't match menu (price changed) → bill uses order-time price

### Billing
- Bill created for order still in kitchen → allowed, "IN_PROGRESS" warning shown
- Coupon applied + item discount on same item → both apply, cannot exceed item price
- Service charge on complimentary bill → service charge also waived (configurable)
- GST slab crossover: bill is 7,499 + 2 service charge = 7,501 → recalculates at 18%
- Bill reopened after partial payment → remaining balance shown
- Customer complains after bill paid → void + re-bill or direct refund flow

### Payments
- UPI QR scanned but payment not received in 5 min → QR expires, retry option
- Card terminal timeout → fallback to manual approval code entry
- Split payment: third method drops to 0 after rounding → auto-remove zero-amount record
- Wallet balance goes negative (concurrent payment) → handled by DB transaction, second pays full
- Cash payment: cashier enters wrong amount → editable before confirm
- Advance payment: customer wants full refund → advance refund flow (void advance record)

### Printing
- KOT auto-print: printer offline → queue job, notify, reprint when online
- Bill print job fails → show "Reprint" button, never auto-reprint (avoid duplicate bills)
- Customer requests digital bill → WhatsApp fallback
- 58mm printer receives 80mm-formatted KOT → charPerLine configured per printer prevents this
- Printer out of paper mid-KOT → PRINT_JOB_FAILED event → waiter sees alert

### Real-Time Sync
- Device joins mid-shift → needs full state: initial load via REST, then subscribe to SSE
- SSE connection drops → auto-reconnect with Last-Event-ID → server replays missed events (last 5 min)
- High traffic (20+ orders/min) → event batching (send array of events in one SSE frame)
- Device on slow 3G → reduce event frequency, batch updates every 2 seconds

### Item Availability
- Item marked available but stock is 0 in inventory → stock check on order → warning
- Auto-restore timer fires at midnight during day-close → restore only if day-close not in progress
- Item unavailable on Zomato but Zomato sends order for it → accept with warning flag

### Reservations
- Two reservations for same table at overlapping times → conflict error with "Overlaps with [Name]"
- Customer arrives 45 min late → table still shows RESERVED unless manually reassigned
- Large party (20 people) → suggest combining tables on floor plan
- Reservation deposit paid but customer cancels → refund tracking note on reservation

---

## 17. Role Permissions Matrix

| Feature | OWNER | MANAGER | CASHIER | WAITER | CHEF |
|---------|:-----:|:-------:|:-------:|:------:|:----:|
| Create order | Y | Y | Y | Y | N |
| Add items to order | Y | Y | Y | Y | N |
| Remove item from sent KOT | Y | Y | Y | N | N |
| Cancel order | Y | Y | Y | N | N |
| Create bill | Y | Y | Y | N | N |
| Record payment | Y | Y | Y | N | N |
| Apply discount | Y | Y | N | N | N |
| Apply coupon | Y | Y | Y | N | N |
| Mark complimentary | Y | Y | N | N | N |
| Void bill | Y | Y | N | N | N |
| Day close | Y | Y | N | N | N |
| Update KOT status | Y | Y | N | N | Y |
| Mark item 86 | Y | Y | N | N | Y |
| Transfer table | Y | Y | Y | N | N |
| Manage reservations | Y | Y | Y | N | N |
| Configure printers | Y | Y | N | N | N |
| Reprint KOT | Y | Y | Y | Y | N |
| Reprint bill | Y | Y | Y | N | N |

---

## 18. QA Checklist

### Real-Time Sync
- [ ] Waiter creates order on phone → appears on manager's desktop within 500ms
- [ ] Chef marks item DONE → waiter's device updates without refresh
- [ ] SSE drops → auto-reconnects, replays missed events, UI consistent
- [ ] Two devices simultaneously editing order → no data corruption

### Order Flow
- [ ] Walk-in → seat → order → KOT → bill → pay → table becomes AVAILABLE
- [ ] Add item after KOT sent → new KOT fires, bill updates
- [ ] Course hold → fire main → kitchen receives main course KOT separately
- [ ] Order cancel after KOT sent → KDS shows cancellation immediately

### Table Management
- [ ] Table merge: combined order, one bill, both tables clear on payment
- [ ] Table transfer: all items, KOTs, bill state move correctly
- [ ] Reservation: create → confirm → arrive → creates order with covers pre-filled
- [ ] No-show auto-mark fires after 15 minutes

### Billing
- [ ] GST slab switches at 7,500 boundary — tested with 7,499 and 7,501
- [ ] Service charge excluded from tips on bill
- [ ] Split bill: 3 ways, each paid separately → order paid after all 3 done
- [ ] Void: bill voided → appears in void report, not in daily revenue

### Payments
- [ ] Cash: over-payment → shows correct change
- [ ] UPI dynamic QR: payment confirmed via webhook → bill auto-closes
- [ ] Split payment: 3 methods → all recorded, total matches grand total
- [ ] Complimentary: requires manager approval, appears in comp report

### Printing
- [ ] KOT prints automatically on "Send to Kitchen"
- [ ] Bill prints on payment
- [ ] Printer offline → job queued → auto-prints when online
- [ ] 58mm and 80mm paper formats produce correct output
- [ ] Bill reprint requires MANAGER (not WAITER)

### Item Availability
- [ ] Item marked sold out → grey in menu on all devices instantly
- [ ] Auto-restore timer: item available again at set time
- [ ] Chef 86's item during active order → waiter warned, item highlighted

### Edge Cases
- [ ] Network disconnect mid-order → draft saved locally → restored on reconnect
- [ ] Same table opened on two devices simultaneously → optimistic lock prevents data loss

---

## 19. Definition of Done

- [ ] All order types (dine-in, takeaway, delivery, QR) operational
- [ ] Real-time sync: order on device A reflects on device B in under 1 second
- [ ] KOT routing: different categories to different printers
- [ ] All 7 payment methods implemented and tested
- [ ] Split bill (equal, by item, custom amount) working
- [ ] Bill void with audit trail
- [ ] Day-close with cash reconciliation
- [ ] LAN thermal printer printing correctly
- [ ] Print queue with retry logic
- [ ] Item availability toggle with auto-restore
- [ ] Reservation system: create → confirm → arrive → seat flow complete
- [ ] Table merge + transfer working
- [ ] Course management: hold + fire
- [ ] All drag & drop interactions smooth
- [ ] All role restrictions enforced
- [ ] All QA checklist items pass

---

## 20. Team Ownership

| Area | Owner |
|------|-------|
| Real-time SSE infrastructure | Backend lead |
| Order + KOT API | Backend dev |
| Billing + Payment API | Backend dev + QA |
| Printer integration + Print Agent | Full-stack dev |
| POS/Billing UI | Frontend lead |
| Floor Plan + Captain UI | Frontend dev |
| KDS | Frontend dev |
| Reservation system | Full-stack dev |
| DB schema + push | DB lead |
| End-to-end QA | QA engineer |
| Load testing (SSE under load) | DevOps |

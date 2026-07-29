# Phase 2 — Floor Plan & Captain App
**Priority:** 🔴 Critical | **Estimate:** 3 weeks | **Depends on:** Phase 1

---

## 1. Overview

This phase transforms the current basic floor plan into a full Petpooja-grade Captain App + Table Management system. WAITER/CAPTAIN can take orders table-side from a mobile-optimized UI. Features include: table merge, table transfer with full UI, cover count, waiter assignment, table timer, course-based ordering, reservation calendar, contactless QR ordering, and a live order timeline per table.

---

## 2. Current State vs Target State

| Feature | Current | Target |
|---------|---------|--------|
| Floor plan view | ✅ Basic | Enhanced |
| Table status colors | ✅ | ✅ |
| Table reservation modal | ✅ Basic localStorage | ✅ Full backend |
| QR code per table | ✅ | ✅ |
| Move KOT (stub) | ❌ | ✅ |
| Table merge | ❌ | ✅ |
| Table transfer (UI only) | ❌ | ✅ |
| Captain App (mobile UI) | ❌ | ✅ |
| Waiter assignment | ❌ | ✅ |
| Cover / guest count per table | ❌ | ✅ |
| Table timer | ❌ | ✅ |
| Course-based ordering | ❌ | ✅ |
| Live order items on table card | ❌ | ✅ |
| Reservation calendar | ❌ | ✅ |
| Contactless QR ordering | ❌ | ✅ |
| Table quick actions | ❌ | ✅ |
| Table occupancy history | ❌ | ✅ |

---

## 3. Feature Breakdown

### 3.1 Table Card — Enhanced

Each table card on the floor plan shows:

**AVAILABLE table:**
- Table name (T1, D7, G1)
- Capacity (e.g. "4 seats")
- Empty chair icon
- One-tap to start new order

**OCCUPIED table:**
- Table name
- Running time (e.g. "42 Min")
- Guest count (e.g. "2 guests")
- Subtotal in ₹ (e.g. "₹ 235.00")
- Waiter name/initials
- Action icons: View Order | Generate Bill | Print KOT
- Status bar color (orange = occupied)

**RESERVED table:**
- Guest name
- Reservation time
- "Seat" button to convert to occupied

**DIRTY table:**
- "Mark Clean" button
- Assign cleaner

**DB Changes:**
```prisma
model TableSession {
  id           String   @id @default(cuid())
  tenantId     String
  tableId      String
  orderId      String?  @unique
  assignedTo   String?  // waiter userId
  guestCount   Int      @default(1)
  startedAt    DateTime @default(now())
  endedAt      DateTime?
  table        Table    @relation(...)

  @@index([tenantId])
  @@index([tableId])
}

// Add to Table model:
model Table {
  // existing ...
  currentSessionId String? @unique
  lastOccupiedAt   DateTime?
  sessions         TableSession[]
}

// Add to TableStatus enum:
enum TableStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
  DIRTY    // new — table needs cleaning after guest leaves
  BLOCKED
}
```

---

### 3.2 Table Merge

Combine two or more tables into one order (large group scenario).

**Flow:**
1. MANAGER/OWNER clicks "Merge Tables"
2. Select source tables (all must be AVAILABLE or one is OCCUPIED)
3. New merged "super-table" shown on floor with combined capacity
4. Single order created for merged table
5. On close: all tables reverted to individual AVAILABLE

**Rules:**
- Only tables on the same floor can be merged
- Cannot merge tables that both have active orders
- Merged state stored as a MergedTable record
- Physically adjacent tables preferred (no enforcement)

**DB Changes:**
```prisma
model MergedTable {
  id         String   @id @default(cuid())
  tenantId   String
  tableIds   String[] // all merged table IDs
  orderId    String?
  mergedBy   String
  mergedAt   DateTime @default(now())
  unmergedAt DateTime?

  @@index([tenantId])
}
```

**API:**
- `POST /api/v1/tables/merge` — body: `{ tableIds: string[] }`
- `POST /api/v1/tables/unmerge/:mergedTableId`

---

### 3.3 Table Transfer (Full Implementation)

Move an active order from one table to another.

**Flow:**
1. Waiter/Cashier selects occupied table → "Transfer"
2. Floor plan shown with available destination tables highlighted
3. Select destination → confirm
4. Order linked to new table; old table → AVAILABLE

**Rules:**
- Cannot transfer to a table that already has an active order (unless merging)
- Transfer is logged in OrderActivity
- KOTs already sent remain unchanged; new KOTs go to new table

**API:**
- `POST /api/v1/orders/:id/transfer` — already exists (`{ newTableId }`)
- Add: update old table → AVAILABLE, create new session on new table

**Frontend:**
- Currently stub — needs full "pick destination table" flow on floor plan
- Source table highlighted; tap destination → confirm dialog

---

### 3.4 Move KOT Items

Move specific items from one table's KOT to another table.

**Flow:**
1. Select source table (OCCUPIED) → "Move Items"
2. Check-select items from current order
3. Select destination table
4. Items moved: removed from source order, added to destination order
5. New KOT fired at destination kitchen printer for moved items

**Rules:**
- Only PENDING or IN_PROGRESS KOT items can be moved
- Moved items carry their modifiers and notes
- Pricing recalculated for both bills

**API:**
- `POST /api/v1/orders/:id/move-items` — body: `{ itemIds: string[], destinationOrderId: string }`

---

### 3.5 Waiter Assignment

Assign a specific staff member to a table.

**Rules:**
- Any MANAGER/OWNER/CASHIER can assign
- Waiter assigned at session start or during service
- Assignment visible on table card (initials)
- Reports can filter by waiter

**DB Changes:**
```prisma
// TableSession.assignedTo already added above
// Add to Order model:
model Order {
  // existing ...
  assignedWaiterId String?
  assignedWaiter   User?   @relation("WaiterOrders", fields: [assignedWaiterId], references: [id])
}
```

**API:**
- `PATCH /api/v1/tables/:id/assign` — body: `{ staffId: string }`

---

### 3.6 Cover Count

Track number of guests per table for per-cover analytics.

**Rules:**
- Set at order creation or on table card
- Minimum 1, max = table capacity
- Used for "per cover" revenue calculations in reports
- WAITER can update cover count

**DB Changes:**
- Already: `Order.guestCount` field exists
- Add cover count to TableSession too

**API:**
- `PATCH /api/v1/tables/:id/covers` — body: `{ count: number }`

---

### 3.7 Table Timer

Show elapsed time since table became occupied.

**Implementation:**
- Frontend: compute from `TableSession.startedAt` (server time)
- Color-code: Green (0–30min), Yellow (30–60min), Red (60min+)
- Timer updates every 60 seconds on floor plan

**No DB change needed** — use `TableSession.startedAt`

**Frontend:**
- `useTableTimer(startedAt)` hook — returns formatted string like "42 Min"
- Shown on occupied table cards

---

### 3.8 Captain App (Mobile-Optimized Ordering)

A separate, mobile-first view for waiters to take orders table-side.

**Accessible at:** `/captain` (role: WAITER, CASHIER, MANAGER, OWNER)

**Captain App Screens:**

**Screen 1 — Floor View:**
- Same floor plan as main app
- Optimized for touch (larger tap targets, 72x72px table cards)
- Shows only: table name, timer, cover count, status color
- Tap occupied → go to existing order
- Tap available → start new order

**Screen 2 — Order Screen:**
- Menu categories across top (horizontal scroll)
- Item grid below (2-col on mobile, 3-col on tablet)
- Each item card: name, price, photo (if set), vegetarian/non-veg dot
- Add item → quantity picker with modifiers
- Ongoing order items shown at bottom as KOT list
- "Send to Kitchen" button fires KOT
- "Bill Request" button marks order as ready for cashier

**Screen 3 — Item Modifier Screen:**
- Pop-up after tapping an item that has variants/addons
- Mandatory addons shown first, optional below
- Quantity stepper
- Special instruction text field

**Screen 4 — Order Summary:**
- All items with quantities
- Edit / remove item
- Add note to order
- Send to kitchen
- Transfer table
- Print KOT

**Key Differences from Main App:**
- No billing operations (WAITER cannot bill)
- No settings access
- No reports
- Designed for phone portrait mode

**Frontend:**
- New layout: `app/(captain)/layout.tsx` — no sidebar, simplified topbar
- `/captain` — floor view
- `/captain/order/[tableId]` — order screen
- Responsive: works on 360px wide screen
- `manifest.json` with `"display": "standalone"` for PWA installation

---

### 3.9 Reservation System (Backend)

Move reservations from localStorage to full backend storage.

**DB Changes:**
```prisma
model Reservation {
  id           String            @id @default(cuid())
  tenantId     String
  tableId      String
  guestName    String
  guestPhone   String
  partySize    Int
  scheduledAt  DateTime
  notes        String?
  status       ReservationStatus @default(PENDING)
  createdBy    String
  seatedAt     DateTime?
  cancelledAt  DateTime?
  createdAt    DateTime          @default(now())
  table        Table             @relation(...)

  @@index([tenantId])
  @@index([tableId])
  @@index([scheduledAt])
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  SEATED
  CANCELLED
  NO_SHOW
}
```

**API:**
- `GET /api/v1/reservations` — list, filter by date/status
- `POST /api/v1/reservations` — create
- `PATCH /api/v1/reservations/:id` — update (seat, cancel)
- `DELETE /api/v1/reservations/:id`

**Frontend:**
- Reservation modal: now POSTs to backend
- Floor plan: reserved tables show guest name from DB
- New page: `/reservations` — calendar/list view of all reservations

---

### 3.10 Contactless QR Ordering (Customer-Facing)

Customer scans table QR → sees menu → places order → staff approves.

**Flow:**
1. Customer scans QR on table
2. Opens `/order/[tableId]` — public page, no auth required
3. See menu: categories + items with photos and prices
4. Add to cart → submit order
5. Order created with `source: 'QR_SELF_ORDER'` and status `PENDING_APPROVAL`
6. Staff (WAITER/CASHIER) sees notification + approves/rejects
7. On approve → normal order flow begins

**DB Changes:**
```prisma
enum OrderSource {
  POS
  CAPTAIN_APP
  QR_SELF_ORDER   // new
  AGGREGATOR
}

enum OrderStatus {
  // existing ...
  PENDING_APPROVAL  // new — customer placed, staff not yet approved
}
```

**API:**
- `GET /api/v1/public/menu/:tenantId/:tableId` — public menu for QR page
- `POST /api/v1/public/orders` — create order from QR (public, rate-limited)
- `POST /api/v1/orders/:id/approve` — staff approves QR order
- `POST /api/v1/orders/:id/reject` — staff rejects QR order

**Frontend:**
- `/order/[tableId]` — fully public customer ordering page
  - Shows restaurant name, table number
  - Category tabs + item grid
  - Cart sidebar/bottom sheet
  - Submit → "Order placed! Staff will confirm shortly."
- Staff: notification bell shows pending QR orders
- `/floor` — table with pending approval shows "QR Pending" badge

---

## 4. Role Permissions

| Feature | OWNER | MANAGER | CASHIER | WAITER | CHEF |
|---------|-------|---------|---------|--------|------|
| Merge tables | ✅ | ✅ | ❌ | ❌ | ❌ |
| Transfer order | ✅ | ✅ | ✅ | ✅ | ❌ |
| Move KOT items | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign waiter | ✅ | ✅ | ✅ | ❌ | ❌ |
| Mark table dirty | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage reservations | ✅ | ✅ | ✅ | ✅ | ❌ |
| Approve QR orders | ✅ | ✅ | ✅ | ✅ | ❌ |
| Captain app access | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 5. Business Rules

1. Only one active order per table at any time
2. Table can only be merged if both are on the same floor
3. DIRTY tables cannot receive new orders until marked AVAILABLE
4. QR orders expire after 10 minutes if not approved (status → EXPIRED)
5. Reservation reminder: system should notify staff 15 min before reservation time
6. Captain app shows only menus where `isAvailable: true`
7. Contactless ordering can be disabled per outlet in settings
8. Table timer resets when table becomes AVAILABLE

---

## 6. Edge Cases

| Scenario | Handling |
|----------|---------|
| Customer scans QR after table is occupied | Shows table already occupied; option to add to existing order |
| Merge — power failure mid-merge | Use DB transaction; rollback if failure |
| Waiter offline on captain app | Captain app has offline queue; sync when back online |
| Reservation for table already reserved at that time | Block with "Table already reserved" error |
| QR order submitted — then same table gets POS order | Staff approval screen shows both; staff reconciles |
| Transfer to table that gets occupied between selection and confirm | Re-check at confirm time; show error if occupied |

---

## 7. QA Checklist

### Floor Plan
- [ ] Available → tap → order screen opens
- [ ] Occupied → shows timer, covers, subtotal, waiter
- [ ] Timer turns yellow at 30min, red at 60min
- [ ] DIRTY status shows "Mark Clean" action
- [ ] Reserved table shows guest name

### Table Operations
- [ ] Merge two available tables → single order created
- [ ] Transfer order from T1 to T2 → T1 becomes available, T2 occupied
- [ ] Move 2 items from T1 to T2 → T1 bill reduced, T2 bill increased

### Captain App
- [ ] Opens correctly on 390px wide mobile screen
- [ ] Categories scroll horizontally
- [ ] Item with variants opens modifier screen
- [ ] Mandatory modifier: cannot add to cart without selecting
- [ ] Send to Kitchen: KOT appears in KDS
- [ ] Bill Request: order status changes to SERVED

### Reservations
- [ ] Create reservation with guest name, phone, time → saved to DB
- [ ] Reserved table shows guest name on floor plan
- [ ] Seat reservation → table becomes OCCUPIED, reservation SEATED
- [ ] Cancel reservation → table back to AVAILABLE

### QR Ordering
- [ ] Customer opens QR link → sees menu without login
- [ ] Customer places order → staff gets notification
- [ ] Staff approves → order enters normal flow
- [ ] Staff rejects → customer sees rejection message
- [ ] Order expires after 10 min if not approved

---

## 8. Frontend Pages / Components

| Page/Component | Route | New/Modified |
|----------------|-------|--------------|
| FloorPage | `/floor` | Modified (merge, timer, dirty status, waiter) |
| CaptainLayout | `/(captain)/layout.tsx` | New |
| CaptainFloor | `/captain` | New |
| CaptainOrder | `/captain/order/[tableId]` | New |
| CaptainItemModal | — | New |
| ReservationsPage | `/reservations` | New |
| QROrderPage | `/order/[tableId]` | New (public) |
| MergeTablesModal | — | New |
| AssignWaiterModal | — | New |

---

## 9. API Routes Summary

```
POST   /api/v1/tables/merge
POST   /api/v1/tables/unmerge/:mergedTableId
PATCH  /api/v1/tables/:id/assign
PATCH  /api/v1/tables/:id/covers
PATCH  /api/v1/tables/:id/dirty
PATCH  /api/v1/tables/:id/clean

POST   /api/v1/orders/:id/move-items
POST   /api/v1/orders/:id/approve
POST   /api/v1/orders/:id/reject

GET    /api/v1/reservations
POST   /api/v1/reservations
PATCH  /api/v1/reservations/:id
DELETE /api/v1/reservations/:id

GET    /api/v1/public/menu/:tenantId/:tableId
POST   /api/v1/public/orders
```

---

## 10. Definition of Done

- [ ] Table merge/unmerge works end-to-end
- [ ] Captain app usable on a real phone
- [ ] QR ordering flow: scan → order → approve → KOT
- [ ] Reservations stored in DB (no more localStorage)
- [ ] Table transfer shows floor-pick UI
- [ ] DIRTY table status supported
- [ ] Timer updates every minute on floor plan
- [ ] All QA items pass

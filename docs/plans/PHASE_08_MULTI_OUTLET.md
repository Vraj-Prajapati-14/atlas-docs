# Phase 8 — Multi-Outlet
**Priority:** 🟢 Later | **Estimate:** 4 weeks | **Depends on:** Phases 1–5

---

## 1. Overview

Enable a single tenant to manage multiple restaurant outlets (branches) under one account. Features: per-outlet configuration, central menu management with outlet-specific overrides, stock transfer between outlets, consolidated reports, outlet-specific staff, and a franchise management mode.

---

## 2. Current vs Target

| Feature | Current | Target |
|---------|---------|--------|
| Single outlet per tenant | ✅ | ✅ |
| Multiple outlets | ❌ | ✅ |
| Central menu | ❌ | ✅ |
| Outlet-specific menu | ❌ | ✅ |
| Outlet-specific pricing | ❌ | ✅ |
| Stock transfer | ❌ | ✅ |
| Consolidated reports | ❌ | ✅ |
| Central kitchen | ❌ | ✅ |
| Franchise mode | ❌ | ✅ |

---

## 3. Architecture Change

### Current Model
```
Tenant (Restaurant Brand)
  └── single implicit outlet
       ├── Staff
       ├── Tables
       ├── Menu
       ├── Inventory
       └── Orders
```

### Target Model
```
Tenant (Restaurant Brand)
  ├── Outlet 1 (Main Branch)
  │    ├── Staff (some shared, some outlet-specific)
  │    ├── Tables & Floors
  │    ├── Menu (from central + overrides)
  │    ├── Inventory
  │    └── Orders
  ├── Outlet 2 (Second Branch)
  │    └── ...
  └── Central Kitchen (optional)
       ├── Production
       └── Distribution to outlets
```

---

## 4. DB Changes

```prisma
model Outlet {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  address     String?
  city        String?
  phone       String?
  gstNumber   String?
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  timezone    String   @default("Asia/Kolkata")
  createdAt   DateTime @default(now())
  tenant      Tenant   @relation(...)

  @@index([tenantId])
}
```

**All existing models with `tenantId` need `outletId` added** (where outlet-specific data makes sense):
- `Order` → add `outletId`
- `Bill` → add `outletId`
- `Table` → already has floor → floor has outletId
- `InventoryItem` stock → outlet-specific stock levels
- `Staff` → `defaultOutletId` (can work at multiple)
- `Coupon` → optional `outletId` (null = all outlets)

---

## 5. Feature Breakdown

### 5.1 Central Menu Management

Menu items defined at tenant level, shared across all outlets.

**Outlet Overrides:**
- Price override per outlet (outlet 2 is in a mall → higher prices)
- Availability override (item not available at outlet 2)
- Category visibility (outlet 2 doesn't serve alcohol)

**DB Changes:**
```prisma
model MenuItemOutletOverride {
  id          String   @id @default(cuid())
  tenantId    String
  outletId    String
  menuItemId  String
  priceOverride Int?   // paise; null = use base price
  isAvailable Boolean  @default(true)

  @@unique([tenantId, outletId, menuItemId])
}
```

---

### 5.2 Outlet-Specific Inventory

Each outlet has its own stock levels.

```prisma
model OutletStock {
  id              String  @id @default(cuid())
  tenantId        String
  outletId        String
  inventoryItemId String
  quantity        Float   @default(0)
  unit            String

  @@unique([tenantId, outletId, inventoryItemId])
  @@index([tenantId, outletId])
}
```

---

### 5.3 Stock Transfer Between Outlets

Move inventory from one outlet to another.

```prisma
model StockTransfer {
  id              String   @id @default(cuid())
  tenantId        String
  fromOutletId    String
  toOutletId      String
  status          TransferStatus @default(REQUESTED)
  requestedBy     String
  approvedBy      String?
  dispatchedAt    DateTime?
  receivedAt      DateTime?
  items           StockTransferItem[]
  createdAt       DateTime @default(now())

  @@index([tenantId])
}

model StockTransferItem {
  id         String  @id @default(cuid())
  transferId String
  itemId     String
  quantity   Float
  unit       String
  transfer   StockTransfer @relation(...)
}

enum TransferStatus {
  REQUESTED
  APPROVED
  DISPATCHED
  RECEIVED
  CANCELLED
}
```

---

### 5.4 Consolidated Reports

Reports that aggregate across all outlets.

**New report endpoints:**
- `GET /api/v1/reports/consolidated/daily` — all outlets combined + per-outlet breakdown
- `GET /api/v1/reports/consolidated/outlet-comparison` — side-by-side outlet performance

**Outlet selector in reports:**
- "All Outlets" or specific outlet dropdown
- Outlet comparison chart (bar chart: outlet A vs B by revenue)

---

### 5.5 Central Kitchen

A special outlet type that doesn't serve customers directly but produces for other outlets.

**Flow:**
1. Outlet places "production request" to central kitchen
2. Central kitchen produces items
3. Items dispatched as stock transfer to requesting outlet

```prisma
model Outlet {
  // existing ...
  type  OutletType @default(REGULAR)
}

enum OutletType {
  REGULAR
  CENTRAL_KITCHEN
  FRANCHISE
}
```

---

### 5.6 User Context Switching

Staff assigned to multiple outlets can switch outlet context within the app.

**In topbar:** outlet selector dropdown (if staff has access to multiple)
**Auth token:** includes `outletId` in JWT payload; changes on switch
**API:** all queries filtered by current outlet context

---

## 6. Role Permissions

| Feature | OWNER | MANAGER | CASHIER | WAITER |
|---------|-------|---------|---------|--------|
| Create outlet | ✅ | ❌ | ❌ | ❌ |
| View all outlets | ✅ | ✅ (own) | Own | Own |
| Manage central menu | ✅ | ✅ | ❌ | ❌ |
| Outlet overrides | ✅ | ✅ (own outlet) | ❌ | ❌ |
| Stock transfer | ✅ | ✅ | ❌ | ❌ |
| Consolidated reports | ✅ | ✅ | ❌ | ❌ |

---

## 7. Business Rules

1. A user is always in the context of ONE outlet at a time
2. OWNER can see all outlets; MANAGER only sees assigned outlets
3. Stock transfer requires approval from receiving outlet's MANAGER
4. Central menu changes propagate to all outlets unless outlet has override
5. Bills use outlet's GST number (may differ per outlet)

---

## 8. QA Checklist

- [ ] Create second outlet → all data isolated
- [ ] Menu item shows different price at outlet 2
- [ ] Stock transfer: outlet 1 stock decreases, outlet 2 stock increases after receive
- [ ] Consolidated report: total = sum of both outlets
- [ ] MANAGER of outlet 1 cannot see outlet 2 data

---

## 9. Definition of Done

- [ ] Multi-outlet schema migrated
- [ ] Context switching in topbar works
- [ ] Central menu + outlet overrides work
- [ ] Stock transfer complete flow
- [ ] Consolidated reports accurate
- [ ] All QA items pass

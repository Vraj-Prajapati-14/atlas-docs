# Phase 6 — Online Ordering Pro
**Priority:** 🟡 Medium | **Estimate:** 3 weeks | **Depends on:** Phase 1

---

## 1. Overview

Atlas has basic Zomato/Swiggy webhook handling. This phase builds the full online ordering control center: per-platform menu on/off, item-level availability control, platform-specific pricing, QR-based self-ordering (from Phase 2), delivery zone management, online order tracking, aggregator performance reports, and a unified order stream (all channels in one view).

---

## 2. Current vs Target

| Feature | Current | Target |
|---------|---------|--------|
| Zomato/Swiggy webhook | ✅ | Enhanced |
| Accept/dispatch/deliver orders | ✅ | ✅ |
| Aggregator credentials | ✅ | ✅ |
| Menu sync to platforms | ❌ | ✅ |
| Item on/off per platform | ❌ | ✅ |
| Platform-specific pricing | ❌ | ✅ |
| Delivery zones | ❌ | ✅ |
| Unified order stream | ❌ | ✅ |
| QR table ordering | ❌ | ✅ (Phase 2) |
| Online menu customization | ❌ | ✅ |
| Estimated prep time | ❌ | ✅ |
| Live order tracking | ❌ | ✅ |

---

## 3. Feature Breakdown

### 3.1 Item Availability Control (Per Platform)

As seen in the Petpooja screenshots: toggle individual items ON/OFF per platform.

**Concepts:**
- Each `MenuItem` has an availability override per platform
- Default: available everywhere
- Override: unavailable on Swiggy, available on Zomato

**DB Changes:**
```prisma
model MenuItemAvailability {
  id          String   @id @default(cuid())
  tenantId    String
  menuItemId  String
  platform    String   // ZOMATO | SWIGGY | QR | ALL
  isAvailable Boolean  @default(true)
  reason      String?  // optional — "Out of stock", "Seasonal"
  until       DateTime? // auto-restore at this time
  updatedBy   String
  updatedAt   DateTime @default(now())

  @@unique([tenantId, menuItemId, platform])
  @@index([tenantId])
}

model AddonAvailability {
  id          String   @id @default(cuid())
  tenantId    String
  addonId     String
  platform    String
  isAvailable Boolean  @default(true)
  updatedAt   DateTime @default(now())

  @@unique([tenantId, addonId, platform])
}
```

**API:**
- `GET /api/v1/aggregators/availability` — all item availability per platform
- `PATCH /api/v1/aggregators/availability/items` — bulk update (array of { menuItemId, platform, isAvailable })
- `PATCH /api/v1/aggregators/availability/addons` — same for addons

**Frontend:**
- `/aggregators/availability` — full Item On/Off screen like Petpooja:
  - Platform tabs: All | Zomato | Swiggy | Magicpin | QR
  - Item list with ON/OFF toggle
  - Search by name
  - Category filter
  - "Mark All OFF" / "Mark All ON" bulk action
  - Color indicators: Green = On, Yellow = Partial Changes, Red = Off

---

### 3.2 Platform-Specific Pricing

Different prices for delivery platforms (e.g. Zomato price = base + 20%).

**DB Changes:**
```prisma
model MenuItemPlatformPrice {
  id          String   @id @default(cuid())
  tenantId    String
  menuItemId  String
  platform    String   // ZOMATO | SWIGGY | QR
  priceInPaise Int     // override price
  updatedBy   String
  updatedAt   DateTime @default(now())

  @@unique([tenantId, menuItemId, platform])
}
```

**API:**
- `GET /api/v1/aggregators/pricing` — all platform prices
- `PATCH /api/v1/aggregators/pricing` — update prices

**Frontend:**
- Pricing tab in aggregator settings: per-item per-platform price grid

---

### 3.3 Unified Order Stream

Single view for ALL incoming orders: Dine-In, Takeaway, Zomato, Swiggy, QR.

**Current Problem:** Aggregator orders and POS orders are in separate systems.

**Solution:** `/orders` page gets tabs:
- **All** — all order types
- **Dine In** — table orders
- **Delivery** — aggregator delivery orders
- **Pick Up** — aggregator pickup orders
- **Online** — QR orders
- **Swiggy** — filtered by source
- **Zomato** — filtered by source

**Order Card (enhanced):**
- Source badge (ZOMATO / SWIGGY / QR / POS)
- Platform order ID
- Delivery address (if delivery)
- Prep time countdown
- Action: Accept | Start | Ready | Dispatch | Delivered | Cancel

---

### 3.4 Estimated Prep Time

Auto-set and communicate prep time to platforms.

**DB Changes:**
```prisma
model AggregatorCredential {
  // existing ...
  defaultPrepTimeMinutes  Int  @default(20)
  isOpen                  Boolean @default(true)
  openTime                String? // "09:00"
  closeTime               String? // "23:00"
}
```

**API:**
- `PATCH /api/v1/aggregators/credentials/:id/prep-time` — update prep time
- `PATCH /api/v1/aggregators/credentials/:id/open-status` — toggle restaurant open/closed on platform

**Webhook Enhancement:**
- On order ACCEPT, send estimated_delivery_time back to platform API

---

### 3.5 Delivery Zone Management

Define delivery areas and set minimum order amounts per zone.

**DB Changes:**
```prisma
model DeliveryZone {
  id              String   @id @default(cuid())
  tenantId        String
  name            String   // "Zone 1 — 0-3km"
  radiusKm        Float
  minOrderInPaise Int     @default(0)
  deliveryFeeInPaise Int  @default(0)
  isActive        Boolean @default(true)

  @@index([tenantId])
}
```

**Note:** Zomato/Swiggy define their own delivery zones externally. This is for Atlas's own delivery orders or QR delivery.

---

### 3.6 Online Menu Page

A customer-facing public menu page (without ordering — just browsing).

**Route:** `/menu/[tenantId]` — public, no auth
**Features:**
- Restaurant name, logo, address
- Menu categories + items with photos, prices
- Vegetarian/non-veg indicators
- Search
- "Order via [Zomato/Swiggy]" buttons

---

### 3.7 Auto-Accept Rules

Configure which order types are auto-accepted without staff action.

**DB Changes:**
```prisma
model AggregatorCredential {
  // existing ...
  autoAccept  Boolean @default(false)
  autoAcceptDelivery Boolean @default(false)
  autoAcceptPickup   Boolean @default(false)
}
```

**Logic:** In webhook handler — if `autoAccept: true` for platform, immediately mark order as ACCEPTED and fire KOT.

---

## 4. Role Permissions

| Feature | OWNER | MANAGER | CASHIER | WAITER |
|---------|-------|---------|---------|--------|
| Toggle item availability | ✅ | ✅ | ✅ | ❌ |
| Edit platform pricing | ✅ | ✅ | ❌ | ❌ |
| Manage credentials | ✅ | ✅ | ❌ | ❌ |
| Accept/dispatch orders | ✅ | ✅ | ✅ | ❌ |
| View online orders report | ✅ | ✅ | ✅ | ❌ |

---

## 5. Business Rules

1. Item marked OFF on a platform → webhook orders for that item show warning
2. Platform-specific price falls back to base price if not set
3. Auto-accept only enabled for verified platforms (has valid HMAC key)
4. Online menu page shows only items with `isAvailable: true` for the QR platform
5. If restaurant is marked CLOSED, incoming webhooks are queued but not auto-accepted

---

## 6. QA Checklist

- [ ] Toggle Swiggy item OFF → availability record created
- [ ] Platform price set → overrides base price in aggregator orders
- [ ] Unified order stream shows all sources on `/orders` page
- [ ] Auto-accept: order arrives → automatically accepted, KOT fired
- [ ] Public menu page shows restaurant items without auth
- [ ] Item marked OFF doesn't appear in QR ordering menu

---

## 7. API Routes Summary

```
GET    /api/v1/aggregators/availability
PATCH  /api/v1/aggregators/availability/items
PATCH  /api/v1/aggregators/availability/addons
GET    /api/v1/aggregators/pricing
PATCH  /api/v1/aggregators/pricing
PATCH  /api/v1/aggregators/credentials/:id/prep-time
PATCH  /api/v1/aggregators/credentials/:id/open-status
GET    /api/v1/public/menu/:tenantId
GET    /api/v1/delivery-zones
POST   /api/v1/delivery-zones
PATCH  /api/v1/delivery-zones/:id
```

---

## 8. Definition of Done

- [ ] Item availability toggle works per platform
- [ ] Unified order stream shows all order types
- [ ] Auto-accept configured and working
- [ ] Public menu page renders correctly
- [ ] All QA items pass

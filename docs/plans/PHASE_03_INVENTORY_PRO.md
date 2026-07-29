# Phase 3 — Inventory Pro
**Priority:** 🟠 High | **Estimate:** 4 weeks | **Depends on:** —

---

## 1. Overview

Atlas has a basic inventory module. This phase transforms it into a Petpooja-grade Inventory Management System including: multi-unit tracking, FIFO/LIFO costing, production module (for bakeries/cloud kitchens), waste tracking, batch expiry, auto-consumption from sales, stock audit, inter-outlet transfers, low-stock alerts, and a full recipe costing engine.

---

## 2. Current State vs Target State

| Feature | Current | Target |
|---------|---------|--------|
| Inventory items | ✅ | Enhanced |
| Categories | ✅ | Enhanced |
| Suppliers | ✅ | Enhanced |
| Purchase orders | ✅ | Enhanced |
| Basic transactions | ✅ | Enhanced |
| Recipes (ingredient mapping) | ✅ | Enhanced |
| Multi-unit of measure | ❌ | ✅ |
| FIFO/LIFO costing | ❌ | ✅ |
| Waste tracking | ❌ | ✅ |
| Production module | ❌ | ✅ |
| Stock audit / physical count | ❌ | ✅ |
| Auto-consumption from KOT | ❌ | ✅ |
| Batch / expiry tracking | ❌ | ✅ |
| Reorder alerts (automated) | ❌ | ✅ |
| Inventory valuation report | ✅ Basic | Enhanced |
| Consumption report | ❌ | ✅ |
| Inter-outlet transfer | ❌ | ✅ |
| Vendor rating | ❌ | ✅ |
| GRN (Goods Received Note) | ❌ | ✅ |

---

## 3. Feature Breakdown

### 3.1 Multi-Unit of Measure

Each ingredient can have a base unit and multiple conversion units.

**Example:**
- Flour: base = KG; can be purchased in BAGS (1 bag = 25 KG); recipe uses GRAMS (1 KG = 1000 GM)

**DB Changes:**
```prisma
model UnitConversion {
  id            String   @id @default(cuid())
  tenantId      String
  itemId        String
  fromUnit      String   // e.g. "BAG"
  toUnit        String   // e.g. "KG" (the item's base unit)
  factor        Float    // e.g. 25 (1 BAG = 25 KG)
  createdAt     DateTime @default(now())
  item          InventoryItem @relation(...)

  @@unique([tenantId, itemId, fromUnit])
  @@index([tenantId])
}

model InventoryItem {
  // existing ...
  baseUnit      String   @default("KG")  // canonical unit for stock
  purchaseUnit  String?  // default purchase unit
  recipeUnit    String?  // default unit in recipes
  unitConversions UnitConversion[]
}
```

---

### 3.2 FIFO Costing & Batch Tracking

Track each batch of inventory (purchase lot) separately with FIFO depletion.

**DB Changes:**
```prisma
model InventoryBatch {
  id              String   @id @default(cuid())
  tenantId        String
  itemId          String
  purchaseOrderId String?
  grnId           String?
  quantity        Float    // original quantity
  remaining       Float    // current remaining
  costPerUnit     Int      // paise per base unit
  expiryDate      DateTime?
  batchCode       String?  // vendor batch/lot number
  receivedAt      DateTime @default(now())
  createdBy       String
  item            InventoryItem @relation(...)

  @@index([tenantId, itemId])
}
```

**Consumption logic:**
- When items consumed (from KOT/sale), deduct from oldest batch first (FIFO)
- Record which batches were used and their unit cost
- This enables accurate COGS calculation

---

### 3.3 Goods Received Note (GRN)

When a purchase order is received, create a GRN to confirm quantities and quality.

**Flow:**
1. PO sent to supplier
2. Delivery arrives
3. Staff creates GRN against PO
4. Enters actual quantities received (may differ from PO)
5. Enters actual price per unit (may differ from PO)
6. Records condition: OK / DAMAGED / PARTIAL
7. Stock updated; batch created

**DB Changes:**
```prisma
model GRN {
  id              String    @id @default(cuid())
  tenantId        String
  purchaseOrderId String
  grnNumber       String    // GRN-001, GRN-002...
  receivedBy      String
  receivedAt      DateTime  @default(now())
  status          GRNStatus @default(DRAFT)
  notes           String?
  items           GRNItem[]
  purchaseOrder   PurchaseOrder @relation(...)

  @@index([tenantId])
}

model GRNItem {
  id               String  @id @default(cuid())
  grnId            String
  inventoryItemId  String
  orderedQty       Float
  receivedQty      Float
  rejectedQty      Float   @default(0)
  costPerUnit      Int     // paise
  condition        String  @default("OK") // OK | DAMAGED | PARTIAL
  expiryDate       DateTime?
  batchCode        String?
  grn              GRN     @relation(...)
}

enum GRNStatus {
  DRAFT
  CONFIRMED
  PARTIAL
}
```

**API:**
- `GET /api/v1/grns` — list
- `POST /api/v1/grns` — create from PO
- `PATCH /api/v1/grns/:id` — update
- `POST /api/v1/grns/:id/confirm` — finalizes GRN, creates batches, updates stock

---

### 3.4 Waste Tracking

Record inventory spoilage, spillage, theft, or cooking waste.

**Waste Types:**
- SPOILAGE — expired/rotten
- SPILLAGE — accident
- COOKING_LOSS — normal cooking waste
- THEFT — suspected
- DAMAGE — dropped/broken

**DB Changes:**
```prisma
model WasteEntry {
  id              String    @id @default(cuid())
  tenantId        String
  itemId          String
  quantity        Float
  unit            String
  wasteType       WasteType
  reason          String?
  recordedBy      String
  recordedAt      DateTime  @default(now())
  approvedBy      String?   // MANAGER required for THEFT
  costInPaise     Int       // calculated from current batch cost

  @@index([tenantId])
}

enum WasteType {
  SPOILAGE
  SPILLAGE
  COOKING_LOSS
  THEFT
  DAMAGE
  OTHER
}
```

**Rules:**
- THEFT waste requires MANAGER/OWNER approval
- Waste deducts from stock immediately
- Waste is tracked separately from sale consumption for reports

**API:**
- `GET /api/v1/inventory/waste` — list
- `POST /api/v1/inventory/waste` — create entry
- `POST /api/v1/inventory/waste/:id/approve` — approve (MANAGER, OWNER)

---

### 3.5 Production Module

For bakeries, cloud kitchens, and restaurants that produce semi-finished goods.

**Concept:** A "production run" converts raw ingredients into a product.

**Example:** 
- Input: 2 KG flour + 500g butter + 10 eggs
- Output: 20 croissants

**DB Changes:**
```prisma
model ProductionRecipe {
  id          String   @id @default(cuid())
  tenantId    String
  name        String   // "Croissant Batch"
  outputItemId String? // links to InventoryItem (the finished product)
  outputQty   Float    // e.g. 20 units
  ingredients ProductionIngredient[]
  productions ProductionRun[]

  @@index([tenantId])
}

model ProductionIngredient {
  id         String  @id @default(cuid())
  recipeId   String
  itemId     String  // InventoryItem
  quantity   Float
  unit       String
  recipe     ProductionRecipe @relation(...)
}

model ProductionRun {
  id            String   @id @default(cuid())
  tenantId      String
  recipeId      String
  batchQty      Float    // how many batches (multiplier)
  outputQty     Float    // actual output
  status        ProductionStatus @default(PLANNED)
  startedAt     DateTime?
  completedAt   DateTime?
  createdBy     String
  notes         String?
  recipe        ProductionRecipe @relation(...)

  @@index([tenantId])
}

enum ProductionStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

**API:**
- Full CRUD for production recipes
- `POST /api/v1/inventory/production` — create run
- `PATCH /api/v1/inventory/production/:id/start`
- `PATCH /api/v1/inventory/production/:id/complete` — deducts raw ingredients, adds output to stock

---

### 3.6 Auto-Consumption from KOT

When a KOT status → DONE, automatically deduct recipe ingredients from stock.

**Flow:**
1. Chef marks KOT as DONE
2. System looks up Recipe for each menu item in KOT
3. Deducts ingredient quantities from current stock (FIFO from oldest batch)
4. Creates `InventoryTransaction` records with `source: 'SALE'`

**Rules:**
- If recipe not set for an item, skip (no deduction)
- If stock goes below 0, log a `STOCK_WARNING` but don't block the KOT
- Deduction is asynchronous — doesn't slow down KOT marking

**Implementation:**
- Service: `consumeRecipeIngredients(kotId)` called after KOT status → DONE
- Uses existing Recipe model + new batch FIFO logic

---

### 3.7 Stock Audit (Physical Count)

Periodic stock count to verify book stock vs actual stock.

**Flow:**
1. INVENTORY_MANAGER initiates stock audit → freezes book quantities
2. Staff physically counts items and enters actual quantities
3. System compares: book qty vs actual qty → variance
4. Manager reviews variances → approve adjustments
5. Stock adjusted to match actual count

**DB Changes:**
```prisma
model StockAudit {
  id           String      @id @default(cuid())
  tenantId     String
  status       AuditStatus @default(DRAFT)
  startedBy    String
  startedAt    DateTime    @default(now())
  completedAt  DateTime?
  notes        String?
  items        StockAuditItem[]

  @@index([tenantId])
}

model StockAuditItem {
  id           String  @id @default(cuid())
  auditId      String
  itemId       String
  bookQty      Float   // stock at time of audit start
  countedQty   Float?  // actual physical count
  variance     Float?  // countedQty - bookQty
  adjustment   Float?  // approved adjustment
  audit        StockAudit @relation(...)
}

enum AuditStatus {
  DRAFT
  IN_PROGRESS
  REVIEW
  COMPLETED
}
```

**API:**
- `POST /api/v1/inventory/audit` — start new audit
- `PATCH /api/v1/inventory/audit/:id/items` — bulk update counted quantities
- `POST /api/v1/inventory/audit/:id/approve` — apply adjustments

---

### 3.8 Reorder Alerts

Automatic low-stock notification and reorder suggestion.

**DB Changes:**
```prisma
model InventoryItem {
  // existing ...
  reorderPoint  Float?   // trigger reorder alert at this qty
  reorderQty    Float?   // suggested order quantity
}
```

**Alert Logic:**
- Background job (cron) runs daily at 7 AM
- Checks all items where `currentStock <= reorderPoint`
- Creates notification for OWNER/MANAGER: "5 items at low stock"
- Auto-creates a draft Purchase Order with reorder quantities if `autoReorder: true`

**API:**
- `GET /api/v1/inventory/low-stock` — items below reorder point
- Response used by dashboard widget

---

### 3.9 Recipe Costing Engine

Calculate the exact cost of preparing each menu item.

**Enhancement over existing:**
- Current: recipe stores ingredient → quantity
- Enhanced: uses current batch cost to calculate COGS per menu item
- Shows: "Cost to make: ₹45" vs "Selling price: ₹199" → "Margin: 77.3%"

**API:**
- `GET /api/v1/inventory/recipes/:menuItemId/costing` — returns cost breakdown
- `GET /api/v1/inventory/menu-costing` — all items with cost + margin

**Frontend:**
- Menu item detail: shows cost and margin
- Reports: menu engineering report (high margin + high popularity = "Stars")

---

### 3.10 Vendor Management (Enhanced)

- Vendor contact, GST number, address
- Vendor rating (1–5 stars based on delivery reliability)
- Purchase history per vendor
- Credit terms (net 30, net 60)
- Outstanding payments to vendor

**DB Changes:**
```prisma
model Supplier {
  // existing ...
  gstNumber     String?
  creditDays    Int      @default(0)
  rating        Float?   // avg 1-5
  outstandingAmountInPaise Int @default(0)
}
```

---

## 4. Role Permissions

| Feature | OWNER | MANAGER | CASHIER | WAITER | CHEF | INV_MGR |
|---------|-------|---------|---------|--------|------|---------|
| View stock | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Add/edit items | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Create GRN | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Record waste | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Approve waste (THEFT) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Production | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Stock audit | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| View recipes/costing | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Edit recipes | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

---

## 5. Business Rules

1. Stock can never go below 0 (show warning but don't block)
2. FIFO: oldest batch depleted first during consumption
3. Batch expires → auto-move to EXPIRED status; alert sent
4. A GRN must reference a purchase order (no ad-hoc GRNs)
5. Auto-consumption only triggers when recipe is fully mapped
6. Production run deducting more ingredients than available → warning
7. Stock audit: once COMPLETED, cannot re-open
8. Waste entry for THEFT: pending approval does NOT deduct stock (deducts on approval)

---

## 6. QA Checklist

- [ ] Add item with base unit KG and conversion BAG=25KG
- [ ] Purchase 2 bags → stock shows 50 KG
- [ ] Recipe uses 500g → deducts 0.5 KG from stock
- [ ] FIFO: two batches at different costs; older batch depleted first
- [ ] GRN partial delivery: only received qty added to stock
- [ ] Waste THEFT: stock not deducted until approved
- [ ] Stock audit: variance shown correctly
- [ ] Production run completes: raw ingredients deducted, output item increased
- [ ] Auto-consumption: complete KOT → ingredients deducted from recipe
- [ ] Low-stock alert appears in notifications when below reorder point
- [ ] Recipe costing shows correct margin %

---

## 7. API Routes Summary

```
GET    /api/v1/inventory/grns
POST   /api/v1/inventory/grns
PATCH  /api/v1/inventory/grns/:id
POST   /api/v1/inventory/grns/:id/confirm

GET    /api/v1/inventory/waste
POST   /api/v1/inventory/waste
POST   /api/v1/inventory/waste/:id/approve

GET    /api/v1/inventory/production-recipes
POST   /api/v1/inventory/production-recipes
PATCH  /api/v1/inventory/production-recipes/:id
POST   /api/v1/inventory/production
PATCH  /api/v1/inventory/production/:id/start
PATCH  /api/v1/inventory/production/:id/complete

POST   /api/v1/inventory/audit
PATCH  /api/v1/inventory/audit/:id/items
POST   /api/v1/inventory/audit/:id/approve

GET    /api/v1/inventory/low-stock
GET    /api/v1/inventory/recipes/:menuItemId/costing
GET    /api/v1/inventory/menu-costing
GET    /api/v1/inventory/batches/:itemId
```

---

## 8. Definition of Done

- [ ] GRN flow: PO → receive → confirm → stock updated
- [ ] FIFO depletion verified with two batches
- [ ] Auto-consumption fires on KOT DONE
- [ ] Waste recorded and approved
- [ ] Production run deducts ingredients and adds output
- [ ] Stock audit records variance and adjusts
- [ ] Recipe costing shows cost + margin per menu item
- [ ] All QA items pass

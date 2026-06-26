# DB-001 — Database Design

| Field          | Value                               |
| -------------- | ----------------------------------- |
| Document ID    | DB-001                              |
| Title          | RestaurantOS — Database Design      |
| Version        | 1.0.0                               |
| Status         | Draft                               |
| Category       | Database Design                     |
| Author         | Vraj Prajapati                      |
| Classification | Confidential — Internal Use Only    |
| Last Updated   | 2026-06-25                          |

---

# 1. Database Philosophy

Every table exists to answer a business question. No table is created for technical convenience alone.

Design principles:
- **Immutability for financial records** — Bills, payments, and audit records are never deleted
- **Soft deletes everywhere** — `deleted_at` instead of `DELETE` for all business entities
- **Audit columns on every table** — `created_at`, `updated_at`, `created_by`, `updated_by`
- **Multi-tenancy by schema** — Each restaurant group has its own PostgreSQL schema
- **Partitioning for time-series** — Bills, orders, and inventory movements partitioned by month

---

# 2. Database Technology Decisions

| Concern | Solution | Rationale |
|---|---|---|
| Primary store | PostgreSQL 16 | ACID, JSON, partitioning, mature |
| Connection pooling | PgBouncer | Handle 10,000+ connections |
| Read replicas | AWS RDS Read Replicas | Reports run on replica, not primary |
| Cache | Redis 7 | Session, rate limits, real-time counters |
| Analytics | TimescaleDB extension | Efficient time-series queries |
| Search | Elasticsearch 8 | Menu search, customer search |
| Migrations | Prisma Migrate | Versioned, reproducible |

---

# 3. Entity Catalog

## 3.1 Platform Schema (Shared — `public`)

| Table | Purpose |
|---|---|
| `tenants` | Restaurant group accounts |
| `tenant_subscriptions` | Subscription plan per tenant |
| `platform_users` | Platform admin and support users |
| `platform_audit_logs` | Platform-level security events |
| `feature_flags` | Feature flag configuration per tenant |
| `api_keys` | Third-party API key management |
| `webhook_endpoints` | Registered outbound webhooks |

## 3.2 Identity Domain

| Table | Purpose |
|---|---|
| `users` | All restaurant staff users |
| `user_profiles` | Profile details, photo, bio |
| `roles` | System and custom role definitions |
| `permissions` | Granular permission list |
| `role_permissions` | Permission to role mapping |
| `user_roles` | User to role assignment |
| `user_outlet_access` | Which outlets a user can access |
| `sessions` | Active user sessions |
| `refresh_tokens` | JWT refresh token store |
| `login_attempts` | Failed login tracking for lockout |
| `password_reset_tokens` | Password reset OTP |
| `two_factor_configs` | 2FA configuration per user |
| `audit_logs` | All user actions (immutable) |

## 3.3 Restaurant Configuration Domain

| Table | Purpose |
|---|---|
| `restaurants` | Restaurant group master |
| `branches` | Individual outlet / location |
| `branch_configs` | Operating hours, tax settings per branch |
| `floors` | Floor definitions per branch |
| `sections` | Section within a floor (indoor, outdoor, bar) |
| `tables` | Individual table definition |
| `table_positions` | Floor plan X/Y coordinates |
| `kitchen_sections` | Kitchen, Bar, Dessert, etc. |
| `printer_configs` | Printer assignment per section |
| `tax_configs` | GST rate configuration |
| `service_charge_configs` | Service charge rules |
| `discount_policies` | Discount limits per role |
| `receipt_templates` | Custom receipt template per branch |

## 3.4 Menu Domain

| Table | Purpose |
|---|---|
| `menu_categories` | Top-level categories |
| `menu_sub_categories` | Nested sub-categories |
| `menu_items` | Individual dish/item master |
| `item_variants` | Size variants per item |
| `item_modifier_groups` | Modifier group (choose spice level) |
| `item_modifiers` | Individual modifier within a group |
| `item_addons` | Add-on items (extra cheese) |
| `combo_meals` | Combo/set meal definitions |
| `combo_items` | Items within a combo |
| `item_recipes` | Link menu item to inventory recipe |
| `item_availability` | Time-based availability rules |
| `item_pricing` | Price history with effective dates |
| `item_images` | Image URLs per item |
| `item_tags` | Veg/Non-veg/Jain/Allergen tags |
| `menu_versions` | Menu version history |
| `happy_hour_configs` | Time-based discount rules |

## 3.5 Order Domain

| Table | Purpose |
|---|---|
| `orders` | Order header (table, channel, status) |
| `order_items` | Line items per order |
| `order_item_modifiers` | Applied modifiers per order item |
| `kots` | Kitchen Order Ticket header |
| `kot_items` | Items per KOT |
| `kot_item_status` | Real-time status per KOT item |
| `order_item_voids` | Void records for cancelled items |
| `order_notes` | Internal notes per order |
| `order_status_history` | Complete status change history |
| `table_sessions` | A table's occupancy session |
| `table_status_history` | Table status change log |
| `waitlist_entries` | Walk-in waitlist |

## 3.6 Billing Domain

| Table | Purpose |
|---|---|
| `bills` | Bill header |
| `bill_items` | Line items on bill |
| `bill_discounts` | Applied discounts with auth |
| `bill_taxes` | GST breakdown per bill |
| `bill_payments` | Payment records per bill |
| `bill_splits` | Split bill sub-bills |
| `bill_loyalty` | Loyalty points applied to bill |
| `payment_transactions` | Raw payment gateway transactions |
| `refunds` | Refund records |
| `refund_items` | Item-level refund details |
| `credit_notes` | GST credit notes |
| `advance_payments` | Pre-collected advances |
| `cash_reconciliations` | Shift-end cash count records |
| `z_reports` | End-of-day billing summaries |

## 3.7 Inventory Domain

| Table | Purpose |
|---|---|
| `inventory_categories` | Stock item categories |
| `inventory_items` | Stock item master |
| `units_of_measure` | KG, Litre, Piece, etc. |
| `uom_conversions` | Conversion factors between units |
| `inventory_stock` | Current stock level per item per outlet |
| `inventory_batches` | Stock batches with expiry date |
| `stock_movements` | Every stock movement (master log) |
| `grns` | Goods Receipt Note header |
| `grn_items` | Items per GRN |
| `stock_indents` | Kitchen/dept stock request |
| `indent_items` | Items per indent |
| `stock_adjustments` | Manual adjustments with reason |
| `stock_transfers` | Inter-branch stock transfers |
| `transfer_items` | Items per transfer |
| `wastage_records` | Wastage entries |
| `wastage_items` | Items per wastage entry |
| `physical_counts` | Audit count header |
| `physical_count_items` | Item count per audit |

## 3.8 Recipe Domain

| Table | Purpose |
|---|---|
| `recipes` | Recipe master (linked to menu item) |
| `recipe_ingredients` | Ingredients per recipe with quantity |
| `recipe_yield` | Yield percentage per step |
| `semi_finished_goods` | Prepared ingredients as stock items |
| `production_orders` | Central kitchen production orders |
| `production_items` | Items produced per production order |
| `recipe_cost_history` | Cost tracking over time |

## 3.9 Procurement Domain

| Table | Purpose |
|---|---|
| `vendors` | Vendor master |
| `vendor_contacts` | Multiple contacts per vendor |
| `approved_vendor_items` | Vendor to item mapping |
| `vendor_rate_cards` | Locked-in pricing per vendor per item |
| `rfqs` | Request for Quotation header |
| `rfq_items` | Items per RFQ |
| `quotations` | Vendor response to RFQ |
| `quotation_items` | Items per quotation |
| `purchase_orders` | PO header |
| `po_items` | Items per PO |
| `po_approvals` | Approval workflow for PO |
| `vendor_invoices` | Received vendor invoice |
| `vendor_invoice_items` | Items per invoice |
| `vendor_payments` | Payments made to vendors |
| `vendor_payment_items` | Invoice-wise payment allocation |

## 3.10 Customer and CRM Domain

| Table | Purpose |
|---|---|
| `customers` | Customer profile master |
| `customer_phones` | Multiple phones per customer |
| `customer_emails` | Multiple emails per customer |
| `customer_preferences` | Dietary, seating, communication prefs |
| `customer_visits` | Visit history linked to bills |
| `customer_spend_summary` | Aggregated spend (denormalized for perf) |
| `customer_tags` | VIP, High-value, Lapsed, etc. |
| `customer_segments` | Segment definitions |
| `customer_segment_members` | Customer to segment mapping |
| `corporate_accounts` | Corporate/company accounts |
| `corporate_members` | Individuals under a corporate |
| `feedback_requests` | Post-visit feedback request |
| `feedbacks` | Customer feedback response |
| `online_reviews` | Aggregated Zomato/Google reviews |

## 3.11 Loyalty Domain

| Table | Purpose |
|---|---|
| `loyalty_programs` | Loyalty program configuration |
| `loyalty_tiers` | Bronze/Silver/Gold tier definitions |
| `loyalty_earn_rules` | Points earning rules |
| `loyalty_accounts` | Customer loyalty account |
| `loyalty_transactions` | Points earned/redeemed history |
| `loyalty_redemptions` | Redemption records |
| `membership_plans` | Monthly/annual membership plans |
| `membership_subscriptions` | Customer subscription to plan |
| `membership_benefits` | Benefits per membership plan |

## 3.12 Delivery Domain

| Table | Purpose |
|---|---|
| `delivery_orders` | Delivery order header |
| `aggregator_orders` | Raw aggregator order data |
| `aggregator_configs` | Aggregator API configuration |
| `aggregator_menus` | Menu pushed to each aggregator |
| `delivery_riders` | Own rider master |
| `delivery_assignments` | Order to rider assignment |
| `delivery_tracking` | GPS tracking points |
| `aggregator_settlements` | Weekly/monthly payout records |
| `settlement_items` | Per-order settlement details |

## 3.13 HR Domain

| Table | Purpose |
|---|---|
| `employees` | Employee master |
| `employee_documents` | Aadhar, PAN, contract, etc. |
| `shifts` | Shift definitions |
| `shift_schedules` | Weekly roster |
| `attendance_records` | Daily attendance |
| `clock_events` | Clock-in/out events |
| `leave_types` | Leave category definitions |
| `leave_balances` | Leave balance per employee |
| `leave_requests` | Leave application |
| `leave_approvals` | Approval flow for leave |

## 3.14 Payroll Domain

| Table | Purpose |
|---|---|
| `salary_structures` | Salary component templates |
| `employee_salaries` | Current salary per employee |
| `payroll_runs` | Monthly payroll batch |
| `payroll_items` | Per-employee payroll calculation |
| `salary_components` | Basic, DA, HRA, allowances |
| `deductions` | PF, ESI, PT, advances |
| `payslips` | Generated payslip records |
| `advances` | Salary advances |

## 3.15 Finance Domain

| Table | Purpose |
|---|---|
| `expense_categories` | Expense classification |
| `expenses` | Individual expense records |
| `expense_approvals` | Approval flow |
| `bank_accounts` | Restaurant bank accounts |
| `bank_transactions` | Bank statement entries |
| `reconciliations` | POS vs. bank reconciliation |
| `p_and_l_snapshots` | Monthly P&L cached snapshots |

## 3.16 Notification Domain

| Table | Purpose |
|---|---|
| `notification_templates` | Template per event type |
| `notification_events` | Triggered notification events |
| `notification_deliveries` | Per-channel delivery status |
| `notification_preferences` | User notification config |
| `whatsapp_templates` | Pre-approved WhatsApp templates |

---

# 4. Key Table Schemas

## 4.1 `bills` (Most Critical Table)

```sql
CREATE TABLE bills (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  outlet_id       UUID        NOT NULL REFERENCES branches(id),
  bill_number     VARCHAR(20) NOT NULL,              -- INV-2026-08234
  order_id        UUID        REFERENCES orders(id),
  table_id        UUID        REFERENCES tables(id),
  channel         VARCHAR(20) NOT NULL,              -- dine_in, takeaway, delivery, aggregator
  status          VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, printed, paid, void, refunded
  cover_count     INT         NOT NULL DEFAULT 1,
  subtotal        BIGINT      NOT NULL DEFAULT 0,    -- in paise (1/100th of rupee)
  discount_amount BIGINT      NOT NULL DEFAULT 0,
  taxable_amount  BIGINT      NOT NULL DEFAULT 0,
  cgst_amount     BIGINT      NOT NULL DEFAULT 0,
  sgst_amount     BIGINT      NOT NULL DEFAULT 0,
  igst_amount     BIGINT      NOT NULL DEFAULT 0,
  service_charge  BIGINT      NOT NULL DEFAULT 0,
  total_amount    BIGINT      NOT NULL DEFAULT 0,
  paid_amount     BIGINT      NOT NULL DEFAULT 0,
  change_amount   BIGINT      NOT NULL DEFAULT 0,
  customer_id     UUID        REFERENCES customers(id),
  customer_gstin  VARCHAR(15),                       -- For B2B invoice
  loyalty_points_earned    INT DEFAULT 0,
  loyalty_points_redeemed  INT DEFAULT 0,
  loyalty_discount_amount  BIGINT DEFAULT 0,
  cashier_id      UUID        NOT NULL REFERENCES users(id),
  void_reason     TEXT,
  void_by         UUID        REFERENCES users(id),
  void_at         TIMESTAMPTZ,
  notes           TEXT,
  metadata        JSONB,                             -- Aggregator order ID, etc.
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID        NOT NULL REFERENCES users(id),
  updated_by      UUID        REFERENCES users(id),
  deleted_at      TIMESTAMPTZ
) PARTITION BY RANGE (created_at);

-- Partition monthly
CREATE TABLE bills_2026_06 PARTITION OF bills
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- Indexes
CREATE INDEX idx_bills_outlet_date    ON bills (outlet_id, created_at DESC);
CREATE INDEX idx_bills_status         ON bills (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bills_customer       ON bills (customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_bills_bill_number    ON bills (outlet_id, bill_number);
CREATE INDEX idx_bills_cashier        ON bills (cashier_id, created_at DESC);
```

**Design Decisions:**
- All amounts stored in **paise** (integer) — no floating point arithmetic for money
- `status` progression: `draft → printed → paid → void`
- Soft delete: `deleted_at` instead of physical delete
- Partitioned by month for query performance at scale
- `metadata` JSONB for aggregator-specific fields without schema changes

---

## 4.2 `orders`

```sql
CREATE TABLE orders (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        NOT NULL REFERENCES tenants(id),
  outlet_id     UUID        NOT NULL REFERENCES branches(id),
  order_number  VARCHAR(20) NOT NULL,
  channel       VARCHAR(20) NOT NULL,    -- dine_in, takeaway, delivery, aggregator
  status        VARCHAR(30) NOT NULL DEFAULT 'open',
                                         -- open, kot_sent, preparing, ready, served, billed, cancelled
  table_id      UUID        REFERENCES tables(id),
  table_session_id UUID     REFERENCES table_sessions(id),
  cover_count   INT         NOT NULL DEFAULT 1,
  customer_id   UUID        REFERENCES customers(id),
  waiter_id     UUID        REFERENCES users(id),
  captain_id    UUID        REFERENCES users(id),
  instructions  TEXT,
  is_priority   BOOLEAN     DEFAULT FALSE,
  source        VARCHAR(30),             -- pos, self_order_qr, kiosk, aggregator
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by    UUID        NOT NULL REFERENCES users(id)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_orders_outlet_status ON orders (outlet_id, status) WHERE status NOT IN ('billed','cancelled');
CREATE INDEX idx_orders_table         ON orders (table_id) WHERE table_id IS NOT NULL;
```

---

## 4.3 `inventory_stock`

```sql
CREATE TABLE inventory_stock (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID    NOT NULL REFERENCES tenants(id),
  outlet_id       UUID    NOT NULL REFERENCES branches(id),
  item_id         UUID    NOT NULL REFERENCES inventory_items(id),
  quantity        DECIMAL(12, 4) NOT NULL DEFAULT 0,  -- 4 decimal places for precision
  unit_id         UUID    NOT NULL REFERENCES units_of_measure(id),
  reorder_point   DECIMAL(12, 4),
  par_stock       DECIMAL(12, 4),
  max_stock       DECIMAL(12, 4),
  last_counted_at TIMESTAMPTZ,
  last_received_at TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_stock_outlet_item UNIQUE (outlet_id, item_id)
);

CREATE INDEX idx_stock_low  ON inventory_stock (outlet_id, item_id)
  WHERE quantity <= reorder_point AND reorder_point IS NOT NULL;
```

---

## 4.4 `stock_movements` (Event Log)

```sql
CREATE TABLE stock_movements (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  outlet_id       UUID        NOT NULL REFERENCES branches(id),
  item_id         UUID        NOT NULL REFERENCES inventory_items(id),
  movement_type   VARCHAR(30) NOT NULL,
                  -- grn_receipt, issue_to_kitchen, auto_deduction, manual_adjustment,
                  -- wastage, transfer_out, transfer_in, opening_stock, physical_count_adjustment
  reference_type  VARCHAR(30),            -- grn, indent, bill, wastage_record, transfer, audit
  reference_id    UUID,
  quantity        DECIMAL(12, 4) NOT NULL,  -- positive = in, negative = out
  unit_id         UUID        NOT NULL,
  cost_per_unit   DECIMAL(12, 4),
  total_cost      DECIMAL(12, 4),
  batch_id        UUID        REFERENCES inventory_batches(id),
  notes           TEXT,
  performed_by    UUID        NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- No updates, no deletes — append-only event log
CREATE INDEX idx_movements_item_date ON stock_movements (outlet_id, item_id, created_at DESC);
```

---

## 4.5 `audit_logs` (Immutable)

```sql
CREATE TABLE audit_logs (
  id              BIGSERIAL   PRIMARY KEY,
  tenant_id       UUID        NOT NULL,
  outlet_id       UUID,
  user_id         UUID        NOT NULL,
  user_name       VARCHAR(100),
  user_role       VARCHAR(50),
  action          VARCHAR(100) NOT NULL,    -- BILL_VOID, DISCOUNT_APPLIED, etc.
  entity_type     VARCHAR(50),
  entity_id       UUID,
  old_value       JSONB,
  new_value       JSONB,
  reason          TEXT,
  ip_address      INET,
  user_agent      TEXT,
  device_id       VARCHAR(100),
  request_id      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Immutable: no UPDATE or DELETE permissions granted on this table
-- Separate tablespace with restricted access
```

---

# 5. Indexing Strategy

## 5.1 Primary Index Rules

- Every foreign key column has an index
- Every `created_at` column on high-volume tables has an index
- Compound indexes: `(outlet_id, status)` > `(status)` alone (always filter by outlet first)
- Partial indexes for active records: `WHERE deleted_at IS NULL`
- Covering indexes for hot query patterns

## 5.2 Critical Index Patterns

```sql
-- Bills: Most common query pattern
CREATE INDEX idx_bills_outlet_date_status
  ON bills (outlet_id, created_at DESC, status)
  WHERE deleted_at IS NULL;

-- Orders: Real-time operations
CREATE INDEX idx_orders_active
  ON orders (outlet_id, status, created_at)
  WHERE status IN ('open', 'kot_sent', 'preparing');

-- Inventory: Low stock alerts
CREATE INDEX idx_stock_below_reorder
  ON inventory_stock (outlet_id)
  WHERE quantity <= reorder_point;

-- Customers: Phone lookup (most common)
CREATE INDEX idx_customer_phone
  ON customers (tenant_id, primary_phone)
  WHERE deleted_at IS NULL;
```

---

# 6. Partitioning Strategy

| Table | Partition By | Strategy | Retention |
|---|---|---|---|
| `bills` | `created_at` | Monthly range | 7 years (GST) |
| `orders` | `created_at` | Monthly range | 2 years |
| `order_items` | `created_at` | Monthly range | 2 years |
| `stock_movements` | `created_at` | Monthly range | 3 years |
| `audit_logs` | `created_at` | Monthly range | 7 years |
| `notification_deliveries` | `created_at` | Monthly range | 1 year |
| `delivery_tracking` | `created_at` | Weekly range | 6 months |

Old partitions are moved to cold storage (AWS S3) via pg_partman for archival.

---

# 7. Data Conventions

| Convention | Rule |
|---|---|
| Primary keys | UUID v4 (`gen_random_uuid()`) — no sequential integers |
| Money amounts | BIGINT in paise — never DECIMAL/FLOAT for currency |
| Timestamps | TIMESTAMPTZ — always with timezone (UTC stored) |
| Status fields | VARCHAR with CHECK constraint or Enum type |
| Soft delete | `deleted_at TIMESTAMPTZ NULL` — filter in queries |
| Audit columns | `created_at`, `updated_at`, `created_by`, `updated_by` on every table |
| Naming | snake_case for tables and columns |
| Table names | Plural (e.g., `orders`, `bills`) |
| Boolean | `is_` prefix (e.g., `is_active`, `is_void`) |
| JSON | JSONB for flexible metadata — never TEXT for structured data |

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial Database Design |

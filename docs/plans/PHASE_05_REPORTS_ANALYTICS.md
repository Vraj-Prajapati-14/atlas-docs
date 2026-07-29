# Phase 5 — Reports & Analytics Pro
**Priority:** 🟠 High | **Estimate:** 2 weeks | **Depends on:** Phase 1, Phase 3

---

## 1. Overview

Atlas currently has 5 reports. Petpooja has 80–100+. This phase adds 30+ professional reports organized by category, a real-time owner dashboard with live KPIs, menu engineering analysis, expense tracking integration, and CSV/PDF export for all reports.

---

## 2. Current vs Target Reports

| Report | Current | Target |
|--------|---------|--------|
| Daily summary | ✅ | Enhanced |
| Items sold | ✅ | Enhanced |
| Payments breakdown | ✅ | Enhanced |
| GST report | ✅ | Enhanced |
| Inventory valuation | ✅ | Enhanced |
| Cashier report | ❌ | ✅ |
| Void/cancellation report | ❌ | ✅ |
| Discount report | ❌ | ✅ |
| Hourly sales | ❌ | ✅ |
| Category-wise sales | ❌ | ✅ |
| Waiter/captain report | ❌ | ✅ |
| Table occupancy | ❌ | ✅ |
| Customer report | ❌ | ✅ |
| Loyalty report | ❌ | ✅ |
| Expense report | ❌ | ✅ |
| Day-end history | ❌ | ✅ |
| Menu engineering | ❌ | ✅ |
| Stock consumption | ❌ | ✅ |
| Waste report | ❌ | ✅ |
| Purchase/GRN report | ❌ | ✅ |
| Online orders report | ❌ | ✅ |
| Coupon usage report | ❌ | ✅ |
| KOT performance | ❌ | ✅ |
| Shift report | ❌ | ✅ |
| Profitability report | ❌ | ✅ |
| Dashboard live view | ❌ | ✅ |

---

## 3. Report Specifications

### 3.1 Owner Dashboard (Live)

The main `/dashboard` page becomes a real-time operations overview.

**Sections:**

**Today's Snapshot (top KPI tiles):**
- Total Orders Today
- Net Revenue Today (vs yesterday %)
- Average Check
- Table Occupancy Rate (occupied tables / total tables %)
- Pending KOTs

**Revenue Chart:**
- Hourly bar chart: revenue by hour for today
- Toggle: Today / Yesterday / Last 7 days

**Live Table Map:**
- Mini floor plan showing occupied/available tables

**Top 5 Items Today:**
- Name, qty sold, revenue

**Pending Actions:**
- Orders awaiting approval (QR orders)
- Low stock alerts
- Pending bills

**Payment Mix (pie chart):**
- Cash / UPI / Card / Wallet breakdown

---

### 3.2 Sales Reports

**Hourly Sales:**
- Revenue, orders, avg check per hour for a given date
- Identifies peak hours
- Export CSV

**Category-wise Sales:**
- Revenue, qty, avg price per menu category
- Date range filter
- Drill down to subcategory

**Cashier/Staff Report:**
- For a date range, per cashier: bills created, total collected, voids, discounts
- Shows "cashier X collected ₹45,200 today"

**Waiter/Captain Report:**
- Per waiter: orders taken, avg check, covers served, tips received
- Helps measure waiter performance

**Shift Report:**
- Summary for a specific time range (e.g. morning shift 9 AM – 4 PM)
- All bills, payments, voids during that shift

---

### 3.3 Void & Discount Reports

**Void Report:**
- All voided bills: bill no., amount, reason, voided by, time
- Total voided amount per period

**Cancellation Report:**
- All cancelled orders: order no., items, reason, cancelled by
- Frequency by category (which items most cancelled)

**Discount Report:**
- Total discount given per period
- By type: flat / coupon / loyalty / manager override
- By cashier (who gave most discounts)
- By item (most discounted items)

**Coupon Usage Report:**
- Per coupon: how many times used, total discount given, avg bill amount
- Conversion rate: how many customers with coupon actually paid

---

### 3.4 Menu Engineering Report

Petpooja's most powerful management report.

**Four quadrants based on popularity + margin:**
- ⭐ **Stars** — high popularity + high margin → promote these
- 🐄 **Cash Cows** — high popularity + low margin → review pricing
- 🤔 **Puzzles** — low popularity + high margin → better marketing
- 🐕 **Dogs** — low popularity + low margin → consider removing

**Data required:**
- qty sold per item (from existing reports)
- cost per item (from recipe costing in Phase 3)
- revenue per item

**API:**
- `GET /api/v1/reports/menu-engineering?from=&to=`

---

### 3.5 Table Occupancy Report

- Average cover time per table (minutes)
- Occupancy rate by time of day
- Revenue per seat hour
- Which tables generate most revenue

---

### 3.6 Customer Analytics

- New vs returning customers (period)
- Top customers by spend
- Customer visit frequency distribution
- Customers by segment count
- Loyalty program effectiveness: points earned vs redeemed

---

### 3.7 Inventory Reports

**Stock Consumption Report:**
- Period: from/to
- Item: qty consumed from sales, from waste, from production
- Cost of goods consumed (COGS)

**Waste Report:**
- Period filter
- By waste type, by item, by staff who recorded
- Total waste value

**Purchase Report:**
- POs created, received, pending
- Spend per supplier
- GRN variance (ordered vs received)

**Profitability Report (Advanced):**
- Revenue – COGS – Expenses = Gross Profit
- Requires: Phase 1 (expenses), Phase 3 (auto-consumption + costing)

---

### 3.8 Online Orders Report

- Orders received per platform (Zomato, Swiggy, etc.)
- Accepted / Rejected / Cancelled rates
- Avg delivery time
- Revenue per platform
- Commission estimate

---

### 3.9 KOT Performance Report

- Avg time from KOT created → DONE (kitchen speed)
- KOTs by status
- Delayed KOTs (> target time)
- Chef performance (if chef assigned)

---

## 4. Report Access by Role

| Report Category | OWNER | MANAGER | CASHIER | INV_MGR |
|-----------------|-------|---------|---------|---------|
| Sales (all) | ✅ | ✅ | ✅ | ❌ |
| Void/Discount | ✅ | ✅ | ❌ | ❌ |
| Staff/Waiter | ✅ | ✅ | ❌ | ❌ |
| Menu Engineering | ✅ | ✅ | ❌ | ❌ |
| Inventory reports | ✅ | ✅ | ❌ | ✅ |
| Customer analytics | ✅ | ✅ | ❌ | ❌ |
| Profitability | ✅ | ✅ | ❌ | ❌ |
| Online orders | ✅ | ✅ | ✅ | ❌ |
| Dashboard | ✅ | ✅ | ❌ | ❌ |

---

## 5. Report Architecture

### API Pattern (consistent across all reports)

All reports follow:
```
GET /api/v1/reports/{report-name}?from=YYYY-MM-DD&to=YYYY-MM-DD&outletId=...
```

Response:
```json
{
  "success": true,
  "data": { ... report-specific payload ... },
  "generatedAt": "ISO timestamp",
  "period": { "from": "...", "to": "..." }
}
```

### Caching Strategy
- Reports cached for 5 minutes with Redis (or in-memory)
- Live dashboard: no cache (or 30-second cache)
- Historical reports: aggressive 1-hour cache

---

## 6. Export System

**CSV Export:** Already implemented for some reports. Standardize.

**PDF Export:**
- Use `@react-pdf/renderer` or browser `window.print()` styled sheet
- Letterhead with restaurant name + logo
- Table formatted for A4

**WhatsApp Export:**
- "Send to WhatsApp" button on day-end report
- Sends formatted text summary to OWNER's WhatsApp via WhatsApp Business API
- Example:
  ```
  Atlas POS — Day End Report
  Date: 2026-07-24
  Total Orders: 47
  Net Revenue: ₹18,450
  Cash: ₹8,200 | UPI: ₹9,000 | Card: ₹1,250
  Voids: 1 (₹380)
  ```

---

## 7. Frontend: Reports Page Redesign

Current reports page has 5 tabs. New structure:

**Left sidebar categories:**
- Sales (Daily, Hourly, Category, Items)
- Staff (Cashier, Waiter, Shift)
- Discounts & Voids
- Customers
- Menu Engineering
- Inventory
- Online Orders
- Financial (Expenses, Profitability)
- GST

**Main area:** selected report with filters + export buttons

---

## 8. New API Routes

```
GET /api/v1/reports/hourly
GET /api/v1/reports/category-sales
GET /api/v1/reports/cashier
GET /api/v1/reports/waiter
GET /api/v1/reports/shift
GET /api/v1/reports/void
GET /api/v1/reports/cancellations
GET /api/v1/reports/discounts
GET /api/v1/reports/coupons
GET /api/v1/reports/menu-engineering
GET /api/v1/reports/table-occupancy
GET /api/v1/reports/customer-analytics
GET /api/v1/reports/loyalty
GET /api/v1/reports/expenses
GET /api/v1/reports/profitability
GET /api/v1/reports/inventory-consumption
GET /api/v1/reports/waste
GET /api/v1/reports/purchase
GET /api/v1/reports/online-orders
GET /api/v1/reports/kot-performance
GET /api/v1/reports/day-closes
GET /api/v1/dashboard/live
```

---

## 9. QA Checklist

- [ ] Hourly report: 24 buckets, totals match daily report
- [ ] Cashier report: cashier A's bills + amount matches filtered billing list
- [ ] Discount report: total from report = sum of all bill discounts in period
- [ ] Menu engineering: items correctly classified into 4 quadrants
- [ ] CSV export: all reports export without truncation
- [ ] CASHIER cannot see waiter/staff report → 403
- [ ] Dashboard live view updates within 60 seconds
- [ ] Profitability: revenue - COGS - expenses = correct gross profit

---

## 10. Definition of Done

- [ ] 25+ report endpoints implemented
- [ ] Dashboard live view shows 5 KPI tiles + hourly chart
- [ ] Menu engineering quadrant view complete
- [ ] CSV export on all reports
- [ ] WhatsApp day-end export working
- [ ] All role restrictions enforced
- [ ] All QA items pass

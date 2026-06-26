# PRD-001 — Product Requirements Document

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| Document ID    | PRD-001                                      |
| Title          | RestaurantOS — Complete Product Requirements |
| Version        | 1.0.0                                        |
| Status         | Draft                                        |
| Category       | Product Requirements                         |
| Author         | Vraj Prajapati                               |
| Classification | Confidential — Internal Use Only             |
| Last Updated   | 2026-06-25                                   |

---

# 1. Product Vision

RestaurantOS is not a POS system. It is the operating system for a restaurant business.

Every module, feature, and screen exists to solve a real business problem. No feature is built because a competitor has it. Every feature exists because a restaurant loses money, time, or customers without it.

---

# 2. Product Principles

1. **Speed over features** — Every user interaction must feel instant. Slow software kills adoption in restaurants.
2. **Offline first** — No internet should never mean no business. Core operations work without connectivity.
3. **Mobile first for owners** — The owner should be able to run their business from their phone.
4. **Zero training for basic operations** — A cashier must be able to bill on day one with no training.
5. **Data integrity over convenience** — No shortcut that compromises financial accuracy will be built.
6. **AI must be actionable** — AI insights are useless unless they tell the user what to DO, not just what happened.

---

# 3. Module Catalog

## Module Overview

| Module ID | Module Name | Priority | Phase |
|---|---|---|---|
| MOD-01 | Identity and Access Management | Critical | v1.0 |
| MOD-02 | Restaurant and Branch Setup | Critical | v1.0 |
| MOD-03 | Menu Management | Critical | v1.0 |
| MOD-04 | Table Management | Critical | v1.0 |
| MOD-05 | Order Management | Critical | v1.0 |
| MOD-06 | Kitchen Management (KDS) | Critical | v1.0 |
| MOD-07 | Billing and Payment | Critical | v1.0 |
| MOD-08 | Inventory Management | Critical | v1.0 |
| MOD-09 | Procurement and Vendor Management | High | v1.0 |
| MOD-10 | Customer and CRM | High | v1.0 |
| MOD-11 | Loyalty and Membership | High | v1.1 |
| MOD-12 | Delivery and Aggregator Integration | High | v1.0 |
| MOD-13 | HR and Attendance | Medium | v1.1 |
| MOD-14 | Payroll | Medium | v1.2 |
| MOD-15 | Finance and Expense Management | High | v1.1 |
| MOD-16 | Reports and Analytics | Critical | v1.0 |
| MOD-17 | AI Decision Engine | High | v1.2 |
| MOD-18 | Notification Center | High | v1.0 |
| MOD-19 | Audit and Compliance | High | v1.1 |
| MOD-20 | Multi-Branch Management | High | v1.1 |
| MOD-21 | Reservation Management | Medium | v1.1 |
| MOD-22 | Feedback Management | Medium | v1.1 |

---

# 4. Module Specifications

## MOD-01: Identity and Access Management

**Purpose:** Control who can access the system, what they can do, and audit every action.

### Features

| Feature ID | Feature | Description |
|---|---|---|
| IAM-001 | User Registration | Create user accounts with email/phone verification |
| IAM-002 | Role Assignment | Assign predefined roles (Owner, Manager, Cashier, etc.) |
| IAM-003 | Custom Role Creation | Create custom roles with granular permissions |
| IAM-004 | Multi-Outlet Access | Grant a user access to multiple outlets |
| IAM-005 | Login (Email + Password) | Secure login with bcrypt hashed passwords |
| IAM-006 | Login (OTP via SMS) | One-time password via SMS for quick login |
| IAM-007 | Login (Biometric) | Fingerprint/face on mobile app |
| IAM-008 | Session Management | JWT tokens with configurable expiry |
| IAM-009 | Password Reset | Secure reset via email or SMS OTP |
| IAM-010 | Account Lockout | Auto-lock after 5 failed attempts |
| IAM-011 | Two-Factor Authentication | Optional 2FA for owner and manager accounts |
| IAM-012 | Permission Override | Temporary permission grant with expiry |
| IAM-013 | User Deactivation | Soft-delete with audit trail preservation |
| IAM-014 | Login Audit Log | Log every login, logout, and failed attempt |
| IAM-015 | Active Session View | Owner can see all active sessions |

---

## MOD-02: Restaurant and Branch Setup

**Purpose:** Configure the restaurant's identity, structure, and operating parameters.

### Features

| Feature ID | Feature | Description |
|---|---|---|
| RST-001 | Restaurant Profile | Name, logo, address, GSTIN, FSSAI, contact |
| RST-002 | Branch Management | Create and manage multiple branches |
| RST-003 | Operating Hours | Set opening/closing times per day per branch |
| RST-004 | Tax Configuration | Configure GST rates by item category |
| RST-005 | Service Charge Setup | Enable/disable, set percentage |
| RST-006 | Discount Policy | Set maximum discount limits per role |
| RST-007 | Currency and Language | INR default, regional language support |
| RST-008 | Receipt Template | Customize receipt header, footer, logo |
| RST-009 | Printer Configuration | Map printers to sections (FOH, Kitchen, Bar) |
| RST-010 | Table Layout Setup | Configure floor plan with table numbers |
| RST-011 | Kitchen Sections | Define Kitchen, Bar, Dessert, etc. as sections |
| RST-012 | Business Hours Validation | Block billing outside configured hours (optional) |

---

## MOD-03: Menu Management

**Purpose:** Maintain the complete menu — items, pricing, recipes, availability, and modifiers.

### Features

| Feature ID | Feature | Description |
|---|---|---|
| MNU-001 | Category Management | Create/edit/delete menu categories |
| MNU-002 | Sub-Category | Nested categories (e.g., Mains > Non-Veg) |
| MNU-003 | Item Creation | Add items with name, description, image, price, GST |
| MNU-004 | Item Variants | Size variants (Small/Medium/Large) with prices |
| MNU-005 | Modifiers | Add-ons (extra cheese, no onion) with prices |
| MNU-006 | Modifier Groups | Group modifiers (choose 1 of: spice level) |
| MNU-007 | Combo / Set Meal | Bundle items with composite pricing |
| MNU-008 | Item Availability Toggle | Mark item as available/unavailable instantly |
| MNU-009 | Time-Based Availability | Item available only at specific times (breakfast) |
| MNU-010 | Happy Hour Pricing | Discounted price during configured time window |
| MNU-011 | Recipe Linking | Link item to recipe for auto inventory deduction |
| MNU-012 | Food Type Tag | Veg / Non-Veg / Vegan / Jain / Gluten-Free |
| MNU-013 | Spice Level | Mark items with spice rating |
| MNU-014 | Allergen Information | Tag allergens per item |
| MNU-015 | Digital Menu (QR) | Auto-generate QR code linking to digital menu |
| MNU-016 | Menu Versioning | Track changes to menu with history |
| MNU-017 | Menu Import/Export | Bulk upload via CSV/Excel |
| MNU-018 | Item Cost Price | Track cost vs. selling price for margin |
| MNU-019 | Menu Publishing | Push menu changes across all aggregators |
| MNU-020 | Seasonal Menu | Activate/deactivate seasonal menu sets |
| MNU-021 | Chef Special | Mark items as Chef's Recommendation |
| MNU-022 | High-Margin Tag | Auto-tag items above target margin (internal) |

---

## MOD-04: Table Management

**Purpose:** Manage physical dining space, table status, and customer seating.

### Features

| Feature ID | Feature | Description |
|---|---|---|
| TBL-001 | Floor Plan Designer | Visual drag-drop floor plan configuration |
| TBL-002 | Real-Time Table Status | Available / Occupied / Reserved / Cleaning / Blocked |
| TBL-003 | Table Assignment | Assign table to waiter/captain |
| TBL-004 | Seat Count per Table | Track covers at each table |
| TBL-005 | Table Merge | Combine adjacent tables for large groups |
| TBL-006 | Table Split | Split one table into two independent orders |
| TBL-007 | Table Transfer | Move an in-progress order to another table |
| TBL-008 | Cover Count Tracking | Number of guests served per shift |
| TBL-009 | Section Management | Assign sections (indoor, outdoor, bar) to staff |
| TBL-010 | Table Timer | Show how long a table has been occupied |
| TBL-011 | Table Reservation Block | Reserve table for upcoming booking |
| TBL-012 | Multi-Floor Support | Manage multiple floors with separate layouts |

---

## MOD-05: Order Management

**Purpose:** Capture and manage all orders from every channel.

### Features

| Feature ID | Feature | Description |
|---|---|---|
| ORD-001 | New Order (Table) | Create order linked to a table |
| ORD-002 | New Order (Takeaway) | Create takeaway order with token |
| ORD-003 | New Order (Delivery) | Create delivery order with address |
| ORD-004 | Self-Order (QR) | Customer scans QR and orders from phone |
| ORD-005 | Item Search | Quickly find items by name |
| ORD-006 | Modifier Selection | Add modifiers per item during order |
| ORD-007 | Special Instructions | Free-text note per item to kitchen |
| ORD-008 | Quantity Change | Add or reduce quantities after order |
| ORD-009 | Item Void | Remove item from open order (with authorization) |
| ORD-010 | KOT Send | Submit order to kitchen/bar |
| ORD-011 | Multiple KOTs | Send multiple rounds to kitchen for same table |
| ORD-012 | Order Hold | Place order on hold temporarily |
| ORD-013 | Course Management | Send items as courses (starters now, mains later) |
| ORD-014 | Order Status Tracking | Live status: Pending → Cooking → Ready → Served |
| ORD-015 | 86 List (Out of Stock) | Instantly mark item as unavailable and alert waiters |
| ORD-016 | Repeat Last Order | One-tap repeat of customer's previous order |
| ORD-017 | Suggested Items | Upsell suggestions based on order context |
| ORD-018 | Order Notes | Internal notes per order (VIP, allergy) |
| ORD-019 | Cover Count Update | Update number of guests at table |
| ORD-020 | Order Transfer to Staff | Reassign order to another waiter |

---

## MOD-06: Kitchen Management (KDS)

**Purpose:** Replace paper KOTs with a digital display system for the kitchen.

### Features

| Feature ID | Feature | Description |
|---|---|---|
| KDS-001 | KOT Display | Show all active orders on screen |
| KDS-002 | Order Timer | Timer per KOT from submission time |
| KDS-003 | Priority Colors | Green/Yellow/Red based on wait time |
| KDS-004 | Station Routing | Route items to correct station (grill, pantry, etc.) |
| KDS-005 | Item Acknowledge | Chef marks individual items as "in progress" |
| KDS-006 | KOT Complete | Mark all items ready, notify runner |
| KDS-007 | KOT Recall | Recall a completed ticket if needed |
| KDS-008 | Order Priority Override | Manually move ticket to top of queue |
| KDS-009 | Bump to Complete | Swipe to complete on touchscreen |
| KDS-010 | Kitchen Performance Report | Avg prep time per item, per chef, per shift |
| KDS-011 | Tablet and TV Display | Support 7-inch tablet and 42-inch TV display |
| KDS-012 | Audio Alert | Sound alert for new KOT |
| KDS-013 | Special Instructions Highlight | Visually highlight allergy/special requests |
| KDS-014 | Multi-Kitchen Support | Separate KDS for main kitchen, grill, bar |

---

## MOD-07: Billing and Payment

**Purpose:** Generate accurate, GST-compliant invoices and process payments.

### Features

| Feature ID | Feature | Description |
|---|---|---|
| BIL-001 | Generate Bill | Convert open order to bill |
| BIL-002 | Item-Wise GST | Apply correct GST rate per item |
| BIL-003 | Composite Tax Display | Show CGST + SGST / IGST breakdown |
| BIL-004 | Service Charge | Apply configurable service charge |
| BIL-005 | Discount (Amount) | Apply flat amount discount |
| BIL-006 | Discount (Percentage) | Apply percentage discount |
| BIL-007 | Coupon Code | Validate and apply coupon |
| BIL-008 | Complimentary | Mark bill as complimentary (authorized) |
| BIL-009 | Loyalty Redemption | Deduct loyalty points from bill |
| BIL-010 | Split Bill (Equal) | Divide bill equally among X people |
| BIL-011 | Split Bill (By Item) | Each person pays for selected items |
| BIL-012 | Split Bill (Custom) | Manual split with custom amounts |
| BIL-013 | Cash Payment | Record cash amount, calculate change |
| BIL-014 | Card Payment | Integrate card terminal |
| BIL-015 | UPI Payment | Generate QR, confirm payment via webhook |
| BIL-016 | Digital Wallet | Paytm, PhonePe integration |
| BIL-017 | Multi-Mode Payment | Partial cash + partial UPI in one bill |
| BIL-018 | Room Charge | Post to hotel room (hotel integration) |
| BIL-019 | Credit Account | Post to customer credit account |
| BIL-020 | Advance Deduction | Deduct pre-collected advance from bill |
| BIL-021 | Print Receipt | Thermal printer with configurable template |
| BIL-022 | WhatsApp Receipt | Auto-send receipt via WhatsApp |
| BIL-023 | Email Receipt | Send receipt via email |
| BIL-024 | Duplicate Bill Print | Reprint bill marked as duplicate |
| BIL-025 | Bill Void | Cancel bill with manager auth + reason |
| BIL-026 | Bill Hold | Park a bill to process later |
| BIL-027 | KOT Note on Bill | Print kitchen notes on customer receipt |
| BIL-028 | Tip Recording | Record tip amount (cash or digital) |
| BIL-029 | GST Invoice (B2B) | Include buyer GSTIN on invoice |
| BIL-030 | Proforma Invoice | Advance estimate for events |
| BIL-031 | Bill History | Search and view any past bill |
| BIL-032 | Offline Billing | Full billing capability without internet |
| BIL-033 | Bill Sync | Sync offline bills when connectivity restores |
| BIL-034 | Day-End Z Report | Shift-end billing summary |
| BIL-035 | Refund Processing | Issue full or partial refund with audit |
| BIL-036 | GST Credit Note | Issue credit note for returns/refunds |
| BIL-037 | Aggregator Bill | Special bill format for Zomato/Swiggy orders |

---

## MOD-08: Inventory Management

**Purpose:** Track every gram of stock from receipt to consumption.

### Features

| Feature ID | Feature | Description |
|---|---|---|
| INV-001 | Item Master | Create inventory items with unit, category, HSN |
| INV-002 | Unit of Measure | KG, Litre, Piece, Dozen, etc. with conversions |
| INV-003 | Category / Sub-Category | Organize inventory (Produce, Dairy, Beverage) |
| INV-004 | Opening Stock Entry | Set opening balance for new outlet |
| INV-005 | GRN (Goods Receipt Note) | Record received stock with PO reference |
| INV-006 | Stock Issue Indent | Kitchen requests stock from store |
| INV-007 | Auto-Deduction from Sales | Recipe-based deduction per item sold |
| INV-008 | Manual Adjustment | Correct stock with reason code |
| INV-009 | Wastage Entry | Record waste with category and reason |
| INV-010 | Stock Transfer | Move stock between branches |
| INV-011 | Physical Count | Enter physical count, view system vs. actual |
| INV-012 | Variance Report | System stock vs. physical count analysis |
| INV-013 | Par Stock (Minimum Level) | Set minimum stock per item |
| INV-014 | Reorder Point Alert | Alert when stock crosses reorder level |
| INV-015 | Maximum Stock Level | Alert on overstocking |
| INV-016 | Expiry Date Tracking | Track expiry per batch, alert before expiry |
| INV-017 | FIFO Enforcement | Consume oldest batch first |
| INV-018 | Batch / Lot Number | Track items by delivery batch |
| INV-019 | Barcode / QR Scan | Scan item barcode for GRN and issue |
| INV-020 | Stock Report | Current stock levels by category/item |
| INV-021 | Consumption Report | Actual vs. theoretical consumption |
| INV-022 | Wastage Report | Wastage by item, by reason, by date |
| INV-023 | Stock Value Report | Current inventory value at cost |
| INV-024 | Recipe Management | Define recipes linking menu items to inventory |
| INV-025 | Recipe Costing | Auto-calculate item cost from recipe |
| INV-026 | Recipe Yield Management | Track yield loss in preparation |
| INV-027 | Semi-Finished Goods | Track prepared ingredients (e.g., gravy base) |
| INV-028 | Central Kitchen Issue | Track stock issued from central kitchen |

---

## MOD-09: Procurement and Vendor Management

### Features

| Feature ID | Feature | Description |
|---|---|---|
| PUR-001 | Vendor Master | Vendor profile, contact, GSTIN, bank details |
| PUR-002 | Approved Vendor List | Control which vendors staff can order from |
| PUR-003 | Vendor Rate Card | Lock in rates per item per vendor |
| PUR-004 | Request for Quotation (RFQ) | Send RFQ to multiple vendors, compare |
| PUR-005 | Purchase Order Creation | Create PO with items, quantities, rates |
| PUR-006 | PO Approval Workflow | Route PO for approval above value threshold |
| PUR-007 | PO Sharing | Send PO to vendor via WhatsApp/email |
| PUR-008 | Auto-PO Generation | Auto-create PO when stock hits reorder point |
| PUR-009 | PO Receiving (GRN) | Link GRN to PO for three-way match |
| PUR-010 | Partial Delivery | Handle partial fulfillment of PO |
| PUR-011 | Vendor Invoice | Record vendor invoice against GRN |
| PUR-012 | Three-Way Match | PO qty = GRN qty = Invoice qty validation |
| PUR-013 | Vendor Payment | Record and schedule payment to vendor |
| PUR-014 | Payment History | Full payment history per vendor |
| PUR-015 | Price Variance Alert | Alert if received price differs from PO price |
| PUR-016 | Vendor Performance Report | On-time delivery, quality rejection rate |
| PUR-017 | Pending Payables | Report of amounts owed to vendors |

---

## MOD-10: Customer and CRM

### Features

| Feature ID | Feature | Description |
|---|---|---|
| CRM-001 | Customer Profile | Name, phone, email, birthday, anniversary |
| CRM-002 | Auto-Capture from Billing | Create/update profile on every transaction |
| CRM-003 | Visit History | Complete visit and order history |
| CRM-004 | Spend Analysis | Total spend, avg per visit, frequency |
| CRM-005 | Dietary Preferences | Store preferences (no onion, allergies) |
| CRM-006 | Customer Tags | VIP, High-Value, Lapsed, New, Feedback-Pending |
| CRM-007 | Customer Search | Search by name, phone, or email |
| CRM-008 | Customer Merge | Merge duplicate profiles |
| CRM-009 | Corporate Account | Group individual contacts under corporate entity |
| CRM-010 | Birthday / Anniversary Alert | Alert staff before special occasion |
| CRM-011 | WhatsApp Communication | Send messages directly from CRM |
| CRM-012 | Customer Segment Builder | Build segments by RFM, spend, visit frequency |
| CRM-013 | Campaign Sending | Send targeted offers to segments |
| CRM-014 | Win-Back Campaign | Auto-trigger offer to lapsed customers |
| CRM-015 | Feedback Collection | Post-visit feedback request via WhatsApp |
| CRM-016 | Feedback Response | Respond to customer feedback in-app |
| CRM-017 | Online Review Monitoring | Aggregate Zomato and Google reviews |

---

## MOD-11: Loyalty and Membership

### Features

| Feature ID | Feature | Description |
|---|---|---|
| LOY-001 | Loyalty Enrollment | Enroll customer during billing |
| LOY-002 | Points Earning Rules | Configurable earn rate (₹X = Y points) |
| LOY-003 | Category Multipliers | 2x points on specific categories |
| LOY-004 | Points Redemption | Redeem points at billing |
| LOY-005 | Redemption Rules | Minimum balance, max redemption % |
| LOY-006 | Points Expiry | Auto-expire with reminder notification |
| LOY-007 | Tier System | Bronze / Silver / Gold tiers with benefits |
| LOY-008 | Tier Upgrade / Downgrade | Auto-adjust tier based on spend |
| LOY-009 | Bonus Points Events | Extra points during promotions |
| LOY-010 | Referral Program | Points for referring new customers |
| LOY-011 | Membership Plans | Monthly/annual subscriptions with benefits |
| LOY-012 | Member Benefits | Free items, discounts, priority seating |
| LOY-013 | Digital Loyalty Card | QR code on phone |
| LOY-014 | Points History | Full transaction history per customer |
| LOY-015 | Loyalty Dashboard | Enrollment rate, redemption rate, liability |

---

## MOD-12: Delivery and Aggregator Integration

### Features

| Feature ID | Feature | Description |
|---|---|---|
| DEL-001 | Zomato Integration | Receive and manage Zomato orders |
| DEL-002 | Swiggy Integration | Receive and manage Swiggy orders |
| DEL-003 | Magicpin Integration | Receive Magicpin orders |
| DEL-004 | Own Delivery Platform | Accept orders from own app/website |
| DEL-005 | Order Auto-Accept | Auto-accept aggregator orders |
| DEL-006 | Order Display (All Channels) | Unified view of all delivery orders |
| DEL-007 | Delivery KOT | Special KOT with delivery details |
| DEL-008 | Packaging Instructions | Notes per item for packaging staff |
| DEL-009 | Label Printing | Print delivery label with order details |
| DEL-010 | Rider Assignment | Assign own rider to delivery |
| DEL-011 | Rider Tracking | GPS tracking for own riders |
| DEL-012 | Delivery Time Estimate | Real-time ETA to customer |
| DEL-013 | Aggregator Menu Sync | Push menu changes to all platforms |
| DEL-014 | Aggregator Price Overrides | Different pricing for aggregator vs dine-in |
| DEL-015 | Aggregator Settlement | Reconcile weekly/monthly aggregator payouts |
| DEL-016 | Delivery Analytics | Revenue by platform, cancellation rate, ratings |
| DEL-017 | Menu Throttling | Pause specific items on specific platforms |
| DEL-018 | Platform On/Off Switch | Turn platform on/off instantly |

---

## MOD-16: Reports and Analytics

### Report Categories

**Sales Reports**
| Report | Description |
|---|---|
| Daily Sales Summary | Revenue by category, payment mode, channel |
| Hourly Sales | Revenue breakdown by hour |
| Item Sales Report | Quantity and revenue by item |
| Category Sales | Revenue by category |
| Waiter Performance | Sales per waiter, upsell rate |
| Channel Report | Dine-in vs Takeaway vs Delivery split |

**Financial Reports**
| Report | Description |
|---|---|
| P&L Summary | Revenue, COGS, gross profit, expenses, net profit |
| Cash Flow | Daily cash inflows and outflows |
| Discount Report | Total discounts by type, by user, by date |
| Void Report | All voided bills with reasons |
| Refund Report | All refunds with original bill reference |
| Tax Summary (GST) | GST collected by rate slab |
| Expense Summary | Expenses by category |

**Inventory Reports**
| Report | Description |
|---|---|
| Current Stock | Real-time stock levels |
| Consumption Report | Actual vs. theoretical consumption |
| Variance Report | System vs. physical count |
| Wastage Report | By item, reason, staff |
| Stock Value Report | Inventory value at current cost |
| Low Stock Alert | Items below reorder point |

**Customer Reports**
| Report | Description |
|---|---|
| Customer Database | All customers with spend data |
| Repeat Visit Analysis | Visit frequency distribution |
| Loyalty Report | Enrollment, points issued, redeemed |
| Feedback Summary | Rating distribution and comments |

---

# 5. Non-Functional Requirements

## 5.1 Performance

| Requirement | Target |
|---|---|
| POS billing screen load time | < 1.5 seconds |
| KOT transmission to kitchen | < 500ms |
| Report generation (daily) | < 3 seconds |
| Report generation (monthly) | < 10 seconds |
| Search results (menu, customer) | < 300ms |
| API response time (p95) | < 500ms |
| API response time (p99) | < 1500ms |
| Dashboard data freshness | Near-real-time (< 30 seconds) |

## 5.2 Availability

| Requirement | Target |
|---|---|
| Billing module uptime | 99.95% (< 4.4 hours/year downtime) |
| Full platform uptime | 99.9% |
| Planned maintenance window | Sundays 2 AM – 4 AM IST |
| Offline billing capability | Minimum 72 hours without server |

## 5.3 Scalability

| Tier | Target |
|---|---|
| Concurrent users per outlet | 50 |
| Concurrent orders per outlet | 200 |
| Total platform concurrent users | 100,000 |
| Total restaurants on platform | 1,000,000 |
| Bills processed per day | 50,000,000 |

## 5.4 Security

- All data encrypted in transit (TLS 1.3)
- All sensitive data encrypted at rest (AES-256)
- PII masked in logs
- OWASP Top 10 mitigated
- SOC 2 Type II readiness

## 5.5 Compliance

- GST-compliant invoice generation
- FSSAI hygiene record keeping
- PCI-DSS for payment data
- Data residency: India (AWS ap-south-1 primary)

## 5.6 Usability

- New cashier should be able to generate first bill within 10 minutes
- All critical workflows achievable on mobile (6-inch screen)
- Support for English, Hindi, and regional languages (phase 2)
- Accessibility: WCAG 2.1 AA for web

---

# 6. Integration Requirements

| Integration | Type | Priority |
|---|---|---|
| Zomato | Order integration | Critical |
| Swiggy | Order integration | Critical |
| Razorpay | Payment gateway | Critical |
| Paytm | Payment gateway | High |
| Cashfree | Payment gateway | High |
| WhatsApp Business API | Messaging | Critical |
| GSTN API | GST verification | High |
| SMS Gateway (MSG91) | Notifications | High |
| Biometric devices | Attendance | Medium |
| Weighing scales | Weight-based billing | Medium |
| Receipt printers (ESC/POS) | Printing | Critical |
| KDS screens | Kitchen display | Critical |

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial PRD |

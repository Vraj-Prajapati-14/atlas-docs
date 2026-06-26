# DOM-106 — Restaurant Roles and Responsibilities

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Document ID    | DOM-106                                |
| Title          | Restaurant Roles and Responsibilities  |
| Version        | 1.0.0                                  |
| Status         | Draft                                  |
| Category       | Domain Research                        |
| Owner          | Product Team                           |
| Repository     | atlas-docs                             |
| Classification | Internal                               |
| Last Updated   | 2026-06-25                             |

---

# 1. Purpose

This document defines every human actor who interacts with a restaurant — either as staff, owner, customer, vendor, or external authority.

For software design, roles are critical because:

* Every role has distinct screens and workflows
* Every role has distinct permissions
* Every role has distinct reporting needs
* Every role has distinct pain points that software should solve

If software is designed for the owner only, staff will not use it. If designed for cashiers only, owners will not trust it.

Project Atlas must serve every role, at the right depth, without overwhelming them.

---

# 2. Role Directory

## 2.1 Restaurant Owner / Proprietor

**Department:** Management

**Reports To:** Self (or Board of Directors in corporate structure)

**Overview**

The owner is the primary decision-maker and financial risk-taker. They may be present daily in smaller restaurants or operate remotely in larger chains.

**Primary Responsibilities**

* Define business strategy and direction
* Monitor financial performance
* Approve major purchases and expenses
* Hire and terminate senior staff
* Negotiate vendor contracts
* Monitor compliance and audits
* Approve pricing and menu changes
* Review KPIs and take corrective action

**Daily Routine**

* Morning: Review overnight/previous-day sales report
* Midday: Address operational issues raised by managers
* Evening: Review daily collections and cash reconciliation
* End of day: Receive WhatsApp summary report

**KPIs the Owner Monitors**

* Daily, weekly, monthly revenue
* Net profit margin
* Food cost % and labor cost %
* Same-store sales growth
* Cash discrepancy
* Customer ratings and feedback
* Inventory variance

**Pain Points**

* Cannot trust reports without auditing manually
* No real-time visibility when away from the restaurant
* Staff takes advantage when owner is absent
* Cannot compare performance across branches easily
* Discount and void abuse by cashiers

**Software Permissions (Atlas)**

* Full access to all modules and reports
* Can view all branches simultaneously
* Can approve or reject high-value operations
* Receives automated daily summary via WhatsApp/email
* Can set system-wide rules and limits

---

## 2.2 Business Partner

**Department:** Management

**Reports To:** Co-owner agreement

**Overview**

A co-owner who shares financial stakes and may own specific operational responsibilities.

**Responsibilities**

* May be assigned specific domain: operations, finance, marketing
* Reviews financial reports
* Has authority over their assigned area

**Software Permissions (Atlas)**

* Configurable by agreement with owner
* May have full access or restricted to assigned domain
* Separate login with audit trail

---

## 2.3 General Manager / Restaurant Manager

**Department:** Management

**Reports To:** Owner

**Overview**

The General Manager is responsible for the entire restaurant's day-to-day operations. In the owner's absence, the GM is the primary authority.

**Primary Responsibilities**

* Oversee all departments (FOH, BOH, Inventory, Finance)
* Manage staff scheduling and performance
* Resolve customer escalations
* Approve discounts, voids, and refunds within limits
* Ensure opening and closing procedures are followed
* Review daily reports and brief the owner
* Maintain compliance with food safety and labor laws

**Daily Routine**

* Pre-opening: Staff briefing, check cleanliness, review reservations
* During service: Floor rounds, monitor wait times, resolve issues
* Post-service: Review sales, cash close, generate end-of-day report
* End of day: Audit issues report to owner

**KPIs**

* Revenue vs. target
* Customer wait time
* Staff attendance rate
* Cash discrepancy
* Customer complaint rate
* Table turnover

**Pain Points**

* Lacks real-time visibility across all systems simultaneously
* Staff problems escalated to them without context
* Approving discounts manually at the POS terminal is inefficient
* No clear audit trail for decisions made during shift

**Software Permissions (Atlas)**

* Full access to all outlet-level modules
* Can approve voids, refunds, discounts up to defined limit
* Cannot access owner-level financial settings
* Receives shift summary report

---

## 2.4 Branch Manager

**Department:** Management

**Reports To:** Owner or Area Manager

**Overview**

Responsible for one outlet in a multi-branch chain. Similar to GM but scoped to one location.

**Primary Responsibilities**

* All GM responsibilities scoped to their branch
* Enforce brand standards set by corporate or owner
* Manage local vendor relationships
* Submit daily/weekly reports to area or central management

**Software Permissions (Atlas)**

* Full access to their branch
* Cannot view other branches' data
* Can view reports for their branch only
* Has approval authority within branch-defined limits

---

## 2.5 Floor Manager / Duty Manager

**Department:** Front of House

**Reports To:** General Manager

**Overview**

Manages the dining room during a service shift. Ensures guest experience standards are met.

**Primary Responsibilities**

* Supervise waitstaff during service
* Monitor table turnovers
* Handle guest complaints immediately
* Assign sections to waitstaff
* Ensure cleanliness and ambiance standards
* Coordinate with kitchen on order timings
* Authorize table-level discounts within limits

**Daily Routine**

* Pre-service: Brief staff, assign sections, check table setups
* During service: Floor walks, handle guest issues, manage wait list
* Post-service: Debrief staff, submit shift report

**KPIs**

* Guest satisfaction score
* Service time per table
* Complaint resolution time
* Upsell rate per waiter per shift

**Software Permissions (Atlas)**

* View current table status for entire floor
* Manage waitlist and table assignments
* Access shift sales summary
* Authorize discounts up to defined limit
* Cannot access inventory or finance modules

---

## 2.6 Captain / Senior Waiter

**Department:** Front of House

**Reports To:** Floor Manager

**Overview**

A captain is a senior server responsible for a section (group of tables) and may lead a team of waiters.

**Primary Responsibilities**

* Greet guests at section tables
* Take orders and make recommendations
* Supervise junior waiters in the section
* Communicate special requests to kitchen
* Ensure timely food delivery
* Present the bill and handle payment
* Upsell starters, beverages, and desserts

**Daily Routine**

* Pre-service: Polish cutlery, check section setup, memorize specials
* During service: Order taking, food service, guest interaction
* Post-service: Assist with section cleanup, shift handover

**KPIs**

* Average order value per cover in their section
* Order accuracy rate
* Guest feedback score
* Upsell conversion (added dessert, drink)

**Pain Points**

* Multi-table management mentally taxing without a system
* KOT lost in transit to kitchen
* Cannot quickly check bill status for customers asking for the bill
* Modifier/special instructions not communicated correctly

**Software Permissions (Atlas)**

* Create, modify, and send KOT for their section
* View table status for their section
* View bill summary for their section
* Cannot void bills without manager approval
* Cannot see other sections' KOTs

---

## 2.7 Waiter / Server

**Department:** Front of House

**Reports To:** Captain or Floor Manager

**Overview**

The primary point of contact between customer and restaurant during the meal.

**Primary Responsibilities**

* Greet and seat customers at assigned tables
* Present menu and take orders
* Enter orders into POS (digital KOT)
* Serve food in correct order (starters, mains, desserts)
* Refill beverages proactively
* Handle customer requests
* Present bill when requested
* Collect payment

**Daily Routine**

* Setup assigned tables (cutlery, napkins, condiments)
* Take orders from first customers of shift
* Continuous floor movement throughout service
* Clear tables after customer departure
* End of shift: Close open tables, handover to next shift

**KPIs**

* Order accuracy
* Average service time
* Tip amount (where applicable)
* Upsell orders per shift

**Pain Points**

* Writing orders on paper leads to mistakes
* Kitchen sends incorrect items and waiter faces customer anger
* No clear alert when food is ready at pass
* Cannot answer customer questions about estimated wait time
* Multiple table requests simultaneously

**Software Permissions (Atlas)**

* Create KOT for their assigned tables
* View order status (sent, in progress, ready)
* Call bill (request cashier to generate bill)
* Cannot modify price or apply discount
* Cannot void items without supervisor approval

---

## 2.8 Cashier / Billing Executive

**Department:** Finance / Front of House

**Reports To:** General Manager or Finance Manager

**Overview**

The cashier manages all billing transactions and cash at the restaurant. This is a high-accountability role — every rupee flows through here.

**Primary Responsibilities**

* Generate bills from POS
* Apply discounts and coupons with authorization
* Accept all payment modes (cash, card, UPI, wallet)
* Provide receipts (print, digital, WhatsApp)
* Manage cash drawer throughout shift
* Reconcile cash at shift end
* Process refunds with manager approval
* Handle loyalty point redemption
* Manage advance payments and deposits
* Handle split bills, merged bills, and partial payments

**Daily Routine**

* Shift start: Receive opening cash balance, verify float
* During shift: Process all bills, accept payments
* Shift end: Count cash, reconcile with system total, submit cash to manager

**KPIs**

* Cash reconciliation variance (target: zero)
* Average billing time per table
* Discount amount vs. authorized limit
* Number of voids per shift (high voids = suspicious)
* Number of refunds processed

**Pain Points**

* Internet down prevents card payments — need offline mode
* Customer disputes bill — needs quick item-level review
* Multiple payment modes in one bill (cash + UPI)
* Printer jams during busy service
* Manager required to approve every discount — causes delays
* Cash counting errors at end of shift

**Software Permissions (Atlas)**

* Generate bills
* Apply pre-authorized discount types only
* Accept all payment modes
* Generate and print/share receipts
* View own shift report
* Cannot see full P&L or financial reports
* Cannot delete or void bills without manager authorization

---

## 2.9 Host / Hostess

**Department:** Front of House

**Reports To:** Floor Manager

**Overview**

Manages the entrance — greets guests, manages reservations, handles the waitlist, and assigns tables.

**Primary Responsibilities**

* Welcome guests at the entrance
* Check reservation status
* Manage walk-in waitlist
* Assign available tables based on party size
* Communicate wait times accurately
* Coordinate with floor manager for table availability

**Software Permissions (Atlas)**

* View reservation calendar
* Manage walk-in waitlist
* View table status (available, occupied, reserved, cleaning)
* Assign tables to parties
* Cannot take orders or generate bills

---

## 2.10 Head Chef / Executive Chef

**Department:** Kitchen

**Reports To:** General Manager / Owner

**Overview**

The creative and operational leader of the kitchen. Responsible for food quality, kitchen team performance, recipe standards, and food cost management.

**Primary Responsibilities**

* Design and update menus
* Define standard recipes and portion sizes
* Oversee all kitchen staff and stations
* Manage food cost percentage
* Handle vendor quality issues
* Train kitchen staff
* Ensure hygiene and safety compliance (FSSAI)
* Plan prep for upcoming service
* Monitor wastage and suggest reductions

**Daily Routine**

* Pre-service: Review reservations and expected covers, brief sous chef, check inventory levels
* During service: Quality check at pass, manage ticket timing, resolve kitchen bottlenecks
* Post-service: Review wastage report, update prep list for next day, debrief team

**KPIs**

* Food cost percentage
* Food wastage percentage
* Kitchen throughput per hour
* Order accuracy rate
* Recipe adherence percentage
* Dish-level profitability

**Pain Points**

* No real-time view of stock before service begins
* Recipe costing is manual and outdated
* Wastage not tracked — cannot identify problem areas
* Staff leaving mid-shift
* No KPI visibility to compare their kitchen against benchmarks

**Software Permissions (Atlas)**

* View inventory levels
* Manage and update recipes
* View wastage reports
* View kitchen performance reports
* Cannot access billing or customer data

---

## 2.11 Sous Chef

**Department:** Kitchen

**Reports To:** Head Chef

**Overview**

Second-in-command in the kitchen. Executes the Head Chef's direction and manages service when the Head Chef is absent.

**Primary Responsibilities**

* Oversee specific kitchen sections during service
* Ensure prep is complete before service
* Manage line cooks during rush
* Maintain recipe standards
* Monitor food going out for quality

**Software Permissions (Atlas)**

* View KOT queue
* Record wastage
* View recipe cards
* View inventory alerts

---

## 2.12 Inventory Manager / Store Keeper

**Department:** Inventory and Stores

**Reports To:** General Manager or Purchase Manager

**Overview**

Owns all physical stock in the restaurant. Every item that enters or leaves the store goes through this role.

**Primary Responsibilities**

* Receive deliveries and complete GRN
* Verify quantity and quality of received goods
* Store items correctly (temperature, FIFO)
* Issue stock to kitchen on approved indent
* Conduct regular stock counts
* Report discrepancies to management
* Raise indent / purchase request when stock is low
* Record wastage, breakage, and expiry

**Daily Routine**

* Morning: Receive vendor deliveries, process GRN
* Midday: Issue stock to kitchen for prep
* Evening: Review low-stock alerts, create purchase request
* End of day: Reconcile issues with kitchen consumption

**KPIs**

* Inventory accuracy percentage
* Variance between theoretical consumption (from bills) and physical consumption
* Number of stockouts
* GRN processing time
* Wastage percentage

**Pain Points**

* Paper GRN leads to errors and disputes
* Cannot see what was ordered (PO) while receiving delivery
* Physical count is tedious and done infrequently
* Kitchen uses stock without requesting indent — creates discrepancy
* Expiry items not identified in time

**Software Permissions (Atlas)**

* Create and approve GRN
* Issue stock via indent
* Record wastage and adjustments
* Conduct stock audit
* View purchase orders to match against deliveries
* Cannot view billing or customer data

---

## 2.13 Purchase Manager

**Department:** Procurement

**Reports To:** General Manager or Owner

**Overview**

Responsible for sourcing and purchasing all materials required by the restaurant.

**Primary Responsibilities**

* Maintain approved vendor list
* Obtain competitive quotations
* Create purchase orders
* Track delivery and resolve vendor issues
* Negotiate pricing and payment terms
* Process vendor invoices

**KPIs**

* Price variance vs. approved rate
* Vendor delivery accuracy
* Stockouts attributable to procurement failure
* Savings achieved through negotiation

**Software Permissions (Atlas)**

* Create and modify purchase orders
* Manage vendor master
* View inventory stock levels and reorder alerts
* View vendor invoice history
* Cannot access billing or employee data

---

## 2.14 Accountant / Finance Executive

**Department:** Finance and Accounts

**Reports To:** General Manager or Owner

**Overview**

Manages the restaurant's books — income, expenses, taxes, and payments.

**Primary Responsibilities**

* Daily revenue reconciliation
* Record all expenses
* Process vendor payments
* GST invoice generation and filing support
* Payroll verification
* Bank reconciliation
* Month-end closing and P&L preparation
* Audit support

**KPIs**

* Revenue reconciliation accuracy
* Cash discrepancy
* GST filing timeliness
* Expense vs. budget variance
* Days payable outstanding

**Software Permissions (Atlas)**

* View all financial reports
* Record expenses
* View and export invoices
* Access payroll data
* Cannot modify bills or void transactions
* Cannot change menu prices

---

## 2.15 HR Manager

**Department:** Human Resources

**Reports To:** General Manager or Owner

**Overview**

Manages the complete employee lifecycle.

**Primary Responsibilities**

* Recruitment and onboarding
* Attendance and leave management
* Payroll processing
* Performance reviews
* Labor law compliance (PF, ESI, gratuity)
* Termination and exit management

**Software Permissions (Atlas)**

* Full access to HR module
* View attendance records for all staff
* Process payroll
* Manage employee documents
* Cannot access billing or inventory data

---

## 2.16 Marketing Executive

**Department:** Marketing

**Reports To:** Marketing Manager or GM

**Overview**

Executes marketing campaigns and manages customer engagement.

**Primary Responsibilities**

* Plan and execute promotions and offers
* Manage loyalty and membership programs
* Coordinate with aggregator platforms
* Monitor online reviews and respond
* Analyze customer data for campaign targeting

**Software Permissions (Atlas)**

* Full access to CRM and loyalty modules
* Create and manage campaigns
* View customer analytics
* Cannot access financial P&L or employee data

---

## 2.17 Delivery Executive / Rider

**Department:** Delivery Operations

**Reports To:** Delivery Manager

**Overview**

Responsible for physical delivery of food orders from restaurant to customer.

**Primary Responsibilities**

* Pick up packed orders from restaurant
* Deliver to correct address within time target
* Collect payment for cash-on-delivery orders
* Report failed deliveries immediately
* Return undelivered orders

**Software Permissions (Atlas)**

* View assigned delivery orders
* Update delivery status (picked up, en route, delivered, failed)
* Collect and record COD payment
* View delivery address and customer contact
* Cannot access billing or inventory data

---

## 2.18 Customer

**Entity Type:** External Actor

**Relationship to Atlas**

While customers do not log into Atlas directly, they interact with Atlas-powered touchpoints:

* QR code menu at table
* Self-order kiosk
* Online ordering platform
* Loyalty app
* Feedback portal
* WhatsApp receipt

**Customer Software Touchpoints in Atlas**

* View menu and place order (self-order)
* Receive digital bill via WhatsApp or email
* Check loyalty points balance
* Submit feedback
* Make reservation online
* View order history

---

## 2.19 Vendor / Supplier

**Entity Type:** External Actor

**Relationship to Atlas**

Vendors supply raw materials. In Atlas, vendors are managed as master data with their own portal (future).

**Current Atlas Interaction**

* Vendor master data (name, contact, bank details, GST number)
* Purchase orders sent to vendor
* Vendor invoices processed against GRN
* Vendor payment scheduling and history

---

## 2.20 Auditor / External Auditor

**Entity Type:** External Actor

**Relationship to Atlas**

Auditors review financial and operational records for accuracy and compliance.

**Software Permissions (Atlas)**

* Read-only access to financial reports
* Export transactions for audit period
* View audit trail logs
* Cannot modify any data

---

## 2.21 Platform Admin / Super Admin

**Department:** Atlas Platform

**Overview**

An Atlas internal role (not restaurant staff) that manages the platform itself.

**Responsibilities**

* Onboard new restaurant tenants
* Manage subscription plans
* Troubleshoot technical issues
* Configure platform-level settings
* Monitor platform health and usage

**Software Permissions (Atlas)**

* Full access to all tenants (read-only by default)
* Can impersonate tenant for support purposes
* Can create, suspend, or deactivate tenant accounts
* Access to platform-level analytics

---

# 3. Role Hierarchy Summary

```
Platform Super Admin
│
└── Restaurant Owner
    │
    ├── General Manager
    │   │
    │   ├── Floor Manager
    │   │   ├── Captain
    │   │   │   └── Waiter
    │   │   └── Host / Hostess
    │   │
    │   ├── Head Chef
    │   │   ├── Sous Chef
    │   │   └── Line Cook
    │   │
    │   ├── Cashier
    │   │
    │   ├── Inventory Manager
    │   │
    │   ├── Purchase Manager
    │   │
    │   ├── Accountant
    │   │
    │   ├── HR Manager
    │   │
    │   └── Marketing Executive
    │
    └── Branch Manager (for multi-branch)
        └── (same sub-roles as above)
```

---

# 4. Permission Summary Matrix

| Action                         | Owner | GM  | Floor Mgr | Cashier | Waiter | Chef | Inventory |
| ------------------------------ | ----- | --- | --------- | ------- | ------ | ---- | --------- |
| View All Reports                | Yes   | Yes | No        | No      | No     | No   | No        |
| Void a Bill                     | Yes   | Yes | Yes       | No      | No     | No   | No        |
| Apply Discount                  | Yes   | Yes | Limited   | Limited | No     | No   | No        |
| Create KOT                      | Yes   | Yes | Yes       | No      | Yes    | No   | No        |
| Modify Menu Price               | Yes   | Yes | No        | No      | No     | No   | No        |
| View Inventory                  | Yes   | Yes | No        | No      | No     | Yes  | Yes       |
| Create GRN                      | Yes   | Yes | No        | No      | No     | No   | Yes       |
| Create Purchase Order           | Yes   | Yes | No        | No      | No     | No   | Part      |
| Approve Purchase Order          | Yes   | Yes | No        | No      | No     | No   | No        |
| View Customer Data              | Yes   | Yes | Yes       | Yes     | No     | No   | No        |
| Process Refund                  | Yes   | Yes | Yes       | No      | No     | No   | No        |
| Export Data                     | Yes   | Yes | No        | No      | No     | No   | No        |
| Change Staff Permissions        | Yes   | No  | No        | No      | No     | No   | No        |
| View Payroll                    | Yes   | Yes | No        | No      | No     | No   | No        |

---

# 5. Key Takeaways

* Atlas must support at minimum 12 distinct staff roles, each with unique screens and permissions.
* The permission model must be role-based (RBAC) with configurable limits per restaurant.
* No generic "admin/user" model is acceptable — it will fail in real restaurant use.
* Owner requires mobile-first access with minimal clicks to see critical numbers.
* Cashier must not be able to modify prices, void bills, or access reports beyond their shift.
* Kitchen staff must never see customer billing information.
* Every action by every role must generate an audit trail entry.

---

# Related Documents

* DOM-104 — Restaurant Organizational Structure
* DOM-105 — Restaurant Departments
* DOM-107 — Restaurant Daily Operations
* BCM-001 — Business Capability Model

---

# Next Document

DOM-107 — Restaurant Daily Operations

---

# Revision History

| Version | Date       | Author         | Description              |
| ------- | ---------- | -------------- | ------------------------ |
| 1.0.0   | 2026-06-25 | Vraj Prajapati | Initial document created |

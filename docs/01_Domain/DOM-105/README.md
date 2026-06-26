# DOM-105 — Restaurant Departments

| Field          | Value                   |
| -------------- | ----------------------- |
| Document ID    | DOM-105                 |
| Title          | Restaurant Departments  |
| Version        | 1.0.0                   |
| Status         | Draft                   |
| Category       | Domain Research         |
| Owner          | Product Team            |
| Repository     | atlas-docs              |
| Classification | Internal                |
| Last Updated   | 2026-06-25              |

---

# 1. Purpose

This document describes every department within a restaurant and how they interact.

Every department has its own workflows, staff, KPIs, and software requirements.

Understanding departmental boundaries prevents building software that blends concerns from different departments — which causes confusion in user roles, reporting, and permissions.

---

# 2. Department Overview

A full-service restaurant operates across these departments:

| #  | Department                | Abbreviation | Primary Function                        |
| -- | ------------------------- | ------------ | --------------------------------------- |
| 1  | Front of House            | FOH          | Customer service and experience         |
| 2  | Back of House             | BOH          | Kitchen operations and food production  |
| 3  | Bar                       | BAR          | Beverage preparation and service        |
| 4  | Inventory and Stores      | INV          | Stock management and control            |
| 5  | Procurement               | PUR          | Purchasing raw materials                |
| 6  | Finance and Accounts      | FIN          | Billing, revenue, expense management    |
| 7  | Human Resources           | HR           | Staff management and payroll            |
| 8  | Marketing and CRM         | MKT          | Customer acquisition and retention      |
| 9  | IT and Technology         | IT           | Systems administration                  |
| 10 | Delivery Operations       | DEL          | Managing delivery orders and riders     |
| 11 | Central Kitchen           | CK           | Centralized production for chains       |
| 12 | Management                | MGT          | Strategic and operational leadership    |

Not every restaurant has all departments. A small café may combine FOH, billing, and management into one person.

---

# 3. Detailed Department Profiles

## 3.1 Front of House (FOH)

**Definition**

The FOH is everything the customer sees and interacts with — the dining room, the service staff, and the guest experience.

**Scope**

* Greeting and seating customers
* Taking orders at the table
* Communicating orders to the kitchen
* Serving food and beverages
* Managing customer requests and complaints
* Processing payment at the table or cashier
* Upselling and suggestive selling
* Maintaining cleanliness and ambiance of the dining area

**Staff**

* Host / Hostess
* Floor Manager / Duty Manager
* Captain / Section Head
* Waiter / Server
* Busboy / Runner
* Sommelier (fine dining)

**Key Documents Used**

* Reservation sheet
* Table allocation chart
* KOT (Kitchen Order Ticket)
* Bill / Invoice

**KPIs**

* Table turnover rate
* Average order value per table
* Customer wait time (seating and service)
* Upselling conversion rate
* Complaint frequency per 100 covers
* Customer satisfaction score

**Pain Points**

* Kitchen delays causing table complaints
* Miscommunication of orders to kitchen
* Bill disputes from incorrect orders
* No real-time table status visibility
* Manual KOT errors
* Managing walk-in rush without a digital queue

**Software Requirements**

* Table management with floor plan view
* Digital KOT with kitchen notification
* Reservation calendar
* Cover count per shift
* Bill printing and digital receipt
* Customer complaint recording

---

## 3.2 Back of House (BOH) / Kitchen Department

**Definition**

The BOH is the production engine of the restaurant — every food item is created here.

**Scope**

* Receiving and reviewing kitchen orders (KOTs)
* Food preparation according to recipe standards
* Plating and quality check before dispatch
* Inventory consumption tracking
* Kitchen cleanliness and hygiene
* Prep work between service hours

**Staff**

* Head Chef / Executive Chef
* Sous Chef
* Station Chefs (Grill, Sauté, Pantry, Pastry)
* Line Cooks / Prep Cooks
* Kitchen Helpers
* Dishwashers / Cleaners
* Kitchen Manager (in large operations)

**Key Documents**

* KOT (Kitchen Order Ticket)
* Recipe cards
* Prep list
* Wastage log
* Shift prep report

**KPIs**

* Average food preparation time by dish
* Order accuracy rate (correct dish, correct modifier, no missing items)
* Food wastage percentage
* Kitchen throughput (covers served per hour)
* Recipe adherence (portion control)
* Cost of Goods Sold (COGS) variance

**Pain Points**

* KOT paper getting lost or misread
* No priority system for multiple simultaneous orders
* Recipe deviation causing inconsistency
* Inventory shortage mid-service
* Waste recording not happening
* No visibility into upcoming orders during busy service

**Software Requirements**

* KDS (Kitchen Display System)
* Recipe card management with standard portions
* Prep list generation
* Wastage recording
* Ingredient consumption auto-deduction
* Kitchen performance reporting

---

## 3.3 Bar Department

**Definition**

Manages beverage preparation, alcohol inventory, and bar service.

**Scope**

* Preparing cocktails, spirits, beers, wines, and non-alcoholic beverages
* Managing bar inventory (alcohol, mixers, garnishes)
* Bar tab management for customers
* Compliance with liquor regulations
* Happy hour and special beverage promotions
* Bottle service for VIP tables

**Staff**

* Head Bartender
* Bartenders
* Bar Back (support staff)
* Sommelier (wine-focused establishments)

**Key Documents**

* Bar KOT / BOT (Beverage Order Ticket)
* Bar stock sheet
* Daily bar sales report
* Liquor consumption report

**KPIs**

* Beverage cost percentage
* Beverage revenue per cover
* Waste and spillage percentage
* Bar throughput (drinks served per hour)
* Most popular cocktail / beverage

**Pain Points**

* Liquor stock theft and pilferage
* Happy hour price confusion at POS
* No real-time bar inventory visibility
* Open-tab billing errors
* Compliance reporting is manual

**Software Requirements**

* Separate BOT (Beverage Order Ticket) flow
* Real-time bar stock tracking
* Open-tab management
* Time-based (happy hour) pricing
* Liquor consumption report
* Bottle service module

---

## 3.4 Inventory and Stores Department

**Definition**

Manages all physical stock — raw materials, semi-finished goods, packaging, and consumables.

**Scope**

* Receiving deliveries from vendors (GRN process)
* Checking quality and quantity of received goods
* Storing stock in correct locations and temperatures
* Issuing stock to kitchen on indent
* Conducting periodic stock audits
* Recording wastage and transfers
* Maintaining minimum stock levels (par stock)
* Alerting when stock falls below reorder point

**Staff**

* Inventory Manager / Store Keeper
* Store Assistant
* Receiving Clerk

**Key Documents**

* Purchase Order (PO)
* Goods Receipt Note (GRN)
* Stock Issue Indent
* Stock Transfer Form
* Wastage Report
* Physical Stock Count Sheet
* Stock Audit Report

**KPIs**

* Inventory accuracy (system vs. physical)
* Stock wastage percentage
* Stockout frequency
* Inventory turnover rate
* Variance between consumed and sold (potential theft)
* GRN processing time

**Pain Points**

* Receiving more or less than ordered from vendor
* Expiry tracking manual and error-prone
* Inter-branch transfers not tracked
* No alerts for low stock during service
* Wastage not recorded consistently
* Kitchen uses stock without issuing properly

**Software Requirements**

* GRN with quantity and quality check
* Stock movement (issue, transfer, adjust)
* Minimum stock / reorder point alerts
* Expiry date tracking
* Physical count with variance reporting
* Wastage recording with reason codes
* Real-time inventory dashboard

---

## 3.5 Procurement Department

**Definition**

Responsible for sourcing, purchasing, and managing relationships with vendors.

**Scope**

* Identifying and onboarding vendors
* Negotiating pricing and terms
* Raising purchase orders
* Tracking order delivery status
* Evaluating vendor quality and reliability
* Managing price fluctuations
* Maintaining approved vendor list
* Processing vendor invoices for payment

**Staff**

* Purchase Manager
* Purchase Executive
* Vendor Relationship Manager (large operations)

**Key Documents**

* Request for Quotation (RFQ)
* Quotation / Rate Card from vendor
* Purchase Order (PO)
* Delivery Challan from vendor
* Vendor Invoice
* Goods Receipt Note (GRN)
* Payment Voucher

**KPIs**

* Purchase order fulfillment rate (quantity accuracy)
* Price variance vs. approved rate
* Vendor lead time
* Number of stockouts caused by late delivery
* Cost savings achieved through negotiation
* Pending payables to vendors

**Pain Points**

* Price changes by vendors not tracked
* No comparison of multiple quotations
* PO approval process informal and delayed
* Vendor invoice disputes due to quantity mismatch
* Preferred vendors not enforced (staff ordering from unauthorized vendors)

**Software Requirements**

* Vendor management with approved vendor list
* RFQ and quotation comparison
* Purchase order creation and approval workflow
* GRN linked to PO for three-way matching
* Vendor invoice processing
* Price history tracking per ingredient per vendor
* Payment scheduling

---

## 3.6 Finance and Accounts Department

**Definition**

Manages the restaurant's money — revenue recognition, expense recording, tax compliance, and financial reporting.

**Scope**

* Daily cash reconciliation
* Sales report verification
* Expense voucher processing
* Vendor payment processing
* GST return filing support
* Payroll processing
* Bank reconciliation
* Monthly P&L preparation
* Annual financial statement preparation

**Staff**

* Accountant / Finance Executive
* Finance Manager (large operations)
* Chartered Accountant (retained / consultant)

**Key Documents**

* Daily Sales Report (DSR)
* Cash Reconciliation Report
* Expense Voucher
* Vendor Payment Voucher
* GST Invoice
* GST Return (GSTR-1, GSTR-3B)
* Payroll Statement
* Monthly P&L
* Balance Sheet

**KPIs**

* Revenue vs. budget variance
* Cash vs. system revenue discrepancy
* Expense as % of revenue
* GST compliance status
* Days payable outstanding (vendor payment timing)
* Food cost % and labor cost %

**Pain Points**

* Daily sales reconciliation is time-consuming and manual
* Cash discrepancies unexplained
* Discount abuse inflating revenue deductions
* GST calculation errors on complex items
* No real-time P&L visibility for owner
* Multiple branches make consolidation difficult

**Software Requirements**

* Daily cash and POS reconciliation
* Automated GST calculation and invoice generation
* Expense recording with category tags
* Vendor payment tracking
* Multi-branch consolidated P&L
* Revenue analytics with drill-down
* Budget vs. actual reporting
* Tax liability summary for GST filing

---

## 3.7 Human Resources Department

**Definition**

Manages the full employee lifecycle — hiring, attendance, performance, payroll, and compliance.

**Scope**

* Staff recruitment and onboarding
* Attendance and shift tracking
* Leave management
* Payroll processing
* Performance reviews
* Compliance with labor laws
* Staff training records
* Termination and exit management

**Staff**

* HR Manager
* HR Executive

**Key Documents**

* Employment Contract
* Attendance Sheet / Biometric Report
* Leave Application
* Salary Slip
* Payroll Statement
* Increment / Promotion Letter
* Warning Letter

**KPIs**

* Employee attrition rate
* Attendance rate
* Time-to-fill open positions
* Training hours per employee
* Payroll accuracy rate
* Labor cost as % of revenue

**Pain Points**

* Restaurant industry has 50–100% annual attrition
* Shift scheduling complex with split shifts and rotations
* Casual / contractual staff do not get formal payslips
* Attendance records disputed
* Overtime calculation manual

**Software Requirements**

* Staff profile and document management
* Biometric or mobile attendance tracking
* Shift planning and roster generation
* Leave application and approval workflow
* Payroll calculation with OT, allowances, deductions
* Payslip generation and distribution
* Labor law compliance checklist (PF, ESI, gratuity)

---

## 3.8 Marketing and CRM Department

**Definition**

Manages customer acquisition, engagement, retention, and brand building.

**Scope**

* Running promotional campaigns
* Managing loyalty and membership programs
* Customer database management
* Social media coordination
* Aggregator listing management (Zomato, Swiggy)
* SMS, WhatsApp, and email marketing
* Analyzing customer behavior
* Customer feedback collection and response

**Staff**

* Marketing Executive
* Social Media Manager
* CRM Analyst
* Brand Manager (larger operations)

**Key Documents**

* Campaign Brief
* Customer Database
* Loyalty Redemption Report
* Campaign Performance Report
* Net Promoter Score (NPS) Report

**KPIs**

* Customer acquisition cost
* Customer retention rate
* Loyalty redemption rate
* Campaign ROI
* Online review score (Zomato, Google)
* Repeat visit rate

**Pain Points**

* No single customer database across channels (dine-in, delivery, loyalty app)
* Campaign effectiveness not measured
* Loyalty points expire and customers complain
* No automated triggers for lapsed customers
* Manual WhatsApp campaigns

**Software Requirements**

* Customer database with complete order history
* Loyalty program (points, stamps, tiers)
* Membership management (monthly passes, annual cards)
* Campaign builder with segmentation
* SMS and WhatsApp integration
* Automated triggers (birthday offer, win-back campaign)
* NPS and feedback collection
* Aggregator performance dashboard

---

## 3.9 Delivery Operations Department

**Definition**

Manages the execution of delivery orders — from receipt to successful delivery.

**Scope**

* Receiving aggregator orders
* Assigning orders to kitchen
* Packaging and labeling
* Assigning delivery riders (own fleet)
* Tracking delivery time
* Handling failed deliveries and returns
* Reconciling aggregator settlements

**Staff**

* Delivery Manager
* Delivery Executive / Rider
* Packaging Staff

**Key Documents**

* Delivery Order Sheet
* Packaging Checklist
* Delivery Confirmation
* Aggregator Settlement Statement

**KPIs**

* On-time delivery rate
* Average delivery time
* Order rejection rate
* Delivery cost per order
* Aggregator rating (Zomato/Swiggy restaurant score)

**Pain Points**

* Aggregator order not noticed immediately (missed order)
* Packaging quality inconsistency
* Rider GPS not tracked
* Aggregator settlement delayed and disputed
* Different menus on different aggregators cause confusion

**Software Requirements**

* Aggregator order auto-accept and display
* Delivery status tracking
* Rider management (own fleet)
* Packaging label printing
* Aggregator settlement reconciliation
* Delivery performance report

---

## 3.10 Central Kitchen Department

**Definition**

A centralized production facility that manufactures semi-finished or finished food items for distribution to multiple outlets.

**Scope**

* Manufacturing base sauces, gravies, doughs, and prep items
* Quality-controlled production
* Batch production planning based on outlet demand
* Delivery scheduling to outlets
* Central recipe standardization

**Staff**

* Central Kitchen Manager
* Production Chefs
* Logistics / Dispatch Staff
* QC Inspector

**Key Documents**

* Production Order
* Dispatch Challan
* Outlet Receipt Confirmation
* Yield Report
* Batch Production Log

**KPIs**

* Production accuracy (planned vs. actual output)
* Delivery on-time rate to outlets
* Quality rejection rate at outlets
* Cost per unit produced
* Ingredient yield percentage

**Software Requirements**

* Production order management
* Batch recipe scaling
* Dispatch with delivery challan
* Outlet receipt acknowledgment
* Yield tracking (input ingredients vs. output products)
* Central kitchen inventory management

---

## 3.11 Management / Administration Department

**Definition**

Strategic and operational leadership that coordinates all departments.

**Scope**

* Business strategy and planning
* Performance monitoring across all departments
* Staff appraisals and key decisions
* Owner and investor reporting
* Vendor negotiations and contracts
* Regulatory and compliance management
* Technology oversight

**Staff**

* Owner / Managing Director
* General Manager
* Operations Manager
* Area Manager (chains)

**KPIs**

* Total revenue (daily, weekly, monthly)
* Net profit margin
* Same-store sales growth
* Customer satisfaction score
* Employee attrition
* Audit compliance score

**Software Requirements**

* Executive dashboard with all key metrics
* Multi-branch performance comparison
* Budget vs. actual tracking
* Approval workflows for high-value decisions
* Audit trail for sensitive transactions
* Investor-ready reporting export

---

# 4. Department Interaction Map

```
Customer
    │
    ▼
FOH (seating, order, service)
    │
    ├──→ Kitchen (KOT via KDS)
    │       │
    │       ├──→ Inventory (consumes stock)
    │       │
    │       └──→ Central Kitchen (issues prep items)
    │
    ├──→ Bar (beverage order)
    │       │
    │       └──→ Inventory (bar stock consumed)
    │
    └──→ Finance (payment, invoice)
            │
            ├──→ Marketing (loyalty points update)
            └──→ HR (tip recording, staff commission)

Procurement ──→ Inventory (GRN)
Inventory ──→ Kitchen (stock issue)
HR ──→ All Departments (staff management)
Marketing ──→ Customer (campaigns, loyalty)
Management ──→ All Departments (oversight)
```

---

# 5. Department Software Module Mapping

| Department       | Primary Module(s)                                         |
| ---------------- | --------------------------------------------------------- |
| FOH              | Table Management, Reservations, KOT, Billing              |
| Kitchen          | KDS, Recipe Management, Wastage                           |
| Bar              | BOT, Bar Stock, Bar Tab, Happy Hour Pricing               |
| Inventory        | Stock Management, GRN, Stock Audit, Wastage               |
| Procurement      | Vendor Management, Purchase Orders, RFQ                   |
| Finance          | Billing, Revenue Reports, GST, Expense, Payroll           |
| HR               | Staff Management, Attendance, Payroll, Leave              |
| Marketing        | CRM, Loyalty, Campaigns, Feedback                         |
| Delivery         | Aggregator Integration, Rider Management, Delivery Track  |
| Central Kitchen  | Production Orders, Batch Recipes, Dispatch                |
| Management       | Executive Dashboard, Consolidated Reports, ADR Approvals  |

---

# 6. Key Takeaways

* Departments have clear boundaries but are tightly interdependent.
* Software modules must respect these boundaries — kitchen staff should not see finance reports.
* Every permission in Project Atlas must be traceable to a department and role.
* The FOH–BOH interface (KOT flow) is the most critical real-time communication in a restaurant.
* Multi-branch operations require that every department function works correctly at scale.

---

# Related Documents

* DOM-104 — Restaurant Organizational Structure
* DOM-106 — Restaurant Roles and Responsibilities
* DOM-107 — Restaurant Daily Operations
* BCM-001 — Business Capability Model

---

# Next Document

DOM-106 — Restaurant Roles and Responsibilities

---

# Revision History

| Version | Date       | Author         | Description              |
| ------- | ---------- | -------------- | ------------------------ |
| 1.0.0   | 2026-06-25 | Vraj Prajapati | Initial document created |

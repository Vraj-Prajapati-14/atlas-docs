# DOM-104 — Restaurant Organizational Structure

| Field          | Value                                |
| -------------- | ------------------------------------ |
| Document ID    | DOM-104                              |
| Title          | Restaurant Organizational Structure  |
| Version        | 1.0.0                                |
| Status         | Draft                                |
| Category       | Domain Research                      |
| Owner          | Product Team                         |
| Repository     | atlas-docs                           |
| Classification | Internal                             |
| Last Updated   | 2026-06-25                           |

---

# 1. Purpose

This document describes how restaurants are organized — from a single-owner dhaba to a publicly listed restaurant chain.

Organizational structure directly determines:

* Who has authority over which decisions
* Which software roles and permissions map to which positions
* How reporting flows from outlet to ownership
* How multi-branch operations are governed
* What the software hierarchy model must look like

If our software does not reflect organizational reality, users will fight against it instead of working with it.

---

# 2. Why Organizational Structure Matters for Software

Most POS products assume a flat structure: owner, manager, cashier, waiter.

The reality is far more complex.

Consider:

* A franchise group with a franchisor, 50 franchisees, each with 3–5 outlets, each outlet with its own manager and cashier — that is five levels of access control.
* A cloud kitchen operator running 10 virtual brands across 5 kitchens — brands are not outlets; outlets are not brands.
* A hotel with 4 restaurant concepts, each with its own P&L but shared kitchen staff.

Project Atlas must model all of these correctly.

---

# 3. Organizational Models

## 3.1 Single Outlet — Sole Proprietorship

**Overview**

One restaurant, one owner, one location.

**Structure**

```
Owner / Proprietor
│
├── Manager (may be the owner)
│   ├── Chef
│   ├── Sous Chef
│   ├── Kitchen Staff
│   ├── Cashier
│   ├── Waiter(s)
│   └── Cleaner
│
└── Accountant (may be part-time)
```

**Characteristics**

* Owner is often present daily
* Manager may double as cashier or floor manager
* Very flat hierarchy — decisions made fast
* Informal communication (WhatsApp, verbal)
* Owner reviews end-of-day reports personally

**Software Implications**

* Simple role setup: Owner, Manager, Staff
* Owner needs mobile dashboard with daily summary
* Daily sales report via WhatsApp essential
* No complex permission hierarchy required

---

## 3.2 Single Outlet — Corporate-Managed

**Overview**

One restaurant operated by a corporate entity with a professional management team.

**Structure**

```
Managing Director / CEO
│
└── Restaurant General Manager
    ├── Front of House Manager
    │   ├── Captain(s)
    │   └── Waiter(s)
    ├── Head Chef / Kitchen Manager
    │   ├── Sous Chef
    │   └── Line Cooks
    ├── Accounts Manager
    └── HR / Admin
```

**Characteristics**

* Formal reporting structure
* Owner not always present
* KPI-driven management
* Standardized processes and SOPs
* Regular management reviews

**Software Implications**

* Role-based access control (RBAC) is essential
* Manager dashboard separate from owner dashboard
* Audit trail for all transactions
* Formal reporting (weekly/monthly P&L)
* Staff clock-in/clock-out tracking

---

## 3.3 Multi-Branch — Owner-Operated Chain

**Overview**

Multiple restaurant outlets owned by the same individual or family, often managed by a branch manager at each location.

**Structure**

```
Owner
│
├── Central Purchasing / Central Kitchen (optional)
│
├── Branch A — Branch Manager A
│   ├── Chef
│   ├── Cashier
│   └── Staff
│
├── Branch B — Branch Manager B
│   ├── Chef
│   ├── Cashier
│   └── Staff
│
└── Branch C — Branch Manager C
    ├── Chef
    ├── Cashier
    └── Staff
```

**Characteristics**

* Owner monitors all branches from one view
* Branch manager has operational authority at their location
* Central purchasing may supply all branches
* Menu is standardized but may have local variations
* Centralized accounting across all branches

**Software Implications**

* Multi-branch dashboard with consolidated view for owner
* Branch-level access control (Branch Manager A cannot see Branch B data)
* Central menu management with branch-level override permissions
* Inter-branch stock transfer
* Consolidated P&L with branch-level drill-down
* Central purchasing with branch-level GRN

---

## 3.4 Multi-Brand — Restaurant Group

**Overview**

One ownership entity operating multiple distinct restaurant brands.

**Structure**

```
Restaurant Group (Holding Entity)
│
├── Brand A (Casual Dining)
│   ├── Brand A — Outlet 1
│   ├── Brand A — Outlet 2
│   └── Brand A — Outlet 3
│
├── Brand B (QSR Chain)
│   ├── Brand B — Outlet 1
│   └── Brand B — Outlet 2
│
└── Brand C (Cloud Kitchen)
    ├── Virtual Brand C1
    ├── Virtual Brand C2
    └── Virtual Brand C3
```

**Characteristics**

* Group-level consolidated financials
* Each brand has its own P&L
* Brand-level management separate from group ownership
* Brands may share backend resources (purchasing, HR, finance)
* Each brand has distinct menu, pricing, and experience

**Software Implications**

* Group → Brand → Outlet hierarchy
* Group owner has consolidated view across all brands
* Brand manager has brand-level view across all outlets
* Outlet manager has single-outlet view
* Shared services (central kitchen, procurement) must be modeled
* Cross-brand customer loyalty possible

---

## 3.5 Franchise System

**Overview**

A parent brand (franchisor) licenses its brand and system to independent operators (franchisees).

**Structure**

```
Franchisor (Corporate)
│
├── Regional Development Manager (Franchisor Staff)
│   ├── Franchisee Group A (owns 5 outlets)
│   │   ├── Outlet A1
│   │   ├── Outlet A2
│   │   └── Outlet A3
│   │
│   └── Franchisee Group B (owns 2 outlets)
│       ├── Outlet B1
│       └── Outlet B2
│
└── Company-Owned Outlets (COCO)
    ├── Outlet C1
    └── Outlet C2
```

**Two distinct entities with distinct software needs:**

**Franchisor needs:**
* Consolidated visibility across all franchise locations
* Brand compliance monitoring
* Royalty calculation and billing
* Central menu management (mandatory items vs. optional)
* Aggregated market analytics
* Franchisee performance ranking

**Franchisee needs:**
* Standard outlet operations (billing, inventory, staff)
* Sales reporting to franchisor (automated)
* Royalty deduction tracking
* Procurement from approved vendors
* Restricted menu modification rights

**Software Implications**

* Two-tier account system: Franchisor account + Franchisee accounts
* Franchisor can push menu updates to all franchisees
* Franchisee cannot change brand-mandated items or prices
* Royalty is auto-calculated and reported
* Franchisor sees all outlets; franchisee sees only their outlets

---

## 3.6 Enterprise Restaurant Chain

**Overview**

A large-scale restaurant business with 50+ outlets, regional management tiers, a full corporate head office, and multiple support functions.

**Structure**

```
Board of Directors / CEO
│
├── Chief Operating Officer (COO)
│   ├── Regional Manager — North
│   │   ├── Area Manager — Delhi NCR
│   │   │   ├── Outlet Manager — CP
│   │   │   └── Outlet Manager — Gurgaon
│   │   └── Area Manager — Punjab
│   │       └── Outlet Manager — Chandigarh
│   │
│   └── Regional Manager — South
│       └── Area Manager — Bangalore
│           └── Outlet Manager — Koramangala
│
├── Chief Marketing Officer (CMO)
│   ├── Brand Manager
│   ├── Digital Marketing
│   └── CRM & Loyalty
│
├── Chief Financial Officer (CFO)
│   ├── Finance Controller
│   └── Tax & Compliance
│
├── Supply Chain Head
│   ├── Central Procurement
│   └── Central Kitchen (CK)
│
├── Human Resources Head
│   ├── Talent Acquisition
│   └── Payroll & Compliance
│
└── Technology Head (CTO / VP Engineering)
```

**Characteristics**

* Formal corporate governance
* Multi-tier management (Outlet → Area → Region → Corporate)
* Standardized SOPs enforced centrally
* Central kitchen producing semi-finished goods
* Professional board and investor reporting

**Software Implications**

* Full RBAC with 5+ permission tiers
* Central kitchen production linked to outlet inventory
* Regional and area manager dashboards
* Investor-level consolidated reporting
* Formal approval workflows (purchase orders, discounts, refunds)
* HR and payroll integration
* Audit and compliance module

---

# 4. Organizational Hierarchy for Project Atlas

Based on the above analysis, Project Atlas must model the following organizational hierarchy:

```
Platform (Atlas)
│
└── Tenant (Restaurant Group / Operator)
    │
    ├── Brand (e.g., "The Burger Joint")
    │   │
    │   └── Outlet / Location (e.g., "The Burger Joint — Koramangala")
    │       │
    │       ├── Department (e.g., Kitchen, FOH, Bar)
    │       │
    │       └── Staff Member
    │
    └── Central Services (Shared across brands)
        ├── Central Kitchen
        └── Central Procurement
```

**Key Design Decisions**

* Tenant is the billing and subscription entity.
* Brand governs menu, pricing, and brand identity.
* Outlet governs daily operations and staff.
* Permissions flow downward — a role at outlet level cannot override brand-level constraints.
* Reporting flows upward — outlet data aggregates to brand, brand to tenant.

---

# 5. Decision Authority Matrix

| Decision                     | Owner | Brand Mgr | Branch Mgr | Supervisor | Cashier |
| ---------------------------- | ----- | --------- | ---------- | ---------- | ------- |
| Create/Delete Menu Items     | Yes   | Yes       | No         | No         | No      |
| Change Item Price            | Yes   | Yes       | Limited    | No         | No      |
| Apply Discount > 20%         | Yes   | Yes       | Yes        | No         | No      |
| Apply Discount ≤ 20%         | Yes   | Yes       | Yes        | Yes        | No      |
| Void a Bill                  | Yes   | Yes       | Yes        | No         | No      |
| Issue Refund                 | Yes   | Yes       | Yes        | No         | No      |
| Add New Staff                | Yes   | Yes       | Yes        | No         | No      |
| View All Outlet Reports      | Yes   | Yes       | Yes        | No         | No      |
| View Single Outlet Reports   | Yes   | Yes       | Yes        | Yes        | No      |
| Create Purchase Order        | Yes   | Yes       | Yes        | No         | No      |
| Approve Purchase Order       | Yes   | Yes       | No         | No         | No      |
| Adjust Inventory             | Yes   | Yes       | Yes        | No         | No      |
| Change Staff Permissions     | Yes   | Yes       | No         | No         | No      |

---

# 6. Reporting Structure

Reporting in a multi-level organization flows as follows:

```
Outlet Daily Report
        ↓
Branch Manager Review
        ↓
Brand-Level Weekly Summary
        ↓
Owner / Regional Manager Review
        ↓
Consolidated Monthly P&L
        ↓
Board / Investor Reporting
```

**Project Atlas must:**

* Auto-generate outlet-level daily reports
* Roll up branch-level weekly summaries automatically
* Enable drill-down from consolidated view to individual transaction
* Support report scheduling and email/WhatsApp delivery

---

# 7. Key Takeaways

* Most POS products support only two levels: owner and cashier.
* Real restaurant businesses have 3–6 levels of organizational hierarchy.
* Project Atlas must support this full hierarchy to compete in the enterprise and chain segment.
* The data model must be built around the Tenant → Brand → Outlet hierarchy from day one.
* Adding organizational levels later is extremely expensive — this must be designed correctly upfront.

---

# Related Documents

* DOM-102 — Restaurant Business Models
* DOM-103 — Restaurant Types
* DOM-105 — Restaurant Departments
* DOM-106 — Restaurant Roles and Responsibilities
* BCM-001 — Business Capability Model

---

# Next Document

DOM-105 — Restaurant Departments

---

# Revision History

| Version | Date       | Author         | Description              |
| ------- | ---------- | -------------- | ------------------------ |
| 1.0.0   | 2026-06-25 | Vraj Prajapati | Initial document created |

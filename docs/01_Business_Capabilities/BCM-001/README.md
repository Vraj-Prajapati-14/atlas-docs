# BCM-001 — Business Capability Model

| Field          | Value                     |
| -------------- | ------------------------- |
| Document ID    | BCM-001                   |
| Version        | 1.0.0                     |
| Status         | Approved                  |
| Category       | Business Architecture     |
| Owner          | Product Architecture Team |
| Classification | Internal                  |

---

# 1. Purpose

This document defines **what capabilities Project Atlas must provide** to operate a restaurant successfully.

A capability represents **what the business must be able to do**, independent of people, software, technology, or implementation.

Capabilities remain relatively stable over time, even if workflows, software, or technologies change.

This document becomes the highest-level blueprint for the entire platform.

Every future requirement, API, database table, microservice, UI module, AI feature, and engineering task must trace back to one or more capabilities defined here.

---

# 2. Why Capability Modeling?

Many software projects fail because they are organized around screens or features.

Examples:

* Billing Screen
* Dashboard
* Menu Page
* Reports Page

These are **user interfaces**, not business capabilities.

Project Atlas is organized around business capabilities.

This ensures that:

* UI can change without changing business logic.
* APIs remain stable.
* Teams can own capabilities independently.
* Microservices align with business domains.
* AI agents understand business responsibilities.
* Future products reuse core capabilities.

---

# 3. Capability Hierarchy

Capabilities are organized into four levels.

## Level 1 – Enterprise

Represents the complete business.

Example:

Restaurant Management Platform

---

## Level 2 – Business Domains

Major areas of responsibility.

Examples:

* Customer
* Operations
* Finance
* Marketing
* Inventory

---

## Level 3 – Business Capabilities

Specific business functions.

Example:

Inventory Management

---

## Level 4 – Business Functions

Individual responsibilities within a capability.

Example:

* Receive Stock
* Transfer Stock
* Adjust Inventory
* Perform Stock Count
* Record Waste

---

# 4. Capability Design Principles

Every capability must:

* Deliver measurable business value.
* Own its business rules.
* Own its business data.
* Expose clear interfaces.
* Be independently testable.
* Be scalable.
* Be reusable.
* Support automation.
* Be AI-ready.

---

# 5. Capability Map

The following capabilities define Version 1 of Project Atlas.

## Platform Capabilities

* Identity & Access Management
* Tenant Management
* Organization Management
* Branch Management
* Configuration Management
* Notification Management
* Audit Management
* Reporting Platform
* Analytics Platform
* AI Platform

---

## Restaurant Operations

* Menu Management
* Order Management
* Table Management
* Reservation Management
* Kitchen Management
* Billing Management
* Payment Management

---

## Inventory & Procurement

* Inventory Management
* Recipe Management
* Ingredient Management
* Purchase Management
* Supplier Management
* Warehouse Management
* Stock Audit Management

---

## Customer Engagement

* Customer Management
* Loyalty Management
* Membership Management
* CRM
* Campaign Management
* Feedback Management

---

## Employee Management

* Employee Management
* Attendance
* Shift Planning
* Payroll
* Performance Tracking
* Access Control

---

## Financial Management

* Expense Management
* Revenue Management
* Cash Management
* Tax Management
* Invoice Management
* Financial Reporting

---

## Delivery Ecosystem

* Delivery Management
* Aggregator Integration
* Driver Management
* Route Tracking

---

## Business Intelligence

* Dashboard
* Operational Analytics
* Financial Analytics
* Customer Analytics
* Predictive Analytics
* AI Decision Support

---

# 6. Capability Metadata Standard

Every capability will eventually have its own documentation package containing:

* Overview
* Business Goals
* Stakeholders
* Business Processes
* Business Rules
* Data Model
* KPIs
* Risks
* Pain Points
* Integrations
* Functional Requirements
* Non-Functional Requirements
* APIs
* Database Design
* AI Opportunities

---

# 7. Capability Ownership

Each capability should have a clearly defined owner.

Ownership includes:

* Business rules
* Requirements
* APIs
* Data
* Documentation
* Testing
* Future roadmap

---

# 8. Capability Relationships

Capabilities are not isolated.

Example:

Order Management depends on:

* Menu Management
* Customer Management
* Inventory Management
* Kitchen Management
* Billing Management
* Payment Management

These relationships will later be represented using dependency diagrams.

---

# 9. Traceability

Every artifact must trace back to a capability.

Example:

Business Capability

↓

Business Requirement

↓

Product Requirement

↓

User Story

↓

UX Flow

↓

API

↓

Database

↓

Code

↓

Test Case

↓

Deployment

---

# 10. Success Criteria

The Business Capability Model is considered complete when:

* Every business function belongs to a capability.
* Every capability has a documented owner.
* Every capability has defined inputs and outputs.
* Every capability is independently understandable.
* Every engineering artifact traces back to a capability.

---

# Related Documents

* GOV-001 Repository Overview
* GOV-002 Project Roadmap

---

# Next Documents

BCM-101 Identity & Access Management

BCM-102 Restaurant Management

BCM-103 Branch Management

BCM-104 Menu Management

BCM-105 Order Management

BCM-106 Kitchen Management

BCM-107 Inventory Management

BCM-108 Customer Management

BCM-109 Billing Management

BCM-110 Payment Management

... (continues for every capability)

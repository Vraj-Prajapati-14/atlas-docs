# DOM-102 — Restaurant Business Models

| Field          | Value                      |
| -------------- | -------------------------- |
| Document ID    | DOM-102                    |
| Title          | Restaurant Business Models |
| Version        | 1.0.0                      |
| Status         | Draft                      |
| Category       | Domain Research            |
| Owner          | Product Team               |
| Repository     | atlas-docs                 |
| Classification | Internal                   |
| Last Updated   | 2026-06-25                 |

---

# 1. Purpose

This document describes the business models under which restaurants operate.

Understanding business models is essential because each model creates different operational workflows, different software requirements, different revenue structures, different staffing needs, and different reporting requirements.

Project Atlas must be configurable to support every major restaurant business model without requiring separate software deployments.

---

# 2. What Is a Business Model?

A business model defines how a restaurant:

* Creates value for customers
* Delivers value through operations
* Captures value through revenue
* Manages and controls costs
* Achieves sustainable profitability

Two restaurants serving identical food may operate under completely different business models, requiring entirely different software behavior.

---

# 3. Business Model Classifications

## 3.1 Quick Service Restaurant (QSR)

**Definition**

A QSR serves standardized food at low price points with minimal or no table service.

**Operational Characteristics**

* Counter service — no dedicated waitstaff at tables
* Fixed menu with limited customization
* Order-to-serve target under 3–5 minutes
* Very high transaction volume, low margin per order
* Standardized recipes across all locations
* Minimal table dwell time

**Revenue Model**

* Per-transaction revenue
* Combo meals increase average order value (AOV)
* Upselling at the counter is scripted and measured
* Delivery aggregators extend revenue reach

**Cost Profile**

* Food cost: 28–32% of revenue
* Labor cost: 25–30% (low skill, high volume)
* Low occupancy cost relative to throughput

**Typical Examples**

McDonald's, KFC, Burger King, Domino's, Subway, local fast food stalls

**Software Implications for Atlas**

* Billing speed is the primary metric — every second of delay costs throughput
* KDS (Kitchen Display System) integration is essential
* Combo and modifier management must be fast and reliable
* Aggregator integration (Zomato, Swiggy) mandatory
* Queue and token management for peak hours
* Offline billing capability (internet outages cannot stop operations)

---

## 3.2 Fast Casual Restaurant

**Definition**

A hybrid between QSR and casual dining offering higher food quality without full table service.

**Operational Characteristics**

* Counter ordering, table delivery by staff
* Higher average check than QSR
* Fresher, customizable ingredients
* Open kitchen is common
* Moderate transaction volume

**Revenue Model**

* Per-order revenue
* Customization options increase per-order value
* Delivery growing as a channel

**Cost Profile**

* Food cost: 28–35% (higher quality ingredients)
* Labor cost: 28–33%

**Typical Examples**

Chipotle, Shake Shack, Biryani By Kilo, healthy bowl concepts

**Software Implications for Atlas**

* Complex order customization engine required
* Order tracking from counter to table delivery
* Real-time inventory due to fresh ingredients with tight shelf windows
* Customer name / token number display integration

---

## 3.3 Casual Dining Restaurant

**Definition**

A full-service restaurant with table service, mid-range pricing, and a broad menu.

**Operational Characteristics**

* Full waiter service at tables
* Multi-course meals standard
* Liquor license common
* Reservation systems used alongside walk-ins
* Average meal duration: 45–90 minutes
* Table turnover target: 2–3 covers per table per service

**Revenue Model**

* Per-cover revenue
* Beverage sales significantly increase check
* Starters, desserts, and add-ons contribute meaningfully
* Private dining events for additional revenue

**Cost Profile**

* Food cost: 28–35%
* Labor cost: 30–35% (higher skilled staff)

**Typical Examples**

Most family restaurants, themed restaurants, mid-tier chain restaurants

**Software Implications for Atlas**

* Table management is a core module
* Waiter-assigned table management with section splits
* Split billing, table merge, table transfer all required
* Reservation management with covers and deposits
* Feedback collection after meal
* Course-by-course order management

---

## 3.4 Fine Dining Restaurant

**Definition**

A premium restaurant offering a curated menu, exceptional service, and high price points.

**Operational Characteristics**

* Reservation-only or mostly reservation-based
* Multi-course and tasting menu format common
* Sommelier, butler, and captain-level service
* High table dwell time: 2–3 hours per cover
* Very low table turnover by design
* White tablecloth service standard
* Every guest detail remembered and used

**Revenue Model**

* Very high average cover value (₹2,000–₹10,000+)
* Premium wine, champagne, and pairing menus
* Private dining room hire for corporate events
* Corporate account billing
* Chef's table experiences

**Cost Profile**

* Food cost: 28–35% (premium ingredients)
* Labor cost: 35–45% (highly skilled, high staff-to-cover ratio)
* High occupancy cost in premium locations

**Typical Examples**

Luxury hotel restaurants, Michelin-star-style establishments, exclusive members clubs

**Software Implications for Atlas**

* Guest profile management is critical (dietary needs, allergies, anniversaries, past orders)
* Course-by-course ordering and serving sequence
* Detailed recipe costing essential to protect thin margins
* Reservation with cover count and deposit capture
* Premium invoice generation
* CRM-driven personalization for return visits

---

## 3.5 Café and Coffee Shop

**Definition**

A café primarily serves beverages (coffee, tea, cold drinks) with light food items (snacks, sandwiches, pastries).

**Operational Characteristics**

* Counter service standard
* Casual seating with long dwell time
* High beverage-to-food revenue ratio
* Work-from-café culture drives daytime occupancy
* Seasonal and specialty menus common
* Loyalty programs are highly effective

**Revenue Model**

* Beverage sales as primary revenue
* Food and bakery items as secondary
* Merchandise (branded mugs, beans) as tertiary
* Loyalty programs drive repeat visits

**Cost Profile**

* Food cost: 25–35% (beverages have high margin)
* Labor cost: 30–35%

**Typical Examples**

Starbucks, Café Coffee Day, Blue Tokai, Third Wave Coffee, local independent cafés

**Software Implications for Atlas**

* Beverage modifier system (size, milk type, temperature, extra shots) is complex
* Loyalty and stamp card programs essential
* Bulk order / office catering features
* Queue-based billing with name or token
* Online pre-order with in-store pickup

---

## 3.6 Cloud Kitchen / Ghost Kitchen / Dark Kitchen

**Definition**

A delivery-only kitchen with no customer-facing dining area.

**Operational Characteristics**

* Zero walk-in customers
* All orders through aggregators or own delivery platform
* Lower rent and overhead due to no dining space
* Multiple virtual brands possible from one kitchen
* Packaging and delivery time are key brand differentiators

**Revenue Model**

* 100% delivery orders
* Multiple virtual brands from one kitchen multiply revenue
* Reduced overhead increases margin per order

**Cost Profile**

* Food cost: 30–40%
* Labor cost: 15–20% (smaller crew, no FOH)
* Aggregator commissions: 15–30% (major cost driver)

**Typical Examples**

Rebel Foods (Faasos, Behrouz Biryani), Box8, EatFit, independent cloud kitchen operators

**Software Implications for Atlas**

* Aggregator integration is not optional — it is the entire channel
* Multi-brand management from one dashboard
* Brand-specific menus, pricing, and packaging rules
* Delivery time estimation and live tracking
* No table management module required
* Kitchen-first workflow (no FOH)

---

## 3.7 Food Truck

**Definition**

A mobile restaurant that operates from a vehicle, changing locations by schedule or demand.

**Operational Characteristics**

* Location varies daily, weekly, or by event
* Compact and focused menu
* High volume during peak location periods
* Events, corporate parks, markets as typical venues
* Lower fixed overhead but licensing and location fees vary
* Weather-dependent operations

**Revenue Model**

* High turnover at popular locations
* Event catering contracts
* Pre-ordered catering for office parks

**Software Implications for Atlas**

* Offline billing is critical — connectivity is unreliable
* Location-based reporting (revenue by location)
* Compact menu with fast billing interface
* Mobile-first billing application
* Event-based pricing capability

---

## 3.8 Franchise Restaurant

**Definition**

A restaurant operating under a license from a parent brand, following standardized procedures and branding.

**Operational Characteristics**

* Standardized menu, pricing, and operating procedures
* Royalty fees paid to franchisor (typically 4–8% of revenue)
* Marketing contribution mandatory
* Multiple franchisee owners operate under one brand
* Consistency across all locations is critical to brand value

**Revenue Model for Franchisee**

* Per-location net revenue after royalties and fees
* Local marketing may add revenue

**Revenue Model for Franchisor**

* Initial franchise fee (one-time)
* Royalty income (recurring percentage of franchisee revenue)
* Technology platform fee
* Supply chain margin

**Software Implications for Atlas**

* Franchisor portal: centralized menu management, brand compliance monitoring
* Franchisee portal: individual outlet operations
* Consolidated analytics across all franchisee locations
* Role-based permissions — franchisee cannot override brand-mandated menu items or prices
* Royalty and fee calculation automation

---

## 3.9 Bakery and Patisserie

**Definition**

A food production business that manufactures and sells baked goods for walk-in retail, wholesale, and custom orders.

**Operational Characteristics**

* Production schedule drives operations (unlike service-driven restaurants)
* Batch manufacturing of products
* Shelf life and expiry management critical
* Custom order production (wedding cakes, corporate catering)
* Wholesale channel to hotels, cafés, and restaurants

**Revenue Model**

* Walk-in retail sales
* Wholesale supply to businesses
* Custom order production

**Software Implications for Atlas**

* Production planning module distinct from order management
* Raw material to finished goods conversion (production recipes)
* Expiry date tracking on perishable products
* Custom order management with design notes and delivery scheduling
* Wholesale pricing rules separate from retail pricing

---

## 3.10 Bar and Lounge

**Definition**

An establishment primarily serving alcohol with food as a secondary offering.

**Operational Characteristics**

* Liquor inventory management is complex
* Happy hour pricing common
* Age verification requirements in regulated markets
* Late night operations
* Both table service and bar counter service
* High-margin beverage sales

**Revenue Model**

* Beverage sales as primary (very high margin — 70–80% gross margin on alcohol)
* Food as secondary offering to increase dwell time
* Private events, DJ nights, and party packages

**Software Implications for Atlas**

* Liquor license compliance documentation
* Age verification record keeping
* Happy hour and time-based pricing rules
* Bar tab management (open tabs across the evening)
* Bottle service management (premium bottle reservations)
* Excise duty reporting

---

## 3.11 Hotel Restaurant

**Definition**

A restaurant operating as part of a hotel property, serving hotel guests and walk-in customers.

**Operational Characteristics**

* Room service integration is mandatory
* Hotel guest loyalty program tied to restaurant experience
* Multiple restaurant concepts may exist within one hotel
* Conference and event catering as a significant revenue stream
* Business traveler and leisure guest differ in behavior

**Revenue Model**

* In-room dining
* Restaurant dine-in
* Minibar and in-room snacks
* Event and conference catering
* Breakfast packages for hotel guests

**Software Implications for Atlas**

* Hotel PMS (Property Management System) integration
* Room charge posting (post bill to room number)
* Guest profile linked to hotel reservation
* Multi-outlet billing (multiple restaurants under one hotel entity)
* Conference room booking and catering invoice

---

## 3.12 Canteen and Institutional Dining

**Definition**

A food service operation serving a captive audience within an institution (corporate office, school, hospital, factory).

**Operational Characteristics**

* Fixed meal times (breakfast, lunch, dinner)
* Subscription-based meal plans common
* Pre-ordering through apps or counters
* Institutional subsidy on meal cost
* Minimal wastage tolerance — production is planned

**Revenue Model**

* Daily meal subscriptions
* A la carte during service hours
* Institutional contract for subsidized meals

**Software Implications for Atlas**

* Pre-order and meal plan subscription management
* Employee card / RFID / biometric meal deduction
* Subsidy calculation and billing to institution
* Production planning from pre-order data
* Wastage minimization reporting

---

# 4. Multi-Brand and Multi-Model Operations

A growing number of restaurant groups operate across multiple models simultaneously.

```
Restaurant Group (Example)
│
├── Fine Dining Brand A       (Casual Dining model)
├── QSR Chain Brand B         (QSR model — 30 outlets)
├── Cloud Kitchen Brand C     (Delivery-only — 5 kitchens)
└── Bakery Brand D            (Bakery model)
```

**Project Atlas must support:**

* Multiple brands under one owner account
* Different operational rules per brand
* Consolidated analytics and reporting across all brands
* Brand-specific menus, pricing, and staff permissions
* Branch-level, brand-level, and group-level reporting

---

# 5. Comparative Summary

| Business Model     | Dine-In | Delivery | Reservation | Kitchen-Driven | Multi-Brand |
| ------------------ | ------- | -------- | ----------- | -------------- | ----------- |
| QSR                | Yes     | Yes      | No          | No             | Possible    |
| Fast Casual        | Yes     | Yes      | No          | No             | No          |
| Casual Dining      | Yes     | Part     | Yes         | No             | No          |
| Fine Dining        | Yes     | No       | Yes         | No             | No          |
| Café               | Yes     | Yes      | No          | No             | No          |
| Cloud Kitchen      | No      | Yes      | No          | Yes            | Yes         |
| Food Truck         | Part    | No       | No          | No             | No          |
| Franchise          | Yes     | Yes      | Varies      | No             | Yes         |
| Bakery             | Yes     | Yes      | Part        | Yes            | No          |
| Bar                | Yes     | No       | Part        | No             | No          |
| Hotel Restaurant   | Yes     | Yes      | Yes         | No             | Yes         |
| Canteen            | Yes     | No       | No          | Yes            | No          |

---

# 6. Software Module Requirements by Business Model

| Module                  | QSR | Casual | Fine | Café | Cloud | Bakery | Bar | Hotel | Canteen |
| ----------------------- | --- | ------ | ---- | ---- | ----- | ------ | --- | ----- | ------- |
| Table Management        | No  | Yes    | Yes  | Part | No    | No     | Yes | Yes   | No      |
| Reservations            | No  | Part   | Yes  | No   | No    | No     | Part| Yes   | No      |
| KDS                     | Yes | Yes    | Yes  | Part | Yes   | No     | No  | Yes   | Yes     |
| Aggregator Integration  | Yes | Yes    | No   | Yes  | Yes   | No     | No  | No    | No      |
| Loyalty                 | Yes | Yes    | Yes  | Yes  | Yes   | Yes    | No  | Yes   | Part    |
| Recipe Costing          | Yes | Yes    | Yes  | Yes  | Yes   | Yes    | Yes | Yes   | Yes     |
| Multi-Brand             | No  | No     | No   | No   | Yes   | No     | No  | Yes   | No      |
| Room Service            | No  | No     | No   | No   | No    | No     | No  | Yes   | No      |
| Production Planning     | No  | No     | No   | Part | No    | Yes    | No  | No    | Yes     |
| Offline Billing         | Yes | Part   | No   | Part | No    | Part   | No  | No    | No      |
| Bar Tab Management      | No  | No     | No   | No   | No    | No     | Yes | Part  | No      |
| Franchise Portal        | No  | No     | No   | No   | No    | No     | No  | No    | No      |
| Meal Subscriptions      | No  | No     | No   | No   | No    | No     | No  | No    | Yes     |

---

# 7. Industry Profitability Benchmarks

| Business Model   | Avg Net Margin | Food Cost % | Labor Cost % | Aggregator Cost % |
| ---------------- | -------------- | ----------- | ------------ | ----------------- |
| QSR              | 6–9%           | 28–32%      | 25–30%       | 0–8%              |
| Fast Casual      | 6–9%           | 28–35%      | 28–33%       | 5–15%             |
| Casual Dining    | 3–9%           | 28–35%      | 30–35%       | 2–8%              |
| Fine Dining      | 5–10%          | 28–35%      | 35–45%       | 0%                |
| Café             | 7–12%          | 25–35%      | 30–35%       | 5–10%             |
| Cloud Kitchen    | 10–20%         | 30–40%      | 15–20%       | 15–30%            |
| Bar              | 10–15%         | 18–24%      | 25–30%       | 0%                |

---

# 8. Key Takeaways

* No single business model describes all restaurants.
* Project Atlas must be configurable per business model at the tenant level.
* Core modules (billing, inventory, reporting) are universal across all models.
* Specialized modules (room service, production planning, franchise management) are model-specific.
* Configuration options must not require code changes — all model-specific behavior must be toggle-driven.
* Every module specification must reference which business models it applies to.

---

# Related Documents

* DOM-101 — Restaurant Industry Overview
* DOM-103 — Restaurant Types
* DOM-104 — Restaurant Organizational Structure
* DOM-105 — Restaurant Departments

---

# Next Document

DOM-103 — Restaurant Types

---

# Revision History

| Version | Date       | Author         | Description              |
| ------- | ---------- | -------------- | ------------------------ |
| 1.0.0   | 2026-06-25 | Vraj Prajapati | Initial document created |

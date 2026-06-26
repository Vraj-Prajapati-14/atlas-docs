# DOM-103 — Restaurant Types

| Field          | Value               |
| -------------- | ------------------- |
| Document ID    | DOM-103             |
| Title          | Restaurant Types    |
| Version        | 1.0.0               |
| Status         | Draft               |
| Category       | Domain Research     |
| Owner          | Product Team        |
| Repository     | atlas-docs          |
| Classification | Internal            |
| Last Updated   | 2026-06-25          |

---

# 1. Purpose

This document catalogs every major type of restaurant that Project Atlas must support.

Each restaurant type has a unique operational model, different workflows, different staff requirements, different hardware needs, and different software requirements.

Understanding restaurant types prevents building software that works perfectly for one type and fails for others.

A cashier workflow in a fine dining restaurant is fundamentally different from a cashier workflow in a dhaba. If our software does not account for this, we will lose customers in one segment or the other.

---

# 2. Classification Framework

Restaurant types are classified along four dimensions:

| Dimension      | Examples                              |
| -------------- | ------------------------------------- |
| Service Style  | Counter, Table, Buffet, Self-Service  |
| Price Point    | Budget, Mid-Range, Premium, Luxury    |
| Cuisine Focus  | Indian, Continental, Multi-Cuisine    |
| Audience       | Dine-in, Delivery-only, Institutional |

A single establishment may span multiple categories.

---

# 3. Restaurant Type Profiles

## 3.1 Quick Service Restaurant (QSR)

**Overview**

A fast food format focused on speed, consistency, and volume.

**Typical Size**

* 300–2,000 sq ft
* 20–100 seats
* 3–15 staff per shift

**Service Style**

Counter ordering, no table service, self-seating.

**Menu Characteristics**

* Standardized menu across locations
* Limited SKUs (30–80 items)
* Combo meals prominent
* No alcohol
* Packaging for takeaway always available

**Operational Characteristics**

* Target service time: under 3 minutes
* High daily transaction volume (200–800 orders/day)
* Strong emphasis on throughput
* Peak hours: 12–2 PM and 7–9 PM

**Staffing**

* Counter staff
* Cashier
* Kitchen staff (line cooks)
* Packaging staff
* Manager on duty

**Technology Requirements**

* Fast POS with touchscreen ordering
* KDS for kitchen
* Aggregator integration
* Token/queue display
* Cash drawer + card terminal

**Unique Challenges**

* Rush hour queue management
* Consistency of preparation
* Staff attrition rate
* Aggregator commission eating margins

**Indian Examples**

McDonald's India, KFC, Burger King, Jumboking, Wok to Walk, local fast food counters

---

## 3.2 Fast Casual Restaurant

**Overview**

Higher quality food than QSR, with ordering at a counter but delivery to the table.

**Typical Size**

* 500–2,500 sq ft
* 30–120 seats

**Service Style**

Counter ordering, food delivered to table by staff.

**Menu Characteristics**

* Customizable orders (build-your-own format)
* 40–120 items
* Fresh ingredients, shorter shelf life
* Craft beverages

**Operational Characteristics**

* Service time: 5–10 minutes
* Medium transaction volume (100–400 orders/day)
* High order complexity due to customization

**Technology Requirements**

* POS with modifier engine
* Order-ready display or table buzzer
* Inventory tracking for fresh ingredients
* Aggregator integration

**Indian Examples**

Biryani By Kilo, Wow! Momo, Behrouz Biryani, Chaayos, Keventers

---

## 3.3 Casual Dining Restaurant

**Overview**

Full-service restaurant with table service, broad menu, and mid-range pricing.

**Typical Size**

* 1,000–5,000 sq ft
* 40–200 seats

**Service Style**

Waiter service at table, from ordering to billing.

**Menu Characteristics**

* Broad menu (80–200+ items)
* Starters, mains, desserts, beverages
* Liquor service common
* Daily specials

**Operational Characteristics**

* Table dwell time: 45–90 minutes
* Target turnover: 2–3 covers per table per service
* Reservation and walk-in mix
* Multiple sections (indoor, outdoor, bar)

**Staffing**

* Host / Hostess
* Captain / Senior Waiter
* Waiter / Server
* Runner
* Bartender
* Chef
* Sous Chef
* Cashier

**Technology Requirements**

* Full POS with table management
* Reservation system
* KOT printing or KDS
* Split billing, table transfer, table merge
* Loyalty program

**Indian Examples**

Barbeque Nation, Mainland China, Paradise Restaurant, Social, The Irish House

---

## 3.4 Fine Dining Restaurant

**Overview**

Premium restaurant with formal service, curated menu, and high average spend.

**Typical Size**

* 1,500–6,000 sq ft
* 30–120 seats
* High cost per square foot

**Service Style**

White tablecloth service with captain-led team per section.

**Menu Characteristics**

* Short, curated menu (20–50 items)
* Tasting menus common
* Seasonal menu changes
* Extensive wine list

**Operational Characteristics**

* Table dwell time: 90–180 minutes
* Intentionally low table turnover
* Reservation-only or heavy reservation dependency
* Every guest detail matters for service personalization

**Critical Workflows**

* Pre-meal brief (manager communicates special guests, dietary requirements)
* Amuse-bouche before ordering
* Course-by-course ordering with timing management
* Sommelier recommendation and pairing
* Tableside preparation (live carving, flambe)

**Technology Requirements**

* Guest CRM with dietary preferences, allergies, special occasions
* Reservation with deposit and cancellation policy
* Course-by-course ordering with kitchen timing
* Detailed recipe costing and gross margin tracking
* Premium invoice design

**Indian Examples**

Indian Accent, Masque, Tresind Mumbai, Farzi Café (upscale), luxury hotel restaurants

---

## 3.5 Café / Coffee Shop

**Overview**

Beverage-led establishment with light food, casual seating, and high dwell times.

**Typical Size**

* 300–2,000 sq ft
* 15–80 seats

**Service Style**

Counter ordering with table delivery or pick-up.

**Menu Characteristics**

* Coffee, tea, juices, smoothies as primary
* Sandwiches, salads, bakery items as secondary
* Seasonal specials (pumpkin spice, monsoon menu)
* Branded merchandise

**Unique Characteristics**

* Work-from-café culture → long table occupancy
* High beverage margin (60–70%)
* Loyalty programs extremely effective
* Mobile pre-order growing rapidly

**Technology Requirements**

* Beverage modifier system (milk type, temperature, size, shots)
* Loyalty stamp card and rewards
* Pre-order with pickup queue
* Staff-assigned stations (brewing, food, billing)
* Inventory tracking for perishable milk, syrups

**Indian Examples**

Starbucks, Café Coffee Day, Blue Tokai, Third Wave Coffee, Sleepy Owl, Subko

---

## 3.6 Cloud Kitchen / Ghost Kitchen

**Overview**

Delivery-only kitchen with no customer-facing dining area.

**Typical Size**

* 200–1,000 sq ft (commercial kitchen only)
* Zero dining area

**Service Style**

100% delivery — aggregator platforms or own delivery app.

**Operational Characteristics**

* Multiple virtual brands possible from one kitchen
* Each brand has its own menu, pricing, and packaging
* Aggregator commission is the primary cost concern
* Delivery time is brand reputation

**Critical Workflows**

* Aggregator order received → KDS display → preparation → packaging → handover to delivery partner
* No table management
* Multiple brand menus managed centrally

**Technology Requirements**

* Aggregator integration (mandatory): Zomato, Swiggy, Thrive
* Multi-brand dashboard
* Auto-accept order configuration
* Packaging label printing
* Delivery time estimation
* Kitchen-first display without any FOH features

**Indian Examples**

Rebel Foods (Faasos, Behrouz, Oven Story), Box8, EatFit, Licious, Social (dark kitchen model)

---

## 3.7 Dhaba

**Overview**

A roadside or highway food establishment serving traditional Indian food at low price points.

**Typical Size**

* 200–1,500 sq ft
* 10–60 seats
* Open-air or semi-open seating common

**Service Style**

Waiter service with informal protocol. No reservations.

**Menu Characteristics**

* North Indian or regional cuisine
* Dal makhani, roti, rice, curries, tandoor items
* No printed menu in many cases — verbal menu announcement
* Low average order value (₹80–₹300)

**Operational Characteristics**

* Very high volume on highways
* Cash-dominant transactions
* Simple kitchen with one or two cooking stations
* Minimal staff hierarchy

**Unique Challenges**

* Limited connectivity on highways (offline billing critical)
* Cash reconciliation prone to errors
* No loyalty programs historically
* Owner/manager is often the same person

**Technology Requirements**

* Simple POS with quick bill generation
* Offline billing capability
* Cash management and daily report
* Low hardware requirement (one billing terminal)
* WhatsApp receipt delivery

---

## 3.8 Mess / Tiffin Service

**Overview**

A subscription-based food service providing fixed meals to a regular set of customers.

**Typical Size**

* Kitchen-first, minimal dining area
* 10–50 regular subscribers

**Service Style**

Subscription meal delivery or counter pickup. Fixed menu per day.

**Menu Characteristics**

* Pre-planned weekly menu
* Fixed thali format
* Minimal customization

**Operational Characteristics**

* Planned production based on subscriber count
* Delivery to homes or offices
* Monthly billing model

**Technology Requirements**

* Subscription management (add/cancel/pause)
* Pre-planned production orders
* Monthly invoice generation
* Delivery tracking
* Attendance-based billing (customer marks present days)

---

## 3.9 Canteen (Corporate / School / Hospital)

**Overview**

An institutional food service within a closed campus.

**Typical Size**

* 500–3,000 sq ft
* Varies significantly by institution size

**Service Style**

Counter service with meal plan subscriptions. Fixed meal times.

**Operational Characteristics**

* Captive audience (employees, students, patients)
* Institutional subsidy on meal cost
* Fixed meal windows (7–9 AM, 12–2 PM, 7–9 PM)
* Pre-order by institution members

**Technology Requirements**

* Employee meal plan management
* RFID / biometric meal deduction
* Subsidy calculation and institutional billing
* Pre-order portal for members
* Wastage reporting for production planning

---

## 3.10 Bakery and Patisserie

**Overview**

A production-first food business selling baked goods for retail, wholesale, and custom orders.

**Typical Size**

* 200–1,500 sq ft (retail)
* 500–5,000 sq ft (production + retail)

**Service Style**

Counter retail, delivery for custom and wholesale orders.

**Operational Characteristics**

* Production schedule drives the day (baking starts at 3–5 AM)
* Batch manufacturing
* Expiry and shelf life are critical
* Custom orders (wedding cakes, corporate) are high-value

**Technology Requirements**

* Production planning with batch recipes
* Ingredient consumption tracking
* Expiry date management
* Custom order intake with design notes and delivery scheduling
* Wholesale pricing rules separate from retail

**Indian Examples**

Theobroma, Wenger's, Mad Over Donuts, local bakeries

---

## 3.11 Bar and Lounge

**Overview**

Beverage-primary establishment serving alcohol with food as a complementary offering.

**Typical Size**

* 500–5,000 sq ft
* 30–200 seats + bar counter seating

**Service Style**

Bar counter service and table service both.

**Operational Characteristics**

* Liquor inventory management complex and compliance-driven
* Happy hour pricing requires time-based pricing rules
* Late night operations (revenue peaks after 9 PM)
* Age verification in regulated markets
* High-margin beverage business

**Technology Requirements**

* Bar tab management (open-tab billing across the evening)
* Time-based (happy hour) pricing
* Bottle service management (premium bottle reservations)
* Liquor stock tracking and compliance reporting
* Late-night shift reports

**Indian Examples**

Toit, The Biere Club, Hard Rock Cafe, Irish House, Lord of the Drinks

---

## 3.12 Juice Center / Beverage Shop

**Overview**

A counter-service establishment specializing in fresh juices, milkshakes, and beverages.

**Typical Size**

* 50–300 sq ft
* Minimal seating

**Service Style**

Counter ordering with immediate preparation.

**Operational Characteristics**

* Very fast service (2–3 minutes)
* Fresh ingredient management critical (daily fruit procurement)
* High perishability of raw materials

**Technology Requirements**

* Fast counter billing
* Fresh ingredient consumption tracking
* Daily procurement planning
* Waste management for unsold produce

---

## 3.13 Tea Stall (Chai Shop)

**Overview**

A small counter establishment primarily serving tea and basic snacks.

**Typical Size**

* 50–200 sq ft
* 5–15 seats or standing only

**Operational Characteristics**

* Very high transaction volume, very low APC (₹10–₹50)
* Cash-only transactions historically
* UPI adoption growing
* Minimal documentation traditionally

**Technology Requirements**

* Simple billing (digital KOT optional)
* End of day cash count
* UPI payment integration
* Basic daily sales report (WhatsApp delivery)

---

## 3.14 Pizza Store

**Overview**

A pizza-focused QSR or fast casual restaurant with strong delivery operations.

**Typical Size**

* 300–2,000 sq ft
* 10–60 dine-in seats

**Operational Characteristics**

* Strong delivery focus
* Customization of toppings is key
* Time-to-delivery is brand KPI
* Combo and discount-driven marketing

**Technology Requirements**

* Topping modifier system
* Delivery time tracking
* Aggregator integration
* Size and crust selection
* Coupon and combo management

**Indian Examples**

Domino's, Pizza Hut, La Pino'z, Sbarro, local pizza shops

---

## 3.15 Ice Cream Parlour

**Overview**

A dessert-focused establishment selling ice creams, gelatos, sundaes, and dessert drinks.

**Typical Size**

* 100–600 sq ft

**Operational Characteristics**

* High seasonality (summer peaks)
* Many SKUs across flavors and formats
* Production (in-house churning) or retail (branded supply)
* Short shelf life for soft-serve and artisan gelato

**Technology Requirements**

* Flavor and topping modifier system
* Inventory tracking per flavor
* Production batch recording
* Seasonal menu management

**Indian Examples**

Naturals, Baskin-Robbins, Amul, Giani's, local artisan gelato shops

---

## 3.16 Sweet Shop (Mithai Shop)

**Overview**

A traditional retail establishment selling Indian sweets, snacks, and savories.

**Typical Size**

* 100–1,000 sq ft

**Operational Characteristics**

* Weight-based selling (priced per 100g or 250g)
* Production in-house or outsourced
* Festive season spikes (Diwali, Holi, Eid) are significant
* Corporate gifting is a major revenue stream
* Shelf life varies by product type

**Technology Requirements**

* Weight-based billing integration (connected weighing scale)
* Festive season production planning
* Corporate gift order management
* Expiry date tracking by batch

**Indian Examples**

Haldiram's, Bikanervala, Mithai shops (regional)

---

## 3.17 Hotel Restaurant

**Overview**

A restaurant operating within a hotel property serving hotel guests and walk-in customers.

**Operational Characteristics**

* In-room dining integration mandatory
* Guest charges posted to room bill
* Multiple restaurant concepts under one hotel entity
* Corporate clients through hotel accounts
* Breakfast package billing linked to room reservation

**Technology Requirements**

* Hotel PMS integration
* Room number charge posting
* Multi-outlet management under one hotel account
* Guest profile linked to hotel reservation system
* Conference and event catering with AV and room hire billing

**Indian Examples**

ITC Hotels restaurants, Taj Hotels restaurants, Marriott hotel restaurants

---

## 3.18 Food Court

**Overview**

Multiple food vendors operating in a shared dining space (typically in malls, airports, or transit hubs).

**Operational Characteristics**

* Each vendor has own kitchen, shared seating
* Common billing terminal or vendor-specific billing
* Management entity operates the common space

**Technology Requirements**

* Multi-vendor billing
* Common area order tracking
* Revenue sharing and settlement between vendors and food court management
* Queue management for peak times

---

## 3.19 Franchise Restaurant

**Overview**

Any restaurant type operating under a licensed brand agreement with a franchisor.

**Unique Operational Characteristics**

* Two distinct software users: franchisor and franchisee
* Franchisor controls: menu, pricing, brand standards
* Franchisee operates: daily business, staff, local purchasing
* Royalty reporting mandatory

**Technology Requirements**

* Franchisor portal: brand management, consolidated reporting, compliance monitoring
* Franchisee portal: daily operations within defined boundaries
* Auto-calculated royalty billing
* Standardized reporting templates that flow up to franchisor

---

# 4. Restaurant Types vs. Software Modules

| Type             | Table Mgmt | Reservations | KDS | Aggregator | Production | Weight Billing | Room Charge | Franchise Portal |
| ---------------- | ---------- | ------------ | --- | ---------- | ---------- | -------------- | ----------- | ---------------- |
| QSR              | No         | No           | Yes | Yes        | No         | No             | No          | No               |
| Fast Casual      | Part       | No           | Yes | Yes        | No         | No             | No          | No               |
| Casual Dining    | Yes        | Yes          | Yes | Part       | No         | No             | No          | No               |
| Fine Dining      | Yes        | Yes          | Yes | No         | No         | No             | No          | No               |
| Café             | Part       | No           | No  | Yes        | No         | No             | No          | No               |
| Cloud Kitchen    | No         | No           | Yes | Yes        | No         | No             | No          | No               |
| Dhaba            | Part       | No           | No  | No         | No         | No             | No          | No               |
| Mess             | No         | No           | No  | No         | Yes        | No             | No          | No               |
| Canteen          | No         | No           | No  | No         | Yes        | No             | No          | No               |
| Bakery           | No         | No           | No  | No         | Yes        | No             | No          | No               |
| Bar              | Yes        | Part         | No  | No         | No         | No             | No          | No               |
| Juice Center     | No         | No           | No  | No         | No         | No             | No          | No               |
| Pizza Store      | Part       | No           | Yes | Yes        | No         | No             | No          | No               |
| Ice Cream        | No         | No           | No  | No         | Part       | No             | No          | No               |
| Sweet Shop       | No         | No           | No  | No         | Yes        | Yes            | No          | No               |
| Hotel Restaurant | Yes        | Yes          | Yes | No         | No         | No             | Yes         | No               |
| Food Court       | No         | No           | Yes | No         | No         | No             | No          | No               |
| Franchise        | Varies     | Varies       | Yes | Yes        | No         | No             | No          | Yes              |

---

# 5. Key Takeaways

* India has unique restaurant types (dhaba, mithai shop, mess) that global POS products completely miss.
* This is a competitive advantage — Atlas can serve segments that Lightspeed and Toast do not understand.
* Every type has at least one non-obvious software requirement that generic POS products ignore.
* Atlas must support configuration profiles that can be activated per restaurant type.
* A single Atlas installation may need to support 3–4 different types within one restaurant group.

---

# Related Documents

* DOM-102 — Restaurant Business Models
* DOM-104 — Restaurant Organizational Structure
* DOM-105 — Restaurant Departments

---

# Next Document

DOM-104 — Restaurant Organizational Structure

---

# Revision History

| Version | Date       | Author         | Description              |
| ------- | ---------- | -------------- | ------------------------ |
| 1.0.0   | 2026-06-25 | Vraj Prajapati | Initial document created |

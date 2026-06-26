# DOM-107 — Restaurant Daily Operations

| Field          | Value                        |
| -------------- | ---------------------------- |
| Document ID    | DOM-107                      |
| Title          | Restaurant Daily Operations  |
| Version        | 1.0.0                        |
| Status         | Draft                        |
| Category       | Domain Research              |
| Owner          | Product Team                 |
| Repository     | atlas-docs                   |
| Classification | Internal                     |
| Last Updated   | 2026-06-25                   |

---

# 1. Purpose

This document describes what happens inside a restaurant from the moment it opens to the moment it closes.

Every software engineer on Project Atlas must understand this completely.

A restaurant is not a static software system. It is a live, time-sensitive operation with dozens of people executing interdependent tasks simultaneously, under pressure, with customers watching.

Software that does not account for this operational reality will fail in production — not because of technical bugs, but because it doesn't fit how the work actually gets done.

---

# 2. The Restaurant Day at a Glance

A typical full-service restaurant day follows this arc:

```
Pre-Opening (2–3 hours before service)
         ↓
Opening (30 minutes before service)
         ↓
Lunch Service (12:00 PM – 3:30 PM)
         ↓
Afternoon Break / Prep (3:30 PM – 6:30 PM)
         ↓
Dinner Service (7:00 PM – 11:00 PM)
         ↓
Closing (Last table served + 60–90 minutes)
         ↓
End of Day Reporting and Cash Close
         ↓
Overnight Prep (for next day)
```

The timings and structure vary significantly by restaurant type (QSR, fine dining, café, cloud kitchen), but the sequence of activities is consistent.

---

# 3. Pre-Opening Phase

**Time:** 2–3 hours before first service

**Who is involved:** Head Chef, Kitchen Staff, Inventory Manager, Manager on Duty

### 3.1 Kitchen Prep Activities

The most critical pre-service work happens in the kitchen.

**Activities:**

* Review today's expected cover count (from reservations)
* Pull inventory from stores based on prep list
* Check freshness and quality of perishables
* Begin prep cooking:
  * Chop vegetables
  * Marinate proteins
  * Prepare base sauces and gravies
  * Blanch, parboil, or par-cook long-cooking items
  * Make desserts and pastry items
  * Portion proteins according to recipe card
* Label all prepped containers with item name and prep time
* Set up each station with tools, plates, and mise en place

**Failure scenarios Atlas must handle:**
* Inventory shortage discovered during prep → system should alert immediately
* Item from yesterday evening not sold → mark as carry-forward or waste
* Unexpected large reservation arrives → system should allow emergency stock indent

---

### 3.2 Inventory Opening Check

**Who:** Inventory Manager

**Activities:**

* Physical check of key items (meat, dairy, produce)
* Verify yesterday's closing stock against system balance
* Identify discrepancies and raise alerts
* Receive any early morning vendor deliveries (GRN process)
* Issue prep stock to kitchen with indent

**Software Touchpoints:**

* Morning stock dashboard
* GRN creation
* Issue indent
* Low stock alerts

---

### 3.3 FOH Setup

**Who:** Floor Manager, Captains, Waiters

**Activities:**

* Clean dining area (tables, chairs, floors, windows)
* Set tables (cutlery, napkins, condiments, flowers)
* Check AC, lighting, music are functioning
* Brief staff on today's specials and unavailable items
* Review reservation list for the day
* Assign sections to waiters
* Prepare the host station (reservation book, table plan)

**Software Touchpoints:**

* View reservation list for the day
* Check table availability status
* Update unavailable menu items (86 list)

---

### 3.4 Manager Pre-Service Briefing

**Who:** General Manager or Floor Manager

**Agenda:**

* Yesterday's performance highlights
* Today's reservations and VIP guests
* Menu changes or additions
* Staff assignments and section coverage
* Any operational reminders or issues

**Software Touchpoints:**

* Previous day summary report
* Reservation dashboard
* Staff attendance check

---

# 4. Opening

**Time:** 30 minutes before first service

### 4.1 Cashier Station Setup

**Who:** Cashier

**Activities:**

* Receive opening cash float from manager
* Count and verify opening float
* Log into POS system
* Verify POS connectivity (internet, printer)
* Stock receipt paper in all printers
* Ensure card terminal is powered and connected
* Test print a sample receipt

**Software Touchpoints:**

* Cash float opening entry
* System login with shift start
* Printer connectivity check

---

### 4.2 Kitchen Ready Check

**Who:** Head Chef / Sous Chef

**Activities:**

* Verify all stations are set up
* Confirm all prep is complete for first service
* Confirm all KDS screens are on and working
* Taste-check key items for consistency
* Post daily specials on kitchen board

**Software Touchpoints:**

* KDS screen check
* Recipe card access for new specials
* Prep completion status

---

### 4.3 System Readiness

**Who:** Manager

* POS terminal is online and responsive
* Reservation system is updated with latest bookings
* KDS screens are connected
* All staff are logged in with correct roles
* Aggregator tablets are online (for delivery)

---

# 5. Lunch Service

**Time:** 12:00 PM – 3:30 PM (typical)

This is a high-velocity period. Everything that can go wrong does go wrong here.

### 5.1 Customer Arrival Flow

```
Customer Arrives at Entrance
           ↓
Host checks walk-in / reservation
           ↓
Reservation → Confirm and seat at reserved table
Walk-in → Check availability → Seat or add to waitlist
           ↓
Table assigned on floor plan
           ↓
Waiter assigned to table
           ↓
Waiter greets and presents menu
```

**Software Touchpoints:**

* Reservation lookup by name/phone
* Table status view (available/occupied/reserved/cleaning)
* Table assignment
* Waitlist management with estimated wait time

---

### 5.2 Order Taking Flow

```
Waiter takes order from customer
           ↓
Enters order into POS / mobile device
           ↓
Adds modifiers, cooking instructions, special requests
           ↓
Confirms order with customer
           ↓
Submits KOT
           ↓
KOT appears on KDS at kitchen (and bar for beverages)
           ↓
Kitchen acknowledges KOT
```

**Software Touchpoints:**

* POS order entry with modifier support
* Table-linked KOT
* KOT routing (food → kitchen KDS, beverages → bar KDS)
* Order status tracking (submitted, acknowledged, in progress, ready, served)

**Edge cases Atlas must handle:**

* Item out of stock → alert waiter immediately, suggest alternative
* Special dietary request (no onion, extra spicy) → passes to kitchen with highlight
* Customer changes mind after KOT sent → amendment KOT with diff
* Customer cancels item after kitchen has started → void item, manager authorization

---

### 5.3 Kitchen Execution Flow

```
KOT received on KDS
           ↓
Chef acknowledges ticket
           ↓
Station chef prepares assigned items
           ↓
All items for one table complete
           ↓
Chef marks table as ready on KDS
           ↓
Runner picks up food from pass
           ↓
Waiter serves correct items to correct seats
```

**Software Touchpoints:**

* KDS order display sorted by time
* Item status update (in progress, ready)
* Ticket timer (escalates color at threshold: yellow at 10 min, red at 15 min)
* Kitchen throughput tracking

---

### 5.4 Additional Orders

Customers often order more during the meal (beverages, starters, desserts).

**Flow:**

* Waiter takes additional order at table
* New KOT raised as addendum to existing table order
* Kitchen processes in sequence
* All orders linked to same table for consolidated billing

**Software Touchpoints:**

* Add items to existing open order
* Clear KOT sequencing (what was served vs. what is pending)

---

### 5.5 Billing Flow

```
Customer requests bill
           ↓
Waiter calls bill via POS
           ↓
Cashier reviews open table order
           ↓
Cashier applies discounts (if any, with authorization)
           ↓
Cashier applies applicable taxes (GST)
           ↓
Cashier adds service charge (if applicable)
           ↓
Bill generated and presented to customer
           ↓
Customer reviews bill
           ↓
Customer selects payment mode
           ↓
Payment processed
           ↓
Receipt generated (print + digital)
           ↓
Table marked as billing complete
           ↓
Table marked for cleaning
```

**Software Touchpoints:**

* Open order to bill conversion
* Discount application with authorization
* GST calculation (item-wise tax rates)
* Multi-mode payment (cash + card + UPI)
* Split bill by seat or custom amount
* Digital receipt via WhatsApp / email
* Table status update

**Edge cases Atlas must handle:**

* Split bill (3 friends paying separately)
* Partial payment (₹500 cash + rest UPI)
* Coupon or discount code at billing
* Loyalty points redemption
* Bill dispute (item not ordered)
* Card machine failure (fallback to manual note)
* GST exemption for specific items

---

# 6. Afternoon Break / Inter-Service Prep

**Time:** 3:30 PM – 6:30 PM (typical)

This period is used for preparation for the evening service, maintenance, and staff breaks.

### 6.1 Kitchen Activities

* Deep clean of stations
* Replenish depleted prep items
* Review evening reservation count
* Prepare for evening service menu
* Chef and manager review any issues from lunch

**Software Touchpoints:**

* Inventory check after lunch service
* Low stock alerts
* Issue fresh indent to stores

---

### 6.2 FOH Activities

* Clean and reset tables
* Address any damaged linen or equipment
* Staff breaks in rotation
* FOH manager reviews lunch service feedback

---

### 6.3 Inventory and Procurement Activities

* Post-lunch inventory reconciliation
* Raise urgent purchase requests for items below par
* Process pending GRNs from morning deliveries
* Vendor follow-up on pending orders

**Software Touchpoints:**

* Inventory variance check
* Emergency purchase request
* GRN completion

---

### 6.4 Management Activities

* Review lunch service report
* Address any HR or staff issues
* Approve purchase orders
* Review reservations for evening
* Check aggregator order volume trends

---

# 7. Evening Service

**Time:** 7:00 PM – 11:00 PM (typical)

Evening service is typically the highest-revenue period.

**Key differences from lunch service:**

* Reservation density is higher
* Average spend per cover is higher
* Liquor service is more prominent
* Tables are booked for occasions (birthdays, anniversaries)
* Kitchen is under longer sustained pressure

### 7.1 Pre-Evening Briefing

* Manager briefs staff on evening reservations
* VIP guests, birthdays, anniversaries flagged
* Kitchen confirms prep readiness
* Bar confirms cocktail ingredient availability

**Software Touchpoints:**

* Evening reservation list with VIP tags
* Kitchen prep completion status
* Staff roster for evening shift

---

### 7.2 Service Flow

Same as lunch service, with these additions:

* Occasion triggers (birthday cake, complimentary dessert)
* Wine and cocktail pairing suggestions
* Longer table dwell time — table management requires more finesse
* Late arrivals against reservations — hold or release tables at defined threshold

**Software Touchpoints:**

* Occasion flags on reservation
* Complimentary item authorization
* Late reservation handling (hold table for X minutes)

---

# 8. Closing Procedures

**Time:** After last table served

### 8.1 FOH Closing

* Ensure all bills are settled — no open tables
* Clear and clean all tables
* Store condiments and reset setup
* Turn off AC, music, decorative lights
* Conduct final floor check

**Software Touchpoints:**

* Verify zero open tables in system
* Final floor status check

---

### 8.2 Kitchen Closing

* Store all remaining prepped items with labels
* Clean all kitchen surfaces, equipment, and floors
* Drain all fryers if due
* Complete wastage recording for the day
* Handover to next shift chef (if 24-hour operation) or lock down

**Software Touchpoints:**

* End-of-day wastage entry
* Remaining prep stock label generation (optional)

---

### 8.3 Bar Closing

* Count remaining liquor bottles
* Record bar consumption for the day
* Reconcile bar sales vs. stock consumed
* Secure all alcohol in locked storage

**Software Touchpoints:**

* Bar stock reconciliation
* Bar closing report

---

### 8.4 Cashier Closing

This is a critical step — all discrepancies must be resolved here.

**Activities:**

* Close all open payment mode settlements
* Count physical cash in drawer
* Run Z-report (end-of-day sales report) from POS
* Reconcile cash total against POS total
* Prepare cash deposit bag for manager
* Record any discrepancies with reason
* Close cashier shift in system

**Software Touchpoints:**

* Z-report (final EOD billing report)
* Cash count entry
* Cash vs. system reconciliation
* Discrepancy recording
* Cashier shift close

**Z-Report includes:**

* Total sales (by payment mode)
* Number of bills generated
* Average order value
* Total discounts
* Total taxes collected
* Voids and refunds
* Cash total

---

# 9. End of Day Reporting

### 9.1 Manager's End of Day Report

After closing, the manager reviews and compiles the daily report.

**Contents:**

* Revenue summary
* Cover count (number of guests served)
* Average per cover
* Top-selling dishes
* Inventory consumed vs. theoretical (variance)
* Cash reconciliation status
* Staff attendance
* Customer complaints

**Delivery:**

* Printed report filed
* WhatsApp summary sent to owner
* System-generated email report to owner

**Software Touchpoints:**

* Automated daily report generation
* WhatsApp integration for delivery to owner
* Email dispatch

---

### 9.2 Owner's Mobile Summary (Automatic)

Delivered automatically to owner's phone every night:

```
[Atlas Daily Report — Restaurant Name]

Date: 25 June 2026

Revenue: ₹54,200
Covers: 87
Avg Per Cover: ₹623

Top Dish: Butter Chicken (43 orders)
Top Category: Mains (68%)

Cash Variance: ₹0
Discounts Given: ₹1,800 (3.3%)
Voids: 2 (₹340)

Inventory Alerts: Chicken low (3 kg remaining)

⭐ Today's Rating: 4.3 / 5 (12 reviews)
```

---

# 10. Special Operations

### 10.1 Event Service

When a restaurant hosts a private event (birthday, corporate dinner):

* Event-specific menu may be pre-agreed
* Minimum billing guarantee
* Advance payment collected
* Dedicated staff assigned
* Event invoice separate from regular service

**Software Touchpoints:**

* Event booking module
* Pre-payment recording
* Event-specific menu
* Event invoice generation

---

### 10.2 Takeaway Operations

For restaurants handling self-pickup orders:

* Customer orders via phone, app, or walk-in
* Billing done at counter
* Packaging completed
* Order number called when ready

**Software Touchpoints:**

* Takeaway order billing
* Token/order number generation
* Packaging checklist (optional)

---

### 10.3 Delivery Operations

For restaurants with delivery:

* Order received from aggregator (Zomato, Swiggy) or own platform
* Auto-acknowledged or manually accepted
* KOT sent to kitchen with delivery label
* Food packed and handed to rider
* Delivery status tracked

**Software Touchpoints:**

* Aggregator integration
* Delivery KOT with packaging instructions
* Rider assignment
* Delivery tracking

---

# 11. Shift Reports Overview

| Report                 | Frequency   | Who Receives            | Generated By   |
| ---------------------- | ----------- | ----------------------- | -------------- |
| Cashier Shift Report   | Per shift   | Cashier + Manager       | POS            |
| Kitchen Shift Report   | Per shift   | Head Chef + Manager     | KDS + POS      |
| Daily Sales Report     | Daily       | Manager + Owner         | POS            |
| Inventory Daily Report | Daily       | Inventory Mgr + Manager | Inventory      |
| Bar Closing Report     | Daily       | Bartender + Manager     | POS            |
| Manager Summary        | Daily       | Owner                   | Atlas + Manual |
| Weekly Summary         | Weekly      | Owner                   | Atlas          |
| Monthly P&L            | Monthly     | Owner + Accountant      | Atlas + Finance|

---

# 12. Key Takeaways

* A restaurant operates in clearly defined time blocks — software must respect this rhythm.
* The EOD cash reconciliation is the most critical daily process for financial control.
* The KOT flow (order → kitchen → serve) is the operational backbone of every service.
* Atlas must generate the owner's nightly summary automatically — this single feature alone builds trust with owners.
* Software must support the split-shift reality: lunch prep, lunch service, afternoon break, dinner service, close.
* Every closing task has a corresponding software action — nothing should be left to paper.

---

# Related Documents

* DOM-105 — Restaurant Departments
* DOM-106 — Restaurant Roles and Responsibilities
* DOM-108 — Restaurant Workflows
* DOM-109 — Restaurant Financial Fundamentals

---

# Next Document

DOM-108 — Restaurant Workflows

---

# Revision History

| Version | Date       | Author         | Description              |
| ------- | ---------- | -------------- | ------------------------ |
| 1.0.0   | 2026-06-25 | Vraj Prajapati | Initial document created |

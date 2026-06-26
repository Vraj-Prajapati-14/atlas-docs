# DOM-108 — Restaurant Workflows

| Field          | Value                   |
| -------------- | ----------------------- |
| Document ID    | DOM-108                 |
| Title          | Restaurant Workflows    |
| Version        | 1.0.0                   |
| Status         | Draft                   |
| Category       | Domain Research         |
| Owner          | Product Team            |
| Repository     | atlas-docs              |
| Classification | Internal                |
| Last Updated   | 2026-06-25              |

---

# 1. Purpose

This document maps every major workflow in a restaurant operation.

A workflow defines the exact sequence of steps, the actors involved, the documents produced, and the software touchpoints at each step.

Workflows are the direct inputs to user stories, functional requirements, API design, and database modeling.

If Atlas does not support a workflow completely, the software will be abandoned at the exact step it fails.

---

# 2. Workflow Catalog

| #  | Workflow                        | Department          | Frequency        |
| -- | ------------------------------- | ------------------- | ---------------- |
| 1  | Customer Walk-In                | FOH                 | Per customer     |
| 2  | Table Reservation               | FOH                 | Per booking      |
| 3  | Order Taking                    | FOH + Kitchen       | Per order        |
| 4  | KOT Lifecycle                   | FOH + Kitchen       | Per KOT          |
| 5  | Bill Generation and Payment     | FOH + Finance       | Per bill         |
| 6  | Delivery Order                  | Delivery + Kitchen  | Per order        |
| 7  | Vendor Purchase Order           | Procurement         | Per PO           |
| 8  | Goods Receipt Note (GRN)        | Inventory           | Per delivery     |
| 9  | Stock Issue to Kitchen          | Inventory + Kitchen | Daily            |
| 10 | Wastage Recording               | Kitchen + Inventory | Daily            |
| 11 | Stock Audit / Physical Count    | Inventory           | Weekly/Monthly   |
| 12 | Cashier Shift Close             | Finance             | Per shift        |
| 13 | Refund Workflow                 | Finance + FOH       | Per refund       |
| 14 | Void Bill Workflow              | Finance + Manager   | Per void         |
| 15 | Discount Authorization          | FOH + Manager       | Per discount     |
| 16 | Customer Complaint Workflow     | FOH + Management    | Per complaint    |
| 17 | Staff Attendance                | HR                  | Daily            |
| 18 | End of Day Report               | Management          | Daily            |
| 19 | Loyalty Point Accrual           | Finance + Marketing | Per transaction  |
| 20 | Loyalty Point Redemption        | Finance + Marketing | Per redemption   |

---

# 3. Detailed Workflow Descriptions

## Workflow 1 — Customer Walk-In

**Actors:** Customer, Host, Waiter, Captain

**Trigger:** Customer arrives at the restaurant entrance

```
Customer Arrives
       ↓
Host Greets Customer
       ↓
Host Checks Walk-In Availability
       ↓
       ├── Table Available?
       │         ↓ YES
       │   Host Selects Table on Floor Plan
       │         ↓
       │   Table Status → "Occupied"
       │         ↓
       │   Captain Assigned to Table
       │         ↓
       │   Captain Greets and Hands Menu
       │
       └── No Table Available?
                 ↓
           Add Customer to Waitlist
                 ↓
           Estimate Wait Time
                 ↓
           Notify Customer When Table Ready
                 ↓
           Seat Customer
```

**Documents Produced:** Table occupancy record, waitlist entry

**Software Touchpoints:**
* Floor plan view with real-time table status
* Waitlist entry with customer name and party size
* Table assignment
* Estimated wait time notification (SMS/display)
* Captain assignment to table

**Key Rules:**
* Table size must accommodate party size
* Reserved tables cannot be assigned to walk-ins
* Waitlist time estimate must be realistic
* VIP guests skip standard waitlist

---

## Workflow 2 — Table Reservation

**Actors:** Customer, Host/Reservations Staff

**Trigger:** Customer calls, visits website, or uses app to book a table

```
Customer Requests Reservation
       ↓
Channel: Phone / Web / App / Walk-in
       ↓
Check Availability on Date + Time
       ↓
       ├── Available?
       │         ↓ YES
       │   Collect Customer Details
       │   (Name, Phone, Party Size, Occasion)
       │         ↓
       │   Confirm Reservation
       │         ↓
       │   Send Confirmation (SMS / WhatsApp / Email)
       │         ↓
       │   Hold Table for Reservation
       │
       └── Not Available?
                 ↓
           Suggest Alternative Time / Date
                 ↓
           Add to Waitlist (if customer agrees)
```

**On Day of Reservation:**

```
Day of Reservation
       ↓
Send Reminder to Customer (morning)
       ↓
Customer Arrives
       ↓
Host Confirms Reservation
       ↓
Table Marked "Reserved" → Changes to "Occupied"
```

**No-Show Handling:**

```
Customer Does Not Arrive Within X Minutes
       ↓
Manager Decides: Wait Longer or Release Table
       ↓
No-Show Marked in System
       ↓
Deposit Forfeited (if applicable)
```

**Documents Produced:** Reservation record, confirmation message, no-show record

**Software Touchpoints:**
* Reservation calendar with capacity management
* Availability check by date/time/party size
* Customer profile linkage (returning guest lookup)
* Automated confirmation via WhatsApp/SMS
* Day-of reminder notification
* No-show recording with deposit handling

---

## Workflow 3 — Order Taking

**Actors:** Waiter, Customer, Kitchen Staff

**Trigger:** Customers are seated and ready to order

```
Waiter Approaches Table
       ↓
Present Menu (Physical / QR Code / Tablet)
       ↓
Customer Browses Menu
       ↓
Customer Places Order
       ↓
Waiter Enters Order into POS / Handheld Device
       ↓
For Each Item:
  ├── Add Modifiers (spice level, no onion, extra cheese)
  ├── Add Cooking Instructions
  └── Verify Quantity
       ↓
Review Order with Customer
       ↓
Customer Confirms
       ↓
Waiter Submits Order
       ↓
KOT Generated and Routed:
  ├── Food Items → Kitchen KDS
  └── Beverages → Bar KDS
       ↓
Kitchen/Bar Acknowledges KOT
```

**Amendment Flow:**

```
Customer Changes Mind After Submission
       ↓
Waiter Raises Amendment KOT
       ↓
If Kitchen Has Already Started Preparation:
  └── Manager Authorization Required for Cancellation
       ↓
Amendment Applied with Reason Code
```

**Software Touchpoints:**
* POS order entry with item search
* Modifier and special instruction capture
* KOT routing rules (food vs. beverage)
* KOT acknowledgment by kitchen
* Amendment and cancellation flow
* Item availability check (86 list — out of stock items)

---

## Workflow 4 — KOT Lifecycle

**Actors:** Waiter, Kitchen Staff, Runner

**Trigger:** KOT is submitted from POS

```
KOT Submitted from POS
       ↓
KOT Appears on KDS (Kitchen Display System)
       ↓
Kitchen Staff Views Ticket
       ↓
Chef Acknowledges Ticket
       ↓
Cooking Starts
       ↓
KOT Timer Starts
       ↓
[If timer exceeds threshold → KOT turns red → Alert]
       ↓
All Items on KOT Are Ready
       ↓
Chef Marks KOT as "Ready"
       ↓
Runner is Notified / Bell at Pass
       ↓
Runner Picks Up Food
       ↓
Runner Delivers to Table
       ↓
Waiter Confirms Delivery
       ↓
KOT Marked as "Served"
```

**Parallel KOT Handling:**

When multiple KOTs arrive simultaneously:

* KDS displays all open tickets sorted by submission time
* Color coding: Green (new), Yellow (attention), Red (overdue)
* Chef can reprioritize tickets manually

**Documents Produced:** KOT record, kitchen performance log

**Software Touchpoints:**
* KDS display with ticket management
* Timer per ticket with color alerts
* Ready notification to runner
* Served confirmation
* Kitchen performance tracking (avg prep time per item)

---

## Workflow 5 — Bill Generation and Payment

**Actors:** Waiter, Cashier, Customer

**Trigger:** Customer requests the bill

```
Customer Requests Bill
       ↓
Waiter Calls Bill from POS
       ↓
System Consolidates All KOTs for Table
       ↓
Bill Draft Generated
       ↓
Cashier Reviews Bill (all items, quantities)
       ↓
Apply Applicable Taxes:
  ├── GST (item-wise rate application)
  ├── Service Charge (if applicable)
  └── Packaging Charge (for takeaway)
       ↓
Apply Discount (if any):
  ├── Coupon Code → Validate and Apply
  ├── Manager Discount → Authorization Required
  └── Happy Hour → Auto-Applied by System
       ↓
Apply Loyalty Redemption (if customer requests)
       ↓
Final Bill Amount Calculated
       ↓
Bill Presented to Customer (Screen / Print)
       ↓
Customer Confirms and Selects Payment Mode
       ↓
       ├── Cash → Enter Amount → Calculate Change → Bill Closed
       ├── Card → Swipe/Tap → Bank Approval → Bill Closed
       ├── UPI → Generate QR → Customer Scans → Bank Confirmation → Bill Closed
       ├── Split Bill → Process Each Share Separately
       └── Mixed → Partial Cash + Partial UPI → Both Recorded
       ↓
Receipt Generated:
  ├── Print Receipt (thermal printer)
  └── Digital Receipt → WhatsApp / Email
       ↓
Table Status → "Cleaning"
       ↓
Loyalty Points Updated
       ↓
CRM Record Updated
```

**Documents Produced:** Tax Invoice, payment receipt, GST invoice

**Software Touchpoints:**
* Bill consolidation from KOTs
* Tax calculation engine (GST by HSN code)
* Discount and coupon validation
* Multi-mode payment processing
* Receipt generation (print + digital)
* Loyalty point accrual
* CRM update
* Table status change

---

## Workflow 6 — Delivery Order

**Actors:** Aggregator Platform, Kitchen, Packaging Staff, Rider

**Trigger:** Order received from Zomato/Swiggy/own platform

```
Order Received (Aggregator / Own Platform)
       ↓
Order Displayed on Aggregator Tablet / Atlas Dashboard
       ↓
       ├── Auto-Accept (if configured)
       └── Manual Accept (staff accepts within timeout)
       ↓
KOT Printed / Displayed on Kitchen KDS
       (with delivery label — platform, order ID, address)
       ↓
Kitchen Prepares Food
       ↓
Food Ready at Pass
       ↓
Packaging Staff Receives Food
       ↓
Packaging Checklist Verified:
  ├── All items included?
  ├── Correct packaging size?
  └── Spillage-proof packaging?
       ↓
Delivery Label Printed and Applied
       ↓
       ├── Own Rider → Assigned in Atlas, GPS Tracking
       └── Aggregator Rider → Awaits rider pickup
       ↓
Rider Picks Up Order
       ↓
Order Status → "Out for Delivery"
       ↓
Order Delivered to Customer
       ↓
Delivery Confirmed → Bill Closed
       ↓
Aggregator Settlement Recorded
```

**Documents Produced:** Delivery KOT, packaging checklist, delivery receipt, aggregator settlement record

**Software Touchpoints:**
* Aggregator order intake (webhook/polling)
* Auto-accept configuration
* Delivery KOT with label
* Packaging checklist
* Rider assignment and GPS tracking (own fleet)
* Delivery status tracking
* Aggregator settlement reconciliation

---

## Workflow 7 — Vendor Purchase Order

**Actors:** Purchase Manager, Manager, Vendor

**Trigger:** Reorder point reached or manual purchase request raised

```
Low Stock Alert Generated
(or manual purchase request from Inventory/Kitchen)
       ↓
Purchase Manager Reviews Requirement
       ↓
Check Approved Vendor List
       ↓
       ├── Existing Vendor with Rate Card → Proceed to PO
       └── New / Rate Negotiation → Obtain Quotation → Compare → Select
       ↓
Create Purchase Order in Atlas
  (Vendor, Items, Quantity, Rate, Delivery Date)
       ↓
PO Sent for Approval (if above threshold)
       ↓
Approver Reviews and Approves / Rejects
       ↓
       ├── Approved → PO Sent to Vendor (WhatsApp / Email / Print)
       └── Rejected → Purchase Manager Revises
       ↓
Vendor Confirms Order
       ↓
Expected Delivery Date Recorded
       ↓
       ├── Vendor Delivers on Time → GRN Workflow Begins
       └── Vendor Delays → Alert Generated → Follow-Up Triggered
```

**Documents Produced:** Purchase Order, vendor confirmation

**Software Touchpoints:**
* Low-stock alert to trigger purchase
* Vendor master lookup
* PO creation with line items
* Approval workflow
* PO sharing (WhatsApp/email)
* Expected delivery tracking

---

## Workflow 8 — Goods Receipt Note (GRN)

**Actors:** Inventory Manager / Store Keeper, Vendor Driver

**Trigger:** Vendor delivery arrives at restaurant

```
Vendor Arrives with Delivery
       ↓
Store Keeper Checks Expected PO in Atlas
       ↓
Physical Items Received
       ↓
For Each Item:
  ├── Verify: Item Name Matches PO
  ├── Verify: Quantity Received vs. PO Quantity
  ├── Check: Quality, Freshness, Packaging Condition
  ├── Weigh: Weight-Based Items on Scale
  └── Check: Expiry Date (for perishables)
       ↓
       ├── Accepted → Enter Received Qty in Atlas
       └── Rejected / Short → Record Discrepancy + Return Note
       ↓
GRN Confirmed in Atlas
       ↓
Inventory Levels Updated Automatically
       ↓
Vendor Invoice Matched Against GRN (Three-Way Match)
       ↓
Invoice Approved for Payment
       ↓
Vendor Payment Scheduled
```

**Documents Produced:** GRN, delivery discrepancy note, vendor invoice record

**Software Touchpoints:**
* PO lookup at time of receipt
* GRN creation with quantity input
* Quality check flag per line
* Expiry date recording
* Automatic inventory update
* Three-way match (PO + GRN + Invoice)
* Payment scheduling

---

## Workflow 9 — Stock Issue to Kitchen

**Actors:** Waiter or Sous Chef (requester), Inventory Manager (issuer)

**Trigger:** Kitchen requires ingredients for prep or service

```
Kitchen Identifies Requirement
       ↓
Sous Chef / Line Chef Creates Indent (Stock Issue Request)
       ↓
Indent Submitted to Inventory Manager via Atlas
       ↓
Inventory Manager Checks Physical Availability
       ↓
       ├── Available → Issue Confirmed
       └── Partial / Not Available → Alert Kitchen, Raise Urgent PO
       ↓
Physical Stock Moved to Kitchen
       ↓
Inventory Records Updated (Stock Reduced)
       ↓
Indent Marked as Fulfilled
```

**Documents Produced:** Stock issue indent, kitchen receipt

**Software Touchpoints:**
* Indent creation by kitchen staff
* Inventory availability check
* Issue confirmation
* Automatic inventory deduction
* Low-stock alert if issue would breach minimum level

---

## Workflow 10 — Wastage Recording

**Actors:** Kitchen Staff, Head Chef

**Trigger:** Any food item is discarded or spoiled

```
Food Item Discarded / Spoiled / Expired
       ↓
Kitchen Staff Records Wastage in Atlas
  (Item, Quantity, Reason Code, Time)
       ↓
Wastage Reason Codes:
  ├── Spoilage (natural expiry)
  ├── Cooking Error (over-cooked, wrong preparation)
  ├── Customer Return (sent back, not eaten)
  ├── Preparation Waste (trimmings, peels)
  └── Quality Rejection (failed QC check)
       ↓
Head Chef Reviews Daily Wastage Log
       ↓
Inventory Levels Reduced Accordingly
       ↓
Wastage Cost Calculated:
  (Quantity × Recipe Cost per Unit)
       ↓
Wastage Report Generated (Daily / Weekly)
       ↓
Owner / Manager Reviews Wastage Report
```

**Documents Produced:** Wastage log, wastage cost report

**Software Touchpoints:**
* Wastage entry form with reason codes
* Automatic inventory deduction
* Cost calculation per item
* Daily wastage report
* Trend analysis (which items waste most)

---

## Workflow 11 — Physical Stock Audit

**Actors:** Inventory Manager, GM or Owner (witness)

**Trigger:** Scheduled (weekly/monthly) or triggered by discrepancy suspicion

```
Audit Scheduled in Atlas
       ↓
All Stock Movements Frozen for Audit Period
(or blind count performed before review)
       ↓
Physical Count Conducted:
  ├── Count each item physically
  ├── Record in Atlas (or physical count sheet)
  └── Items counted twice if discrepancy
       ↓
Atlas Calculates Theoretical Stock:
  Opening Stock + Received (GRN) - Issued - Sold - Wasted
       ↓
Variance Report Generated:
  Physical Count vs. Theoretical Stock
       ↓
Variance Analysis:
  ├── Acceptable Variance (within tolerance) → Close Audit
  └── Unacceptable Variance → Investigate
       ↓
Investigation:
  ├── Data entry error → Correct entry
  ├── Unrecorded consumption → Record and adjust
  └── Theft / Fraud suspected → Escalate to Owner
       ↓
Audit Record Saved with Sign-Off
       ↓
Inventory Adjusted to Physical Count
```

**Documents Produced:** Physical count sheet, variance report, audit sign-off

**Software Touchpoints:**
* Audit scheduling
* Theoretical stock calculation
* Physical count entry
* Variance report generation
* Adjustment entry with authorization

---

## Workflow 12 — Cashier Shift Close

**Actors:** Cashier, Manager

**Trigger:** End of cashier's shift

```
Last Bill of Shift Processed
       ↓
Cashier Runs Z-Report from POS
  (Summary: Sales, Payments, Discounts, Voids, Taxes)
       ↓
Cashier Counts Physical Cash in Drawer
       ↓
Cash Entered into Atlas
       ↓
System Compares:
  Cash in Drawer vs. Cash Expected (from POS)
       ↓
       ├── Match → Shift Closed ✓
       └── Discrepancy → 
             Cashier Recounts
                  ↓
             If Still Discrepancy:
               Manager Called
               Discrepancy Reason Recorded
               Short Cash Documented (HR action if recurring)
       ↓
Manager Signs Off Shift Report
       ↓
Cash Deposited in Safe / Bank
       ↓
Cashier Shift Closed in Atlas
```

**Documents Produced:** Z-report, cash reconciliation report, shift close record

---

## Workflow 13 — Refund Workflow

**Actors:** Customer, Cashier, Manager

**Trigger:** Customer requests refund for overcharge or service issue

```
Customer Raises Refund Request
       ↓
Cashier Reviews Original Bill
       ↓
Validates Refund Reason:
  ├── Overcharge (item not ordered, wrong price)
  ├── Duplicate payment
  ├── Order not delivered / cancellation
  └── Quality complaint (customer unsatisfied)
       ↓
Refund Above Threshold → Manager Authorization Required
       ↓
Manager Reviews and Approves / Rejects
       ↓
       ├── Approved:
       │     ├── Cash Refund (if paid by cash)
       │     ├── Card Reversal (if paid by card — 3–7 business days)
       │     └── Wallet Credit / Loyalty Points
       │
       └── Rejected:
             Reason Given to Customer
             Manager Offers Alternative Resolution
       ↓
Refund Recorded in Atlas with:
  ├── Original Bill Reference
  ├── Refund Amount
  ├── Refund Mode
  ├── Reason Code
  └── Authorizing Manager
       ↓
Customer Acknowledgment Obtained
```

**Documents Produced:** Refund record, updated billing report

**Software Touchpoints:**
* Refund creation linked to original bill
* Authorization workflow
* Payment reversal integration (card)
* Refund report for accounting

---

## Workflow 14 — Bill Void

**Actors:** Cashier, Manager

**Trigger:** Bill must be cancelled entirely (before or after payment)

```
Cashier or Manager Initiates Void
       ↓
Select Bill to Void
       ↓
Enter Void Reason (mandatory):
  ├── Test bill
  ├── Wrong items billed
  ├── Customer left without paying (dine-and-dash)
  ├── POS error
  └── Other (with note)
       ↓
Void Requires Manager Authorization
       ↓
Manager Authenticates and Confirms
       ↓
Bill Status → "Void"
       ↓
Void Recorded with:
  ├── Cashier who created bill
  ├── Manager who authorized void
  ├── Timestamp
  └── Reason
       ↓
Sales Report Updated (void excluded from revenue)
       ↓
Inventory: Items NOT returned (food already prepared)
```

**Key Rule:** All voids must be traceable. High void rate per cashier is a red flag for potential fraud.

---

## Workflow 15 — Discount Authorization

**Actors:** Waiter, Cashier, Manager, Owner

**Trigger:** Customer requests a discount or promotion is applied

```
Discount Request Identified:
  ├── Customer presents coupon / code
  ├── Manager-authorized special discount
  ├── Loyalty redemption
  └── Happy hour / promotional price
       ↓
System Validates Discount:
  ├── Coupon Code → Check validity, expiry, usage limit
  ├── Manager Discount → Check role has authority
  ├── Happy Hour → Check current time matches schedule
  └── Loyalty Redemption → Check points balance
       ↓
       ├── Valid → Discount Applied
       └── Invalid → Reason Shown to Cashier
       ↓
Discounts Above Threshold → Manager Must Authenticate
       ↓
Discount Applied to Bill with:
  ├── Discount Type
  ├── Discount Amount / Percentage
  ├── Authorized By
  └── Original Bill Reference
       ↓
Discount Report Updated
```

**Software Touchpoints:**
* Coupon validation engine
* Time-based happy hour rules
* Role-based discount limit configuration
* Discount report with trend tracking

---

## Workflow 16 — Customer Complaint Workflow

**Actors:** Customer, Waiter, Manager, Head Chef (if food-related)

**Trigger:** Customer expresses dissatisfaction

```
Customer Raises Complaint
       ↓
Waiter Listens and Acknowledges Immediately
       ↓
Complaint Categorized:
  ├── Food Quality (wrong item, cold, undercooked)
  ├── Service Quality (slow, rude, incorrect)
  ├── Billing Error (overcharge, wrong discount)
  ├── Hygiene (foreign object, cleanliness)
  └── Ambiance (noise, temperature, cleanliness)
       ↓
Waiter Attempts First Resolution:
  ├── Wrong item → Replace immediately (KOT priority)
  ├── Service delay → Apologize + expedite
  └── Other → Escalate to manager immediately
       ↓
Manager Addresses Customer
       ↓
Resolution Offered:
  ├── Replacement dish
  ├── Complimentary item
  ├── Discount on bill
  ├── Full/partial refund
  └── Written apology + follow-up
       ↓
Customer Accepts Resolution
       ↓
Complaint Logged in Atlas:
  ├── Table / Customer
  ├── Complaint Description
  ├── Category
  ├── Resolution Taken
  ├── Compensation Given (cost)
  └── Staff Involved
       ↓
Head Chef Briefed (if food-related)
       ↓
Root Cause Analysis (if recurring pattern)
```

**Software Touchpoints:**
* Complaint logging form
* Complaint category tracking
* Compensation cost recording
* Recurring complaint trend report

---

## Workflow 17 — Staff Attendance

**Actors:** All Staff, HR Manager

**Trigger:** Beginning and end of each shift

```
Staff Arrives for Shift
       ↓
Clock In:
  ├── Biometric (fingerprint / face)
  ├── Mobile OTP (for small operations)
  └── Manager manual entry (fallback)
       ↓
Attendance Recorded in Atlas:
  ├── Staff Name
  ├── Date
  ├── Clock-In Time
  └── Shift Assigned
       ↓
During Shift:
  └── Break time may be recorded (optional)
       ↓
Staff Ends Shift
       ↓
Clock Out:
  Same method as clock in
       ↓
Attendance Updated:
  ├── Total Hours Worked
  ├── Overtime Calculated (if applicable)
  └── Late Arrival Flag (if applicable)
       ↓
Monthly Attendance Consolidated for Payroll
```

**Documents Produced:** Daily attendance record, monthly attendance report, payroll input

---

## Workflow 18 — End of Day Reporting

**Actors:** Manager, Cashier, Head Chef

**Trigger:** Restaurant closes for the day

```
All Services Closed (Last Bill, Last Delivery)
       ↓
Cashier Closes Shift (Workflow 12)
       ↓
Kitchen Closes (Wastage Recorded)
       ↓
Atlas Generates Automatic EOD Report:
       ↓
Daily Summary Includes:
  ├── Total Revenue
  ├── Revenue by Category (Food, Beverage, Delivery)
  ├── Revenue by Channel (Dine-in, Takeaway, Zomato, Swiggy)
  ├── Cover Count and Avg per Cover
  ├── Top 10 Selling Items
  ├── Total Discounts Given
  ├── Total Voids
  ├── Cash Reconciliation Status
  ├── Inventory Variance Summary
  ├── Customer Complaints
  └── Staff Attendance Summary
       ↓
Report Delivered:
  ├── WhatsApp to Owner (auto-sent at closing time)
  ├── Email to Owner and Manager
  └── Saved in Atlas for future reference
```

---

## Workflow 19 — Loyalty Point Accrual

**Actors:** Cashier, Customer, Atlas System

**Trigger:** Customer completes a qualifying transaction

```
Bill Closed and Payment Confirmed
       ↓
System Checks: Is Customer a Loyalty Member?
       ↓
       ├── Not a Member → Invite to Join at Counter
       └── Member → Calculate Points:
             Points = Bill Amount × Points Rate
             (e.g., ₹10 = 1 point)
       ↓
Points Credited to Customer Account
       ↓
SMS / WhatsApp Sent to Customer:
  "You earned 54 points. Total: 342 points."
       ↓
Customer Loyalty Record Updated
```

---

## Workflow 20 — Loyalty Point Redemption

**Actors:** Cashier, Customer

**Trigger:** Customer requests to redeem loyalty points at billing

```
Customer Requests Redemption
       ↓
Cashier Looks Up Customer by Phone Number
       ↓
Atlas Shows Points Balance
       ↓
Customer Chooses How Many Points to Redeem
       ↓
System Validates:
  ├── Minimum redemption threshold met?
  ├── Redemption does not exceed bill value?
  └── Redemption within allowed limits?
       ↓
Redemption Applied as Bill Discount
  (e.g., 100 points = ₹10 discount)
       ↓
Points Deducted from Customer Account
       ↓
Updated Bill Generated
       ↓
Balance Points Shown on Receipt
```

---

# 4. Workflow Interdependency Map

```
Reservation ──────────────────→ Walk-In (table occupied)
Order Taking ─────────────────→ KOT Lifecycle
KOT Lifecycle ───────────────→ Bill Generation
Bill Generation ─────────────→ Loyalty Accrual
Bill Generation ─────────────→ CRM Update
Bill Generation ─────────────→ Inventory Deduction (via recipe)
Vendor PO ───────────────────→ GRN
GRN ─────────────────────────→ Inventory Update
Inventory Update ────────────→ Low Stock Alert → New PO
Stock Issue ─────────────────→ Kitchen Production
Kitchen Production ──────────→ Wastage Recording
Cashier Close ───────────────→ EOD Report
EOD Report ─────────────────→ Owner WhatsApp Summary
```

---

# 5. Key Takeaways

* Every workflow has at least one point where the current software either fails or is absent in competitive products.
* The KOT lifecycle and billing workflow are the core revenue-generating workflows — they must be flawless.
* The wastage and GRN workflows are where most restaurants lose money without realizing it.
* Loyalty accrual must be automatic — manual loyalty is never used consistently.
* Every workflow must have an exception path — what happens when something goes wrong.
* Atlas must generate the EOD report automatically — no restaurant owner should need to ask for it.

---

# Related Documents

* DOM-105 — Restaurant Departments
* DOM-106 — Restaurant Roles and Responsibilities
* DOM-107 — Restaurant Daily Operations
* DOM-109 — Restaurant Financial Fundamentals

---

# Next Document

DOM-109 — Restaurant Financial Fundamentals

---

# Revision History

| Version | Date       | Author         | Description              |
| ------- | ---------- | -------------- | ------------------------ |
| 1.0.0   | 2026-06-25 | Vraj Prajapati | Initial document created |

# UX-001 — User Experience Design

| Field          | Value                               |
| -------------- | ----------------------------------- |
| Document ID    | UX-001                              |
| Title          | RestaurantOS — UX Design            |
| Version        | 1.0.0                               |
| Status         | Draft                               |
| Category       | UX Design                           |
| Author         | Vraj Prajapati                      |
| Classification | Confidential — Internal Use Only    |
| Last Updated   | 2026-06-25                          |

---

# 1. UX Design Philosophy

RestaurantOS is used in one of the most stressful work environments on earth — a busy restaurant during service.

The UX must be designed for:

- **Stress and noise** — User is surrounded by shouting, rushing, and pressure
- **One hand** — Waiter is carrying plates or menu with the other hand
- **Partial attention** — Cashier is talking to a customer while operating the POS
- **Urgency** — A kitchen ticket that takes 3 extra taps costs a table 5 minutes
- **Mixed literacy** — Staff education levels vary significantly

**UX Design Rules:**

1. Every primary action requires maximum 3 taps from any screen
2. Critical alerts (stockout, bill void, KOT overdue) must be impossible to miss
3. Undo must always be available for destructive actions
4. Error messages must tell the user what to DO, not what went wrong
5. Numbers must be large enough to read at a distance (tables, totals)
6. Color alone cannot convey critical information (accessibility)

---

# 2. User Personas

## Persona 1: The Owner — "Priya Mehta"

**Profile**
- Age: 38
- Role: Owner of 3 casual dining restaurants
- Tech comfort: Medium (uses WhatsApp, Zomato daily)
- Device: iPhone 14, MacBook Pro

**Goals**
- Know how much money she made today without calling anyone
- Catch staff fraud before it becomes a pattern
- Make faster purchasing decisions

**Frustrations**
- Gets different numbers from manager, cashier, and accountant
- Discovers inventory theft only during monthly audit (too late)
- Cannot compare branch performance side-by-side

**Key Jobs To Be Done**
- See today's revenue in under 10 seconds from anywhere
- Get alerted immediately if something unusual happens
- Compare this month vs. last month without downloading Excel

**UX Implications**
- Mobile dashboard is primary screen (not desktop)
- Push notifications for anomalies, not routine data
- Drill-down from summary to detail in 2 taps

---

## Persona 2: The Cashier — "Ravi Kumar"

**Profile**
- Age: 24
- Role: Cashier at a busy QSR
- Tech comfort: Low-medium (uses phone for YouTube and UPI)
- Device: Outlet's Android tablet

**Goals**
- Process bills without making mistakes
- Handle rush hour without slowing down the queue
- Not get blamed for cash discrepancies

**Frustrations**
- Card machine disconnects during rush
- Customer wants to split bill 4 ways — current system can't do it
- Manager has to come every time there's a coupon

**Key Jobs To Be Done**
- Bill a ₹800 order in under 45 seconds
- Accept mixed cash + UPI payment without error
- Apply a valid coupon without calling manager

**UX Implications**
- Billing screen is single-screen, no navigation required
- Large touch targets for amount keys
- Inline coupon validation with clear feedback
- Offline mode indicator always visible

---

## Persona 3: The Floor Manager — "Ankit Shah"

**Profile**
- Age: 31
- Role: Floor Manager, 120-seat casual dining
- Tech comfort: Medium
- Device: Android tablet (floor device)

**Goals**
- See which tables need attention without walking the floor
- Handle customer complaints quickly
- Know which waiter is underperforming

**Frustrations**
- Has to physically check each table to know its status
- No way to know which KOTs are overdue without going to kitchen
- Cannot approve discounts remotely — has to physically go to POS

**Key Jobs To Be Done**
- See full floor status in one view
- Approve a discount from their tablet without walking to cashier
- See which KOT has been waiting too long

**UX Implications**
- Floor view is the default screen on floor manager device
- Remote approval with biometric/PIN — no physical presence needed
- Red/amber/green visual system for KOT and table status

---

## Persona 4: The Head Chef — "Suresh Iyer"

**Profile**
- Age: 42
- Role: Head Chef, fine dining restaurant
- Tech comfort: Low (prefers paper)
- Device: 21-inch KDS mounted at pass

**Goals**
- Know which orders are coming before they arrive
- See what's running out before service gets stuck
- Track his team's prep and cooking times

**Frustrations**
- Paper KOTs get lost or wet in the kitchen
- Cannot see all orders at once — paper pile is chaos
- No data on which dishes are slowest to prepare

**Key Jobs To Be Done**
- See all active tickets in priority order
- Mark items ready with one touch while wearing gloves
- Check tomorrow's ingredient availability

**UX Implications**
- KDS is designed for gloved hands: large touch targets, high contrast
- Voice-activated status update (optional for hands-free kitchen)
- High contrast mode for bright kitchen lighting

---

## Persona 5: The Inventory Manager — "Fatima Khan"

**Profile**
- Age: 28
- Role: Store Manager at a 5-outlet chain
- Tech comfort: Medium
- Device: Android phone + desktop

**Goals**
- Know stock levels without physically counting every morning
- Receive vendor deliveries without paperwork errors
- Prevent kitchen from using stock without recording it

**Frustrations**
- Kitchen uses ingredients without raising an indent
- Received 10 kg instead of 20 kg but PO shows 20 kg — dispute is manual
- Expiry dates tracked on paper — items expire before she notices

**Key Jobs To Be Done**
- Create a GRN against a PO in under 2 minutes
- See which items are below par stock in one view
- Record wastage by scanning item barcode

**UX Implications**
- GRN screen shows PO quantities alongside for comparison
- Stock dashboard with traffic light status (red/amber/green)
- Barcode scan for wastage entry — no manual typing

---

## Persona 6: The Delivery Operations Manager — "Amit Patel"

**Profile**
- Age: 26
- Role: Delivery Ops, Cloud Kitchen with 3 brands
- Tech comfort: High
- Device: Multiple tablets + laptop

**Goals**
- See all orders from all platforms in one place
- Know which orders are late before the customer complains
- Understand which platform makes the most money

**Frustrations**
- Zomato tablet, Swiggy tablet, and own-platform tablet — 3 screens to watch
- Aggregator settlement doesn't match what he expected
- Can't easily change menu on all platforms simultaneously

**Key Jobs To Be Done**
- View and manage all delivery orders unified
- Push a menu change to all platforms in one click
- See this week's aggregator settlement vs. expected

**UX Implications**
- Unified delivery dashboard: all platforms, one screen
- One-click menu sync button with confirmation
- Settlement reconciliation with variance highlighted

---

## Persona 7: The Restaurant Customer — "Meera Nair"

**Profile**
- Age: 34
- Role: Frequent diner, loyalty member
- Tech comfort: High
- Device: iPhone

**Goals**
- Book a table quickly
- Know her loyalty balance without asking
- Get her receipt on WhatsApp, not paper

**Frustrations**
- Restaurant forgot her "no onion" preference from last visit
- Loyalty points expired without warning
- Has to wait 5 minutes for the bill after asking

**Key Jobs To Be Done**
- Book a table via WhatsApp in under 1 minute
- Have her preferences ready when she arrives
- Receive WhatsApp receipt with loyalty balance

**UX Implications**
- WhatsApp-native booking and receipt experience
- Customer profile loads automatically when phone number is entered
- Loyalty balance always visible at billing screen

---

## Persona 8: The Accountant — "Kiran Desai"

**Profile**
- Age: 45
- Role: Accountant, handles 8 restaurant clients
- Tech comfort: Medium (Excel power user)
- Device: Windows laptop

**Goals**
- Export clean data for GST filing without manual cleanup
- Reconcile all payments without calling the cashier
- Prepare P&L in under 30 minutes at month end

**Frustrations**
- POS data and bank statement never match
- GST report needs manual HSN code mapping
- Cannot access system remotely — has to be at restaurant

**Key Jobs To Be Done**
- Download GSTR-1 formatted export in one click
- See cash vs. digital payment breakdown for bank reconciliation
- View multi-branch consolidated P&L

**UX Implications**
- Finance module designed for desktop
- Export functions prominent and clearly labeled
- GST report auto-formatted to GSTN requirements

---

# 3. User Journey Maps

## Journey 1: Owner — Morning Revenue Check

**Goal:** Know how last night's dinner service performed before 9 AM

```
7:30 AM — Owner wakes up
       ↓
Opens WhatsApp
       ↓
Reads auto-generated Atlas summary (sent at midnight):
  Revenue: ₹54,200 | Covers: 87 | Avg: ₹623
  Top dish: Butter Chicken
  Alert: Cash variance ₹220 — needs attention
       ↓
Taps link → Opens Atlas mobile app
       ↓
Dashboard loads: Yesterday vs. same day last week
       ↓
Sees Branch 2 underperformed by 18%
       ↓
Taps Branch 2 → sees dinner service detail
       ↓
Spots: 3 bills voided — more than usual
       ↓
Opens void report → all 3 by same cashier
       ↓
Sends in-app note to GM: "Review Branch 2 cashier voids"
       ↓
Total time: 4 minutes. No calls made.
```

**Satisfaction Drivers:**
- WhatsApp delivery — no app open required for headline
- Anomaly surfaced automatically — owner doesn't hunt for problems
- Drill-down available when something looks off

---

## Journey 2: Cashier — Rush Hour Billing

**Goal:** Bill a table of 4 with a coupon and split payment in under 3 minutes

```
Table 12 calls for bill
       ↓
Waiter taps "Call Bill" on order screen
       ↓
Cashier sees bill alert on POS
       ↓
Opens Table 12 bill (all items pre-loaded from KOTs)
       ↓
Customer says they have a coupon code
       ↓
Cashier enters coupon → System validates → ₹200 off applied
       ↓
Customer wants to split: 2 people paying ₹600 each
       ↓
Cashier taps "Split Equal (2)" → bill split shown
       ↓
Person 1 pays ₹600 via UPI → QR generated → scanned → confirmed
       ↓
Person 2 pays ₹600 cash → cashier enters ₹700 → change ₹100 shown
       ↓
Bill closed
       ↓
WhatsApp receipt sent to table's primary customer
       ↓
Table status → "Cleaning"
       ↓
Total time: 2 minutes 20 seconds
```

---

## Journey 3: Chef — Handling a Rush

**Goal:** Manage 15 simultaneous KOTs during dinner rush

```
7:45 PM — Service begins
       ↓
KDS shows 3 active tickets (starters for Tables 4, 7, 9)
       ↓
Table 4 items ready → Chef bumps to "Ready"
       ↓
Bell alerts runner
       ↓
8:15 PM — Rush begins
KDS shows 12 tickets
       ↓
Chef sees KOT for Table 11 is red (22 minutes — overdue)
       ↓
Chef prioritizes Table 11 → moves to station manually
       ↓
Sous Chef handles remaining
       ↓
Floor Manager gets auto-alert about Table 11 delay
       ↓
Floor Manager proactively apologizes to Table 11 customers
       ↓
Table 11 items ready → bumped → runner delivers
       ↓
Chef's prep time for Table 11: captured in analytics
       ↓
Next week: same dish shows consistently slow → recipe reviewed
```

---

## Journey 4: Inventory Manager — Morning Stock Check

**Goal:** Know what to order before the kitchen starts prep

```
7:00 AM — Inventory Manager opens Atlas
       ↓
Dashboard shows 4 items below reorder point:
  🔴 Chicken Breast: 2 kg (min: 5 kg)
  🟠 Basmati Rice: 8 kg (min: 10 kg)
  🟠 Fresh Cream: 0.5 L (min: 2 L)
  🟡 Olive Oil: 1 L (min: 3 L)
       ↓
Taps "Create Purchase Orders" → system auto-generates POs:
  Vendor A (meat): Chicken 10 kg
  Vendor B (dairy): Fresh Cream 4 L, Basmati 20 kg
  Vendor C (grocery): Olive Oil 5 L
       ↓
Inventory Manager reviews and adjusts quantities
       ↓
Taps "Send POs" → WhatsApp sent to all 3 vendors
       ↓
Total time: 8 minutes
Vendors confirm delivery for same afternoon
```

---

# 4. Information Architecture

## 4.1 Navigation Structure (Web — Restaurant Staff)

```
RestaurantOS Web App
│
├── Dashboard (Home)
│   ├── Today's Summary
│   ├── Active Alerts
│   ├── Live Floor View (FOH roles)
│   └── Quick Actions
│
├── Operations
│   ├── Orders (active orders)
│   ├── Tables (floor view)
│   ├── Kitchen (KDS view)
│   └── Delivery (aggregator orders)
│
├── Billing
│   ├── Active Bills
│   ├── Billing History
│   ├── Cash Reconciliation
│   └── Shift Report
│
├── Inventory
│   ├── Current Stock
│   ├── Receive Stock (GRN)
│   ├── Issue Stock
│   ├── Wastage
│   └── Stock Audit
│
├── Procurement
│   ├── Purchase Orders
│   ├── Vendors
│   └── Pending Approvals
│
├── Customers
│   ├── Customer List
│   ├── Loyalty
│   └── Campaigns
│
├── Reports
│   ├── Sales Reports
│   ├── Inventory Reports
│   ├── Financial Reports
│   └── Custom Reports
│
├── HR
│   ├── Staff
│   ├── Attendance
│   └── Leave
│
└── Settings
    ├── Restaurant Profile
    ├── Menu
    ├── Users and Roles
    ├── Integrations
    └── Notifications
```

## 4.2 Navigation Structure (Mobile — Owner)

```
RestaurantOS Owner App
│
├── Dashboard (Primary screen)
│   ├── Revenue today
│   ├── Revenue trend (7 days)
│   ├── Active alerts
│   └── Branch comparison
│
├── Alerts
│   ├── All alerts
│   ├── Pending approvals
│   └── Action required
│
├── Reports
│   ├── Sales
│   ├── Inventory
│   ├── Finance
│   └── Staff
│
└── Settings
    └── Notification preferences
```

---

# 5. Screen Flow Specifications

## 5.1 Billing Screen Flow

```
[Table Selected] → [Order Screen]
    Items displayed as tiles with category filter tabs
    Search bar for quick item lookup
    Cart panel on right/bottom
    
    [Item Tap] → Add to cart
    [Long Press on Item] → Modifier screen
    [Cart Item Tap] → Modify quantity / remove
    
    [Send KOT] → Confirmation → KOT dispatched → Toast notification
    
    [Call Bill] → Bill review screen
        Shows all items, quantities, prices
        Tax breakdown visible
        
    [Apply Discount] → Discount type selection
        If within limit: applied immediately
        If above limit: PIN approval screen
        
    [Payment] → Payment mode selection
        [Cash] → Amount entry → Change calculated
        [UPI] → QR displayed → Wait for webhook → Confirmed
        [Card] → Card terminal prompt → Approved
        [Split] → Split configuration screen
        
    [Close Bill] → Receipt screen
        [Print] → Thermal printer
        [WhatsApp] → Phone number entry (pre-filled if CRM match)
        [Done] → Table marked cleaning
```

## 5.2 KDS Screen Flow

```
[KDS Dashboard]
    Tickets displayed as cards sorted by time
    Color: Green (0-10 min), Yellow (10-15 min), Red (15+ min)
    
    [Ticket Card]
        Table number (large)
        Time elapsed (large)
        Item list with modifiers
        Special instructions (highlighted)
        
    [Tap Item] → Toggle: In Progress / Ready
    [Tap Ticket] → Expand for full details
    [Swipe Right] → Bump ticket (mark all complete)
    
    [Alert] → New ticket bell sound
    [Red Ticket] → Screen pulse animation
```

---

# 6. Accessibility Requirements

| Requirement | Standard | Implementation |
|---|---|---|
| Color contrast | WCAG 2.1 AA (4.5:1 minimum) | All text on backgrounds |
| Touch target size | Minimum 44×44px | All interactive elements |
| Font size | Minimum 14px body, 18px for key data | Design tokens enforced |
| Keyboard navigation | All actions achievable by keyboard | Focus management |
| Screen reader | ARIA labels on all interactive elements | Testing with VoiceOver |
| Reduced motion | Respect system preference | CSS media query |
| High contrast mode | System preference respected | Dark/High-contrast theme |
| Language support | English + Hindi Phase 1, regional Phase 2 | i18n framework |

---

# 7. Mobile UX Principles

## 7.1 Thumb-Friendly Design

```
Phone Screen Zones:
┌─────────────────────┐
│     Hard to reach   │  ← Navigation, settings
│─────────────────────│
│    Reachable        │  ← Secondary actions
│─────────────────────│
│    Easy to reach    │  ← Primary actions (bottom 40%)
└─────────────────────┘
```

- Primary actions (bill, submit KOT) in bottom 40% of screen
- Navigation in top (accessed less frequently)
- Swipe gestures for common actions (dismiss, complete)

## 7.2 Loading States

Every action must have an immediate visual response:

| Action | Immediate Response | Completion |
|---|---|---|
| Item tapped | Scale animation + cart badge update | 50ms |
| KOT sent | Button state → "Sending" | Confirmation toast on success |
| Bill closed | Loading spinner on button | Success screen with confetti animation |
| Payment UPI | QR generated | Checkmark + amount on confirmation |

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial UX Document |

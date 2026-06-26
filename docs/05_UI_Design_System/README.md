# DS-001 — UI Design System

| Field          | Value                               |
| -------------- | ----------------------------------- |
| Document ID    | DS-001                              |
| Title          | RestaurantOS — UI Design System     |
| Version        | 1.0.0                               |
| Status         | Draft                               |
| Category       | UI Design                           |
| Author         | Vraj Prajapati                      |
| Classification | Confidential — Internal Use Only    |
| Last Updated   | 2026-06-25                          |

---

# 1. Design System Purpose

The UI Design System is the single source of truth for the visual and interactive language of RestaurantOS.

A design system ensures:
- Consistent experience across 50+ screens
- Faster UI development (no reinventing per screen)
- Accessible interface for all users
- Brand recognition across web, mobile, and print

---

# 2. Design Tokens

Design tokens are the atomic units of design — variables that define every visual property.

## 2.1 Color System

### Brand Colors
```
Primary:      #FF6B35   (Energetic orange — food, appetite, urgency)
Primary Dark: #E55A20
Primary Light:#FF8F65
Primary Pale: #FFF0EB

Secondary:    #1A1A2E   (Deep navy — trust, professionalism)
Accent:       #16213E
```

### Semantic Colors
```
Success:    #22C55E  (Green — completed, paid, available)
Warning:    #F59E0B  (Amber — attention, low stock, delay)
Error:      #EF4444  (Red — failed, critical, overdue)
Info:       #3B82F6  (Blue — informational, pending)
```

### Status Colors (KDS and Table Management)
```
Available:    #22C55E   Table / item is available
Occupied:     #3B82F6   Table is in use
Reserved:     #F59E0B   Table reserved for booking
Cleaning:     #8B5CF6   Table being cleaned
Blocked:      #6B7280   Table temporarily blocked
Overdue:      #EF4444   KOT past time threshold
Attention:    #F59E0B   KOT approaching threshold
New:          #22C55E   Newly received KOT
```

### Neutral Colors
```
Gray-900:  #111827   (Primary text)
Gray-700:  #374151   (Secondary text)
Gray-500:  #6B7280   (Placeholder / muted text)
Gray-300:  #D1D5DB   (Borders)
Gray-100:  #F3F4F6   (Backgrounds)
Gray-50:   #F9FAFB   (Subtle backgrounds)
White:     #FFFFFF
```

### Dark Mode Colors (For KDS and owner mobile)
```
Background:    #0F172A
Surface:       #1E293B
Surface-2:     #334155
Border:        #475569
Text Primary:  #F1F5F9
Text Secondary:#94A3B8
```

---

## 2.2 Typography

### Font Family
```
Primary (UI):    Inter — clean, highly legible at small sizes
Monospace (Data): JetBrains Mono — amounts, codes, IDs
```

### Type Scale
```
Display:    48px / 700 weight — Hero numbers (revenue on dashboard)
H1:         36px / 700 weight — Page titles
H2:         28px / 600 weight — Section headers
H3:         22px / 600 weight — Card titles
H4:         18px / 600 weight — Sub-sections
Body-LG:    18px / 400 weight — Important body text
Body:       16px / 400 weight — Standard body text
Body-SM:    14px / 400 weight — Secondary text
Caption:    12px / 400 weight — Labels, hints
```

### Data Typography (Critical Numbers)
```
Revenue display:     48px / 700 / Inter
Table number (KDS): 64px / 700 / Inter — visible from 3 meters
Timer (KDS):         72px / 700 / JetBrains Mono
Bill total:          28px / 700 / Inter
```

---

## 2.3 Spacing System (8px base grid)

```
spacing-1:   4px
spacing-2:   8px
spacing-3:  12px
spacing-4:  16px
spacing-5:  20px
spacing-6:  24px
spacing-8:  32px
spacing-10: 40px
spacing-12: 48px
spacing-16: 64px
spacing-20: 80px
```

---

## 2.4 Border Radius

```
rounded-sm:  4px   (Input fields, small tags)
rounded:     8px   (Cards, buttons, dropdowns)
rounded-md: 12px   (Modal panels)
rounded-lg: 16px   (Dashboard cards)
rounded-xl: 24px   (Feature cards)
rounded-full: 9999px (Pills, badges, avatar)
```

---

## 2.5 Shadows

```
shadow-sm:   0 1px 2px rgba(0,0,0,0.05)        — Subtle card elevation
shadow:      0 4px 6px rgba(0,0,0,0.07)        — Standard card
shadow-md:   0 8px 16px rgba(0,0,0,0.10)       — Dropdown, popover
shadow-lg:   0 16px 32px rgba(0,0,0,0.12)      — Modal
shadow-xl:   0 24px 48px rgba(0,0,0,0.15)      — Drawer, side panel
```

---

# 3. Component Library

## 3.1 Button System

### Button Variants
```
Primary:    bg-orange-500, text-white, hover: bg-orange-600
Secondary:  bg-white, border-gray-300, text-gray-700
Ghost:      transparent, text-gray-600, hover: bg-gray-100
Danger:     bg-red-500, text-white, hover: bg-red-600
Success:    bg-green-500, text-white
```

### Button Sizes
```
XS:  h-6,  px-2, text-xs    — Tags, inline actions
SM:  h-8,  px-3, text-sm    — Secondary actions in tables
MD:  h-10, px-4, text-sm    — Standard buttons (default)
LG:  h-12, px-6, text-base  — Primary CTAs
XL:  h-14, px-8, text-lg    — Hero CTAs, billing actions (touch targets)
```

### Special Buttons (Restaurant-specific)
```
KDS-Bump:    80px height, green, "BUMP" text — glove-friendly
Quick-Add:   Full width tile, item name + price — ordering screen
Pay-Now:     Full width, XL, Primary color — billing screen
Split-Bill:  Full width, Secondary — billing screen
```

---

## 3.2 Input System

### Text Input
```
Height:        44px (touch-friendly)
Border:        1px solid gray-300
Focus border:  2px solid primary
Error border:  2px solid red-500
Padding:       12px horizontal
Label:         above input, 14px, gray-700
Error message: below input, 12px, red-500
Helper text:   below input, 12px, gray-500
```

### Numeric Input (Billing specific)
```
Font size: 28px (large for amounts)
Alignment: right-aligned (financial convention)
Currency:  ₹ prefix always visible
Keyboard:  Numeric only, no decimal for paise entry (amounts in paise)
```

### Search Input
```
Icon:      Search icon left
Clear:     X button right when value present
Debounce:  300ms before search fires
Results:   Inline dropdown, max 8 items visible
```

---

## 3.3 Card Components

### Data Card (Dashboard)
```
┌─────────────────────────────────┐
│ Icon  Label Text          Trend │
│                                 │
│        PRIMARY VALUE            │
│                                 │
│ Subtitle / comparison           │
└─────────────────────────────────┘

Primary Value: 48px, 700 weight
Label: 14px, gray-500
Trend: colored chip (+12% green / -8% red)
```

### Order Card (KDS)
```
┌──────────────────────────────────┐
│ TABLE 12           [14:32] 🔴    │
│──────────────────────────────────│
│ ● Butter Chicken (x2)            │
│   └─ Extra spicy, No onion       │
│ ● Garlic Naan (x4)               │
│ ● Dal Makhani (x1)               │
│──────────────────────────────────│
│              [ BUMP ✓ ]          │
└──────────────────────────────────┘

Table number: 36px bold
Timer: 24px, color-coded
Items: 16px, modifier 14px muted
Bump button: 80px height, green
```

### Table Card (Floor Plan)
```
┌────────────┐
│     12     │ ← Table number (large)
│  ●●●●      │ ← Seat indicators
│  OCCUPIED  │ ← Status
│  Ravi      │ ← Assigned waiter
│  52 min    │ ← Time occupied
└────────────┘

Status-based background:
  Available:  Light green bg
  Occupied:   Light blue bg
  Reserved:   Light amber bg
  Cleaning:   Light purple bg
```

---

## 3.4 Navigation Components

### Top Navigation Bar (Web)
```
Height: 64px
Left:   Logo + Restaurant name + Branch selector
Center: Global search
Right:  Notifications bell (badge count) + User avatar + Quick actions
```

### Sidebar Navigation (Web — Desktop)
```
Width: 240px (expanded), 64px (collapsed)
Items: Icon + Label
Active: Orange left border + orange text
Hover:  Gray background
```

### Bottom Navigation (Mobile)
```
Height: 56px + safe area
Items:  5 max (Dashboard, Orders, Tables, Reports, More)
Active: Orange icon + orange label
```

### Breadcrumb
```
Page Title  /  Section  /  Current
14px, gray-500 separator, last item gray-900
```

---

## 3.5 Table / Data Grid Component

```
Header:     Gray-50 background, gray-700 text, 14px, uppercase
Row height: 52px (enough for touch)
Row hover:  Gray-50 background
Striping:   Alternate rows (optional, configurable)
Sorting:    Clickable header with sort indicator
Pagination: Previous/Next + page info + page size selector
Empty:      Illustrated empty state with action button
Loading:    Skeleton rows (3-5 rows)
Sticky:     Header sticky on scroll, action column sticky right
```

---

## 3.6 Status Badge / Pill

```
Variants:
  Success:  Green bg (light), green text — Paid, Completed, Active
  Warning:  Amber bg (light), amber text — Pending, Low Stock
  Error:    Red bg (light), red text    — Overdue, Failed, Void
  Info:     Blue bg (light), blue text  — In Progress, Reserved
  Neutral:  Gray bg, gray text          — Draft, Inactive

Size:
  SM: h-5, px-2, text-xs
  MD: h-6, px-3, text-xs (default)
```

---

## 3.7 Alert / Toast Notifications

### Toast (Transient)
```
Position:  Top-right (desktop), Bottom (mobile)
Duration:  Success: 3s | Warning: 5s | Error: 7s | Persist (error with action)
Max:       3 toasts visible at once (queue remaining)

Structure:
  Icon + Title + Description + Action link (optional) + Close
  
Variants:
  Success: Green left border
  Warning: Amber left border
  Error:   Red left border
  Info:    Blue left border
```

### Critical Alert (Modal Alert)
```
For: Stockout, bill void, cash discrepancy
Cannot be dismissed by clicking outside
Requires explicit action (Acknowledge / Resolve)
Plays audio alert for stockout (configurable)
```

---

## 3.8 Modal and Drawer

### Modal (Confirmation/Form)
```
Sizes:    SM (400px), MD (600px), LG (800px), XL (1100px)
Backdrop: Black 50% opacity
Header:   Title + Close button
Footer:   Primary CTA + Cancel (right-aligned)
Scroll:   Body scrolls, header/footer fixed
```

### Drawer (Side Panel)
```
Positions: Right (primary), Left (navigation)
Widths:    SM (320px), MD (480px), LG (640px)
Backdrop:  Present (click to close)
Animation: Slide in from direction
```

---

# 4. Screen Layout Patterns

## 4.1 Billing Screen Layout (Web POS)

```
┌─────────────────────────────────────────────────┐
│ HEADER: Table 12 | 4 covers | 34 min | Staff    │
├────────────────────────┬────────────────────────┤
│                        │                        │
│   MENU PANEL (60%)     │   ORDER CART (40%)     │
│                        │                        │
│  [Search bar]          │  Item 1 ×2     ₹320   │
│                        │  Item 2 ×1     ₹180   │
│  [STARTERS] [MAINS]    │  Item 3 ×3     ₹540   │
│  [DRINKS]  [DESSERTS]  │─────────────────────  │
│                        │  Subtotal      ₹1,040 │
│  ┌──────┐ ┌──────┐    │  GST (5%)       ₹52   │
│  │Item A│ │Item B│    │─────────────────────  │
│  │ ₹280 │ │ ₹320 │    │  TOTAL         ₹1,092 │
│  └──────┘ └──────┘    │                        │
│                        │  [SEND KOT]            │
│  ┌──────┐ ┌──────┐    │  [CALL BILL]           │
│  │Item C│ │Item D│    │  [DISCOUNT]            │
│  │ ₹180 │ │ ₹450 │    │                        │
│  └──────┘ └──────┘    │                        │
└────────────────────────┴────────────────────────┘
```

## 4.2 Dashboard Layout (Owner Mobile)

```
┌─────────────────────────┐
│ ≡  RestaurantOS    🔔  │
│─────────────────────────│
│                         │
│   TODAY'S REVENUE       │
│   ₹54,200               │
│   +12% vs yesterday     │
│                         │
│ ┌─────────┬───────────┐ │
│ │ Covers  │ Avg/Cover │ │
│ │   87    │  ₹623     │ │
│ └─────────┴───────────┘ │
│                         │
│ ⚠ 2 Alerts             │
│ • Chicken stock low     │
│ • Cash variance ₹220    │
│                         │
│ BRANCH COMPARISON       │
│ ■■■■■■■■■■ Branch 1 72%│
│ ■■■■■■■     Branch 2 48%│
│ ■■■■■■■■■   Branch 3 62%│
│                         │
│ [Reports] [Alerts] [+]  │
└─────────────────────────┘
```

## 4.3 KDS Layout (Kitchen Display)

```
┌──────────────────────────────────────────────────────────┐
│  KDS — MAIN KITCHEN         21:45          [12 Open] 🔴  │
├──────────────┬──────────────┬──────────────┬─────────────┤
│  TABLE 4     │   TABLE 7    │  TABLE 11 🔴 │   TABLE 3   │
│   7 min 🟢  │   12 min 🟡  │  24 min 🔴   │   3 min 🟢  │
│──────────────│──────────────│──────────────│─────────────│
│ ✓ Naan ×2   │ ▶ Biryani ×1│ ▶ Dal ×2     │ · Tikka ×1 │
│ ▶ Paneer ×1 │ ✓ Lassi ×2  │ ▶ Naan ×4    │ · Salad ×2 │
│ · Raita ×1  │ · Dessert ×1 │ ▶ Chicken ×2 │             │
│──────────────│──────────────│──────────────│─────────────│
│   [ BUMP ]   │   [ BUMP ]   │   [ BUMP ]   │  [ BUMP ]  │
└──────────────┴──────────────┴──────────────┴─────────────┘
Status: ✓=Done  ▶=Cooking  ·=Pending
```

---

# 5. Design Tokens Export Format

Design tokens are available as:
- CSS custom properties: `--color-primary: #FF6B35`
- JavaScript/TypeScript: `theme.colors.primary`
- JSON (for Figma synchronization)
- Tailwind config extension

All tokens defined once in `design-tokens.json`, auto-generated to all formats via Style Dictionary.

---

# 6. Icon System

**Icon Library:** Lucide Icons (open source, consistent design language)

### Icon Sizes
```
XS:  12px — Inline with text
SM:  16px — Buttons, list items
MD:  20px — Standard icons (default)
LG:  24px — Navigation, feature icons
XL:  32px — Empty states, cards
2XL: 48px — Hero illustrations
```

### Restaurant-Specific Custom Icons
```
KOT:         Custom receipt icon
Table:       Custom round table icon
Cover:       Custom people-at-table icon
Dine-in:     Custom cutlery icon
Cloud kitchen: Custom ghost icon
Wastage:     Custom bin with food icon
```

---

# 7. Print Design (Receipt / Invoice)

## 7.1 Thermal Receipt (80mm)

```
┌──────────────────────────┐
│      RESTAURANT NAME      │
│       Branch Name         │
│  Address | GSTIN: XXX     │
│  FSSAI: XXX | Ph: XXX     │
│──────────────────────────│
│  Bill No: INV-2026-08234  │
│  Date: 25/06/2026 21:45   │
│  Table: 12 | Covers: 4    │
│  Cashier: Ravi Kumar      │
│──────────────────────────│
│ Item          Qty  Amount │
│──────────────────────────│
│ Butter Chicken  2    640  │
│ Garlic Naan     4    240  │
│ Dal Makhani     1    280  │
│ Lassi           2    180  │
│──────────────────────────│
│ Subtotal:          1,340  │
│ CGST 2.5%:            34  │
│ SGST 2.5%:            34  │
│ Service Charge 5%:    67  │
│──────────────────────────│
│ TOTAL:             1,475  │
│──────────────────────────│
│ Cash Tendered:     2,000  │
│ Change:              525  │
│──────────────────────────│
│ Loyalty Points Earned: 14 │
│ Total Points: 342         │
│──────────────────────────│
│ Thank you! Visit again :) │
│  Feedback: wa.me/XXXXX    │
│ [QR Code for feedback]    │
└──────────────────────────┘
```

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial Design System |

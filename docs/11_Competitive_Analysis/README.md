# CA-001 — Competitor Analysis: Restaurant Management Software

| Field          | Value                                          |
| -------------- | ---------------------------------------------- |
| Document ID    | CA-001                                         |
| Title          | Full Competitive Landscape — Restaurant ERP/POS |
| Version        | 1.0.0                                          |
| Status         | Research Complete                              |
| Category       | Competitive Intelligence                       |
| Author         | Vraj Prajapati                                 |
| Classification | Confidential — Internal Use Only               |
| Last Updated   | 2026-06-25                                     |

---

# 1. Competitive Landscape Overview

## 1.1 Market Map

```
ENTERPRISE / CHAIN FOCUS
        │
        ├── Restroworks (ex-Posist) — 25,000 restaurants, 52 countries
        ├── Oracle MICROS — Global enterprise
        ├── Lightspeed — Western markets
        ├── Toast POS — US market leader
        │
INDIA SMB SEGMENT                           INDIA MID-MARKET
        │                                          │
        ├── Petpooja (market leader)               ├── GoFrugal (franchise/chain)
        ├── TMBill                                 ├── eZee BurrP!
        ├── RanceLab FusionResto                   ├── Dotpe
        │
AGGREGATOR MIDDLEWARE / DIGITAL ORDERING
        │
        ├── UrbanPiper — Aggregator integration layer
        ├── Dotpe — QR ordering + aggregator
        │
GLOBAL SMB
        │
        ├── Square for Restaurants
        ├── Lightspeed
```

## 1.2 Quick Comparison Matrix

| Product | Customers | Target | Price (India) | Best At | Weakest At |
|---|---|---|---|---|---|
| **Petpooja** | 100,000+ | India SMB | ₹10,000/yr | Market reach, price | Speed, AI, offline |
| **Restroworks** | 25,000+ | Enterprise chains | Custom, ₹15K–60K/yr | Multi-outlet, enterprise | SMB fit, pricing |
| **eZee BurrP!** | 10,000+ | All sizes, hotels | ₹575 one-time/user | Hotel+restaurant combo | Offline, mobile |
| **GoFrugal** | 25,000+ | Franchise chains | ₹7/month–₹9K/yr | Franchise mgmt, ERP | Support, complexity |
| **TMBill** | 14,000+ | QSR, chains | ₹5,999–8,999/yr | Aggregator sync | Support quality |
| **Dotpe** | 50,000+ | SMB, digital-first | Free–₹2,999/yr | QR menu, digital orders | Full ERP features |
| **UrbanPiper** | 30,000+ outlets | Aggregator middleware | Custom | Aggregator integration | Not a full POS |
| **Toast POS** | 100,000+ | US restaurants | $69–$110+/mo | US market, hardware | India presence, price |
| **Square** | 4M+ businesses | Global SMB | Free–$60/mo | Ease of use, free tier | India support |
| **Atlas** | 0 (MVP) | India SMB + mid | ₹499–1,999/mo | AI, WhatsApp, speed | Brand recognition |

---

# 2. PETPOOJA — Deep Dive

## 2.1 Company Profile

| Field | Data |
|---|---|
| Founded | ~2012 |
| Headquarters | Ahmedabad, India |
| Revenue | $189M (2026 est.) |
| Customers | 100,000+ restaurants |
| Daily Bills | 60+ lakh (6 million) |
| Daily API calls | 50 million+ |
| Cities (India) | 200+ with on-ground support |
| Funding | Bootstrapped |
| G2 Rating | 4.7 / 5 (287 reviews) |
| Capterra Rating | 4.6 / 5 |

## 2.2 All Product Modules

### POSS — POS & Billing
- 3-click billing (their USP claim)
- Table management, split/merge bills
- KOT generation and printing
- Multiple payment methods, payment splitting
- Discount and coupon management
- Multi-table order management
- Compatible with 200+ printers and weighing scales
- Supports: Regular A4, WiFi, LAN, USB, Dot-matrix, Laser, Label, Bluetooth printers

### Inventory Management
- Item-wise auto stock deduction
- Low-stock alerts
- Day-end inventory reports
- Item-wise recipe uploads for consumption tracking
- Supplier and central kitchen modules
- Multi-stage recipe tracking
- Stock transfer between locations
- Purchase orders that auto-update inventory
- AI Inventory Agent (new — auto-maintains stock)

### Menu Management
- Digital menu creation
- Different menus per dine-in area
- Item-wise variations + add-ons with separate pricing
- Real-time menu sync across platforms and aggregators
- Online menu management across Zomato/Swiggy simultaneously

### Online Orders (Aggregator Integration)
- Zomato, Swiggy, Uber Eats, Dineout, Dunzo
- Unified queue from all delivery platforms
- Direct order flow into POS (zero manual entry)
- "Mark food ready" status updates
- Online order reconciliation

### Reports & Analytics
- **80+ reports** available
- Day-end sales, hourly trends, inventory consumption
- Staff activity tracking
- Revenue insights, average ticket size
- Time slot-wise sales analysis
- Menu item profitability reports
- Brand and location performance
- Customer trend analysis
- Automated email alerts for key metrics

### CRM & Customer Management
- Customer data pools and segmentation
- Order history tracking
- SMS marketing campaigns
- Service feedback collection
- Birthday/special occasion messaging
- Post-visit thank you texts
- Seasonal offer campaigns

### Loyalty Program
- POS-generated reward points
- SMS notifications for points
- Virtual wallet system
- Points redemption via SMS or mobile
- Expiry date management
- Special discount tracking

### Kitchen Display System (KDS)
- Real-time order display in kitchen
- Paper-free (replaces KOT slips)
- Station-wise order allocation
- Multi-display for large kitchens
- Works on Windows and Android
- (available as add-on, not in base plan)

### Payroll Module (separate product — "Petpooja Payroll")
- Biometric attendance integration (4 methods: biometric, biometric plus, face scanner, geo-tagged mobile)
- Real-time attendance sync
- Leave management (paid, unpaid, sick, casual)
- Shift scheduling
- Auto salary calculation + overtime
- PF, ESIC, Professional Tax, Labour Welfare Fund deductions
- Salary advance tracking
- Multi-frequency pay (monthly, hourly)
- WhatsApp payroll summaries

### Invoice Module
- GST-compliant invoicing
- Auto CGST, SGST, IGST calculations
- Debit/credit note management
- Supplier return tracking
- E-invoicing support
- E-way bill generation
- GSTR export

### Purchase Module ("AI Inventory Agent")
- Invoice scanning and processing
- Purchase bill creation
- Supplier balance tracking
- Inventory adjustment automation
- Overstock prevention
- Purchase order management

### Tasks Module
- Operational task assignment and tracking
- SOP templates
- Geofenced task validation
- Dependent and group task creation
- Photo/video/checklist proof collection
- AI-based task review
- Opening/closing checklist templates

### Captain Ordering App
- Mobile table-side ordering
- Smart food recommendations
- Payment processing at table
- Offline mode
- Android + iOS

## 2.3 Pricing

| Plan | Price | Includes |
|---|---|---|
| **Core** | ₹10,000/year (~₹833/month) | Cloud POS, inventory, 100+ reports, merchant app, 24/7 support |
| **Growth** | ~₹11,400/year (~₹950/month) | Core + 10+ marketplace apps + task management |
| **Scale** | ~₹16,200/year (~₹1,350/month) | Growth + invoice management + dynamic reports |
| **Renewal** | ₹7,500/year | After year 1 renewal |

**Hidden costs:**
- KDS: paid add-on
- Loyalty programs: paid add-on
- WhatsApp ordering: paid add-on
- Third-party integrations: mostly paid
- Hardware: separate purchase

**No free plan, no free trial.**

## 2.4 User Roles

| Role | Access |
|---|---|
| Admin | Full system access, manage all users and settings |
| Manager | All outlet visibility, full functionality |
| Cashier | Billing functions only |
| Kitchen Staff | Kitchen orders and KDS only |

**Limitations:**
- Only 4 core roles
- Custom role creation not prominently featured
- Multi-location businesses can assign admins per location

## 2.5 Onboarding Process

**Speed to operational: ~1 day**

```
Step 1: Sign up (email/Google login)
Step 2: Enter restaurant name, owner details, address
Step 3: Configure GST (GSTIN, tax rates)
Step 4: Upload menu (manual entry or CSV import)
Step 5: Set up tables
Step 6: Configure printers
Step 7: Pay initial fee
Step 8: Assign staff accounts
→ System is live
```

- Self-serve for basic setup
- Sales team support for larger implementations
- Field team deployment for enterprise rollouts
- Training support available 24/7
- No structured onboarding wizard (this is a gap)

## 2.6 Integrations

| Category | Integrations |
|---|---|
| Food Delivery | Zomato, Swiggy, Uber Eats, Dineout, Dunzo |
| Payments | Razorpay, Paytm, PhonePe |
| Accounting | Tally, SAP, Dynamic NAV, Busy Accounting |
| Loyalty | Reelo |
| Messaging | Gupshup, WhatsApp Business |
| Reservations | EasyDiner |
| Commerce | ONDC |
| Other | Google Sheets, Masters India (supply chain) |
| **Total** | **200+ integrations** |

## 2.7 Known Weaknesses (Documented User Complaints)

### Performance
- Slow during peak hours
- Mobile app "feels slightly slow"
- Reports slow with large datasets
- Billing speed degrades under load

### Sync Issues
- Inventory sync delays (especially weekends)
- Menu update propagation delays
- Data sync problems during poor connectivity

### User Interface
- Order-taking screen "not user friendly" (multiple reviews)
- Menu management "time-consuming"
- Navigation unclear for new staff
- Staff training takes longer than expected

### Feature Gaps
- No AI-powered voice ordering
- No predictive inventory
- No proactive owner alerts (no push/WhatsApp notifications by default)
- Cannot be "remotely operated" per some reviews
- Online order tracking missing

### Pricing Opacity
- Prices not on website — requires sales call
- Annual contracts — limited flexibility
- Many standard features are paid add-ons
- Real cost 2x quoted price once add-ons included

### Offline Limitations
- While offline mode exists, functionality is limited
- Heavy internet dependency for full features
- Sync problems after reconnection

## 2.8 Differentiators (What They Claim)

1. Industry-low, transparent pricing (SMB positioning)
2. Built for the small, independent restaurant owner
3. 200+ integrations, processor-agnostic
4. Hyperlocal support in 200+ Indian cities
5. 60+ lakh daily bills with zero processing errors
6. Easiest interface among available solutions

## 2.9 How Atlas Beats Petpooja

| Dimension | Petpooja | Atlas |
|---|---|---|
| Price | ₹833–1,350/month + add-ons | ₹499–999/month, all-inclusive |
| Speed | Slow during peak hours | < 1.5 second screens (guaranteed) |
| WhatsApp alerts | Manual or paid add-on | Built-in, automatic nightly summary |
| Offline billing | Limited | Full 72-hour offline |
| AI alerts | None in base plan | Included: void, cash, discount anomaly |
| Roles | 4 basic | 6 complete roles |
| Onboarding | 1 day, mostly manual | Guided wizard, < 30 min |
| Transparency | No public pricing | Public pricing on website |

---

# 3. RESTROWORKS (formerly Posist) — Deep Dive

## 3.1 Company Profile

| Field | Data |
|---|---|
| Founded | 2012 (as Posist), rebranded 2024 |
| Headquarters | San Francisco, CA (India ops: New Delhi) |
| Customers | 25,000+ restaurants |
| Countries | 52+ |
| Employees | 123+ |
| Funding | Bootstrapped (minimal early funding: $508K) |
| G2 Rating | 4.8 / 5 (2,575+ reviews) — Leader |
| Capterra Rating | 4.8 / 5 (277+ reviews) |
| Growth | 80% YoY |
| Notable Clients | Taco Bell, Subway, Nando's, Carl's Jr, Häagen-Dazs |

## 3.2 All Product Modules

### Front of House
- Restaurant POS (billing + payments)
- Tablet/server ordering app
- Table layout and management
- Customer order display
- Reservation software
- Multi-channel order aggregation

### Back of House
- Real-time cloud inventory management
- Central/base kitchen management
- Recipe management with costing
- Supply chain management
- Procurement and vendor management
- Delivery management

### Kitchen Operations Suite
- Advanced KDS (Kitchen Display System) — launched 2024
- Kitchen production system
- Restaurant forecasting software
- Token system for order sync
- Multi-station, multi-channel support
- Barcode bumping for speed

### Digital Ordering
- **RestroGO**: Self-service kiosk (2024)
- **RestroSCAN**: QR code ordering (2024)
- **RestroAPP**: Food delivery mobile app
- **RestroWEB**: Online ordering website

### Analytics & Insights
- 200+ expertly crafted reports
- Cockpit mobile analytics app
- Anti-theft software
- Real-time business intelligence
- Insight Dashboard (2024)

### CRM & Customer Experience (CX Suite)
- Centralized guest database (auto-captures from POS, online, reservations)
- Omnichannel customer profiles
- Automated SMS, email, WhatsApp campaigns
- Customer segmentation by order history and spend
- Loyalty program (points, rewards, coupons)
- Lapsed customer re-engagement
- Customer lifetime value analysis
- High-value customer identification

### Platform
- Open REST API
- Security and compliance tools
- Unified menu management
- Multi-outlet centralized control
- 332 new features launched in 2024 alone

## 3.3 Pricing

| Plan | Price |
|---|---|
| **Minimum** | ~$200/year (single outlet basic) |
| **Standard** | Custom quote, typically ₹15,000–25,000/year per outlet |
| **Enterprise** | Custom, ₹40,000–1,00,000+/year |

- No free plan
- No public pricing — contact sales required
- Pricing scales per module selected + number of outlets + terminals
- Hardware costs separate

## 3.4 User Roles

| Role | Access |
|---|---|
| Manager | Multi-level permissions, configurable |
| Cashier | Billing only |
| Chef / Kitchen | KDS, kitchen only |
| Procurement | Inventory + purchase |
| Custom Roles | Granular permission creation |

- Full RBAC with granular permissions
- Bulk role updates supported
- Real-time role changes from anywhere
- Different dashboard views per role
- Role-specific feature access restriction

## 3.5 Onboarding Process

**More structured than Petpooja:**

```
Step 1: Contact sales → custom scoping call
Step 2: Module selection + hardware scoping
Step 3: Quote and contract
Step 4: Dedicated onboarding manager assigned
Step 5: Hardware sourcing and setup assistance
Step 6: Data migration (menu, inventory, customers)
Step 7: Staff training per role
Step 8: Soft launch (test period)
Step 9: Go live
```

- Dedicated onboarding manager per client
- Training provided to all staff levels
- Hardware setup assistance included
- Described as "quicker setup vs. competitors"
- "Seamless onboarding experience" (G2 reviews)

**Pain point:** Sales-led process = no self-serve. Can take 2–4 weeks.

## 3.6 Integrations

| Category | Count | Examples |
|---|---|---|
| Food Delivery | 10+ | Zomato, Swiggy, Talabat, Rappi, Pedidos Ya, Olo |
| Payment | 10+ | Stripe, Razorpay, Paytm, PhonePe, Zomato Pay, UPI |
| Enterprise ERP | SAP, QuickBooks, Xero | |
| Order Management | Otter | |
| Logistics | Shipday | |
| Loyalty | Reelo | |
| **Total Marketplace** | **400–500+** | |

- Open REST API for custom integrations
- Compatible with: Toast POS, Clover, Vend, Lightspeed

## 3.7 Known Weaknesses

### Support
- Some users report difficulty reaching support
- Long wait times in some regions
- Regional support gaps outside major cities

### Complexity
- Initial setup complex for non-tech users
- Multiple logins confusing
- Overkill for single-outlet restaurants

### Pricing
- Enterprise pricing — completely inaccessible for small restaurants
- No trial, no freemium
- Requires sales engagement

### Target Mismatch
- Not suited for single outlets (₹5,000–25,000+/year for one location)
- Focus is enterprise chains, not independent restaurants

## 3.8 How Atlas Differs from Restroworks

**Restroworks target:** Enterprise chains (Taco Bell, Subway, 50+ outlet operations)
**Atlas target:** Single outlet to 5 outlet Indian restaurants

They are not direct competitors. Restroworks wins enterprise; Atlas wins SMB. However:
- When Atlas's SMB customers grow into chains, Restroworks is the migration risk
- Atlas must build chain features (multi-outlet, central kitchen) to prevent losing growing customers

---

# 4. eZee BurrP! (eZee Technosys) — Deep Dive

## 4.1 Company Profile

| Field | Data |
|---|---|
| Founded | 2004 |
| Headquarters | Surat, Gujarat, India |
| Primary Product | Hotel + Restaurant management suite |
| Capterra Rating | 4.5 / 5 (103 reviews) |
| Users | Hotels + restaurants globally |
| Key Differentiator | Full hospitality suite (hotel + restaurant) |

## 4.2 All Product Modules

| Module | Key Features |
|---|---|
| POS | Quick billing, bill splitting, table management |
| Table Management | Reservation, multi-table, table layout designer |
| Menu Management | Multi-menu, different pricing structures, tax configs, modifiers |
| KDS | Kitchen display, order management |
| Inventory | Stock tracking, batch management, inventory analytics |
| Recipe Management | Standard recipes, costing |
| Employee Management | Staff records, payroll, time & attendance |
| Customer Management | Guest management, room posting (hotel integration) |
| Loyalty | Points program, gift cards, vouchers |
| Accounting | Built-in accounting, financial reporting |
| Multi-Location | Centralized control, multi-outlet management |
| Analytics | Sales insights, food cost analysis, detailed reporting |
| Notifications | Real-time email and SMS |
| Banquet Management | Event and banquet operations |
| Online Ordering | Aggregator order integration |

## 4.3 Pricing

| Plan | Price |
|---|---|
| **One-Time License** | ₹575/user (one-time) |
| **Annual Subscription** | Available on request |
| **Bulk** | Discounts for multi-location |
| **Trial** | Free 30-day trial |

## 4.4 Roles

- Owner / Restaurant Director
- Manager / Hospitality Director
- Front-of-house staff (waiter, cashier)
- Kitchen staff
- IT administrator
- Food and beverage team members

## 4.5 Onboarding Process

- In-person training available
- Live online sessions
- Webinars
- Documentation
- 24/7 live representative support

## 4.6 Integrations

| Category | Integrations |
|---|---|
| Accounting | Tally, QuickBooks, Sage 50, Xero |
| Payments | Authorize.net |
| Hardware | KOT printers, receipt printers, cash drawers, touch screens, PDA, fingerprint, barcode scanners |
| Notifications | Email (free), SMS (licensed) |
| Other | Primarily hotel PMS systems |

**Note: No direct Zomato/Swiggy integration — this is a major gap for Indian market**

## 4.7 Known Weaknesses

1. **No Zomato/Swiggy integration** — critical miss for Indian restaurants
2. **Weak cash count functionality** at shift end
3. **Offline functionality** poor during power/internet outages
4. **Database performance** issues with large datasets
5. **Mobile apps** need improvement (iPad + Android ordering)
6. **Complex back-office** — steep learning curve
7. **Designed primarily for hotels** — restaurant module feels secondary

## 4.8 How Atlas Differs

eZee BurrP! is primarily a hotel management system with a restaurant module bolted on. Atlas is restaurant-first. For any pure restaurant (non-hotel), Atlas wins because the core workflow is designed around restaurant operations, not hospitality check-in/check-out.

---

# 5. GoFrugal — Deep Dive

## 5.1 Company Profile

| Field | Data |
|---|---|
| Founded | 2004 |
| Headquarters | Chennai, India |
| Customers | 25,000+ businesses across retail + restaurant |
| Countries | 50+ |
| Certifications | ISO 27001, VAPT certified |
| Focus | Franchise chains and multi-outlet restaurant ERP |
| Best Clients | Multi-outlet QSR chains, franchise operations |

## 5.2 All Product Modules

### Core POS & Billing
- Restaurant billing for dine-in, takeaway, delivery
- Table ordering and management
- Kitchen order ticket (KOT) system
- Mobile order-taking app
- E-commerce integration

### Inventory Management
- Batch management with expiry tracking
- Quality control monitoring
- Daily stock audits
- Stock discrepancy resolution via web dashboard
- Real-time inventory visibility

### Purchase Management
- Vendor database + tracking
- Purchase order generation + editing
- Automatic reorder notifications
- Supplier performance analytics

### Online Order Management
- Swiggy, Zomato, MagicPin, Dunzo integration
- ONDC integration (competitive differentiator)
- Automatic item toggling by availability
- Kitchen ticket routing to KOT

### Recipe + Production
- Production planning by order volume
- Recipe management + cost storage
- Cost analysis per dish
- Bill of Materials (BOM)
- Wastage tracking and analysis
- Food Costing Reports (FCR)
- Variance evaluation

### CRM & Loyalty
- Customized offers by customer segment
- WhatsApp + SMS marketing campaigns
- Loyalty points
- Occasion-based promotions
- Feedback collection

### Accounting & GST
- Auto GST calculations + invoicing
- Multi-outlet financial consolidation
- Direct GST e-filing (GSTR reports)
- Expense automation
- Budget creation + tracking

### Franchise Management
- Centralized master data control
- Inter-location stock transfers
- Automated indent requests
- Role-based access per franchise

### Business Intelligence
- Interactive dashboards
- GSTR compliance reporting
- Food cost analysis
- Sales trends and analytics
- Mobile monitoring

## 5.3 Pricing

| Plan | Price | Includes |
|---|---|---|
| **Cash Register** | ₹7/store/month | Basic billing only |
| **Starter** | ₹8,999/year | POS + Accounting (4 hrs onboarding) |
| **Standard** | Higher (contact) | Advanced inventory (6 hrs onboarding) — "Most Popular" |
| **Professional** | Higher (contact) | Complete ERP (9 hrs onboarding) |
| **Cloud Basic** | Contact | Complete ERP cloud |
| **Cloud Elite** | Contact | Complete ERP cloud — "Most Popular" |
| **Enterprise** | Custom | Large volumes |

- 30-day free trial
- Annual billing: pay 10 months, get 12
- 70+ integrations (some free, some paid)

## 5.4 Roles

- Restaurant owners and managers
- Franchise partners (multi-outlet access)
- Kitchen staff
- Front-of-house staff
- Inventory managers
- Financial analysts

## 5.5 Onboarding Process

```
Step 1: 30-day free trial
Step 2: Select plan
Step 3: Onboarding (30–120 minutes depending on plan)
  - Starter: 4 hours included
  - Standard: 6 hours included
  - Professional: 9 hours included
Step 4: Staff training
Step 5: Go live
```

**Weakness:** Only 4–9 hours of onboarding for a complex ERP system. Users report insufficient hands-on support.

## 5.6 Integrations

| Category | Integrations |
|---|---|
| Food Delivery | Swiggy, Zomato, MagicPin, Dunzo, ONDC |
| Payments | UPI, standard gateways |
| Accounting | Tally (implied), standard |
| Total | 70+ third-party integrations |

## 5.7 Known Weaknesses

1. **Poor after-sales support** — most common complaint, "chat support not hands-on"
2. **Complex interface** — "intimidates operators," needs simplification
3. **Trainer shortage** — insufficient hands-on, onsite support
4. **High setup cost** for smaller retailers
5. **Cloud dependency** — vulnerable to outages
6. **Limited customization** on advanced reports
7. **Customers not properly trained** before go-live

## 5.8 How Atlas Differs

GoFrugal is a great ERP but terrible on support and UX. Atlas wins on: guided onboarding, clean UI, better support responsiveness, and WhatsApp-first owner experience. GoFrugal wins on: multi-outlet ERP depth, franchise management, ONDC integration (which Atlas will add in Phase 2).

---

# 6. TMBill — Deep Dive

## 6.1 Company Profile

| Field | Data |
|---|---|
| Headquarters | India |
| Customers | 14,000+ restaurants |
| Cities | 350+ |
| Countries | 35+ |
| Notable Clients | KFC, Pizza Hut, Baskin-Robbins, Costa Coffee, TGI Friday's, Hardees |
| Capterra Rating | 4.4 / 5 (23–37 reviews) |
| Ease of Use | 4.7 / 5 |
| Value for Money | 4.6 / 5 |

## 6.2 All Product Modules

| Module | Features |
|---|---|
| POS | Fast checkout, dine-in/takeaway/delivery billing |
| KOT | Kitchen order ticket management |
| Inventory | Real-time tracking, stock management |
| Recipe | Recipe storage, wastage tracking |
| CRM | Customer management and data |
| Loyalty | Points and program management |
| QR Menu | QR code digital menu with ordering |
| Online Orders | Multi-channel aggregator dashboard |
| Channel Manager | Sync menus across Zomato/Swiggy/others, auto item toggle |
| Table Management | Layout and management |
| Multi-Outlet | Centralized 100+ outlet control |
| Live Order Tracking | Real-time order status |
| Feedback | Customer feedback system |
| Marketing | WhatsApp integration for marketing |
| Reports | Business intelligence dashboards |
| Accounting | Tally integration |

## 6.3 Pricing

| Plan | Annual Price | Renewal |
|---|---|---|
| **Billing Package** | ₹5,999/year + GST | ₹4,500/year |
| **Standard Package** | ₹8,999/year + GST | ₹6,500/year |

**Billing Package includes:**
- Unlimited devices, Billing + KOT, Menu + Table management, Multilingual, CRM

**Standard Package adds:**
- Live tracking, Digital menu, Third-party integration, Inventory, Recipe management

## 6.4 Roles

- Owners and directors
- Multi-outlet franchise managers
- Staff members
- Kitchen personnel
- Front-of-house staff

## 6.5 Onboarding Process

- Free demo available
- Video tutorials on YouTube
- WhatsApp support option
- Callback request
- 24/7 customer support (claimed)

**Note:** No structured onboarding wizard. Post-purchase support is inconsistent.

## 6.6 Integrations

| Category | Integrations |
|---|---|
| Food Delivery | Zomato, Swiggy, Talabat, HungerStation, Deliveroo, Noon Food, Careem, Jahez, Just Eat, Instashop, ONDC |
| Payments | Razorpay, UPI, PhonePe, Tap Payment, Noon Payment, Magnati, ADCB Bank |
| Accounting | Tally |
| Communication | WhatsApp |
| Loyalty | Smiles |

## 6.7 Known Weaknesses

1. **Inconsistent support** — "not supportable at all" vs. "highly responsive" — very polarized reviews
2. **Payment integration bugs** — "worst services for payment integration"
3. **No refund policy** — users report losing money with no recourse
4. **Complex interface** — hard to understand for non-tech staff
5. **Limited offline capability**
6. **KOT modification requires print** — annoying workflow
7. **After-sales support drops off** post-purchase

## 6.8 How Atlas Differs

TMBill has good breadth (11 food delivery integrations) but terrible reliability of support. Atlas wins on: support quality, onboarding experience, billing reliability, and owner WhatsApp features. Atlas needs to match TMBill's breadth of aggregator integrations (currently 11 vs. Atlas MVP's 2).

---

# 7. DotPe — Deep Dive

## 7.1 Company Profile

| Field | Data |
|---|---|
| Founded | 2019 |
| Headquarters | Gurugram, India |
| Customers | 50,000+ merchant stores |
| Funding | Series B — $27.5M raised |
| Investors | Tiger Global, Matrix Partners India |
| Primary Focus | Digital-first ordering, QR menus, aggregator management |
| G2 / Reviews | Growing user base |

## 7.2 Core Product Focus

DotPe is **not a full ERP**. It is a digital ordering and customer engagement platform that bolts onto existing POS systems. Think of it as:

```
DotPe = QR Menu + Digital Ordering + Aggregator Management + Basic CRM
(NOT a full POS replacement)
```

## 7.3 All Product Modules

| Module | Features |
|---|---|
| QR Code Menu | Digital menu via QR on table, no app needed |
| WhatsApp Ordering | Customer orders directly via WhatsApp |
| Table Ordering | Customer-facing self-ordering on table QR |
| Aggregator Integration | Zomato, Swiggy, Magicpin unified management |
| Menu Sync | Push menu changes to all platforms simultaneously |
| Basic POS | Simple billing capability |
| Customer Database | Build customer list automatically from orders |
| Basic CRM | Customer communication via WhatsApp |
| Loyalty | Points and rewards system |
| Google Reviews Integration | Direct customer feedback to Google |
| Analytics | Basic sales and order analytics |
| Website | Auto-generated restaurant website with ordering |
| Social Commerce | Instagram/Facebook ordering |

## 7.4 Pricing

| Plan | Price |
|---|---|
| **Basic** | Free (QR menu only) |
| **Starter** | ₹999–1,499/month |
| **Growth** | ₹2,499–2,999/month |
| **Enterprise** | Custom |

**Key:** DotPe's free tier is how they acquire customers. Then they upsell to paid features.

## 7.5 Onboarding Process

DotPe's onboarding is their biggest competitive advantage — it is the **fastest in the market**:

```
Step 1: Download app / visit website
Step 2: Enter restaurant name + number
Step 3: Upload menu (photo or manual)
Step 4: Scan QR code — live in < 10 minutes
```

**< 10 minutes to first live QR menu.** No sales call, no onboarding manager.

This is what Atlas must learn from DotPe — ruthless simplicity in onboarding.

## 7.6 Integrations

- Zomato, Swiggy, Magicpin (primary integrations)
- WhatsApp Business API
- Google My Business (reviews)
- Instagram, Facebook (social commerce)
- Razorpay (payments)

## 7.7 Known Weaknesses

1. **Not a full POS** — restaurants still need a separate billing system
2. **Limited inventory** — no real inventory management
3. **No offline mode** — everything is cloud-dependent
4. **Limited financial reporting** — not adequate for GST compliance
5. **No KDS** — no kitchen operations
6. **No staff management** — no HR/attendance

## 7.8 How Atlas Differs

DotPe is NOT a full restaurant ERP. It competes with Atlas only on digital ordering features (QR menu, WhatsApp ordering). Atlas includes everything DotPe does PLUS full POS, KDS, inventory, reports, and GST compliance.

**Atlas onboarding must be as fast as DotPe.** This is the benchmark: < 30 minutes to first live bill.

---

# 8. UrbanPiper — Deep Dive

## 8.1 Company Profile

| Field | Data |
|---|---|
| Founded | 2015 |
| Headquarters | Bangalore, India |
| Customers | 30,000+ restaurant locations |
| Funding | Series B — $24M |
| Investors | Sequoia Capital India, SAIF Partners |
| Primary Focus | Aggregator middleware / integration layer |

## 8.2 What UrbanPiper Does

UrbanPiper is **middleware**, not a POS. It sits between restaurant POS systems and food delivery aggregators:

```
Zomato ──┐
Swiggy ──┤──→ UrbanPiper Hub ──→ Restaurant POS (Petpooja, Restroworks, etc.)
Talabat ─┘
ONDC ────┘
```

## 8.3 All Product Modules

| Module | Features |
|---|---|
| **Hub (Order Aggregation)** | Single screen for all aggregator orders |
| **Meraki (Menu Management)** | Push menu changes to all platforms simultaneously |
| **Prism (Analytics)** | Cross-platform reporting and business insights |
| **Relay (Auto-Accept)** | Automatic order acceptance based on rules |
| **Spoke (POS Integration)** | Deep integration with 50+ POS systems |

## 8.4 Integrations

**Delivery Platforms:**
Zomato, Swiggy, Magicpin, Dunzo, Ola Foods, ONDC, Uber Eats, Deliveroo, Talabat, HungerStation, and 15+ more

**POS Systems They Integrate With:**
Petpooja, Restroworks, Posiflex, Oracle MICROS, GoFrugal, Torqus, eZee, and 40+ more

## 8.5 Pricing

| Plan | Price |
|---|---|
| **Basic** | ₹2,000–3,000/month per location |
| **Advanced** | Custom |

## 8.6 Relevance to Atlas

**UrbanPiper is a partner opportunity, not a competitor.** When Atlas launches, it should:
1. Offer native aggregator integration without needing UrbanPiper (competitive)
2. Also offer UrbanPiper integration for restaurants that already use it (partnership)

Restaurants already using UrbanPiper + Petpooja are perfect Atlas migration targets — they pay UrbanPiper + Petpooja separately. Atlas can replace both.

---

# 9. Toast POS — Global Reference

## 9.1 Company Profile

| Field | Data |
|---|---|
| Founded | 2011 |
| Headquarters | Boston, USA |
| Customers | 100,000+ US restaurants |
| Stock | Publicly traded (TOST) |
| Revenue | $1.3B (2023) |
| Market | Primarily USA, limited international |
| G2 Rating | 4.2 / 5 |

## 9.2 Modules

| Module | Features |
|---|---|
| POS | Restaurant billing, table management, order management |
| KDS | Kitchen display system |
| Online Ordering | Toast Online Ordering (direct), third-party aggregators |
| Payroll | Staff payroll and HR |
| Scheduling | Staff scheduling software |
| Reservations | Table reservation management |
| Loyalty | Points and rewards |
| Marketing | Email and SMS campaigns |
| Reporting | 100+ pre-built and custom reports |
| Inventory | Inventory tracking and management |
| Toast Mobile | Mobile POS (handheld) |
| Toast Kiosk | Self-order kiosk |
| Guest Feedback | Post-visit feedback collection |

## 9.3 Pricing

| Plan | Price |
|---|---|
| **Starter Kit** | $0 (hardware costs apply) |
| **Point of Sale** | $69/month |
| **Build Your Own** | Custom |
| **Restaurant Basics** | $110/month |

**Hardware:** Proprietary — must buy Toast hardware
- Toast Flex (POS terminal): $999+
- Toast Go (handheld): $409+
- Toast Kiosk: $999+

**Payment processing:** Toast takes 2.49% + 15 cents per transaction (non-negotiable) — this is a significant cost for high-volume restaurants

## 9.4 Onboarding Process

```
Step 1: Online signup or sales call
Step 2: Select plan + hardware
Step 3: Hardware shipped (2–3 days)
Step 4: Self-setup via Toast's guided setup wizard
Step 5: Optional on-site installation (paid service)
Step 6: 24/7 support via phone/chat
```

**Guided setup wizard** is the Toast UX model that works well — Atlas should replicate this.

## 9.5 Known Weaknesses

1. **US-only (effectively)** — Limited India presence
2. **Proprietary hardware lock-in** — Must use Toast hardware
3. **Payment processing lock-in** — Forced to use Toast Payments
4. **High total cost** — Hardware + software + payment fees add up
5. **Enterprise features complex** — Overwhelming for small operators
6. **Poor internet = poor experience** — Heavily cloud-dependent

## 9.6 Why Toast Is Irrelevant for India Today

- No meaningful India sales/support presence
- Pricing in USD (inaccessible for Indian SMBs)
- Proprietary hardware model doesn't work in India (restaurants use local printers/hardware)
- No Zomato/Swiggy integration
- No UPI/Paytm/Razorpay payment support

**However**, Toast's product quality is the benchmark for what "excellent restaurant software" means. Atlas should study their UX.

---

# 10. Square for Restaurants — Global Reference

## 10.1 Company Profile

| Field | Data |
|---|---|
| Founded | 2009 (restaurants product: 2018) |
| Headquarters | San Francisco, USA |
| Users | 4M+ businesses globally |
| Restaurant Focus | Square for Restaurants (dedicated product) |
| Market | USA, UK, Australia, Canada, Japan |
| India | Not available |

## 10.2 Modules

| Module | Features |
|---|---|
| POS | Fast billing, table management, item modifiers |
| KDS | Kitchen display system |
| Team Management | Staff scheduling, time tracking |
| Online Ordering | Square Online (built-in website + ordering) |
| Invoicing | Send invoices to catering/corporate clients |
| Loyalty | Points and rewards |
| Marketing | Email campaigns, SMS |
| Payroll | US payroll (US only) |
| Analytics | Real-time sales dashboards |

## 10.3 Pricing

| Plan | Price |
|---|---|
| **Free** | $0 (basic POS, limited features) |
| **Plus** | $60/month per location |
| **Premium** | Custom |

**Processing fees:** 2.6% + 10 cents per transaction

## 10.4 What Atlas Learns from Square

1. **Free tier strategy** — Square's free plan is how they get restaurants in the door, then upsell
2. **Simplicity first** — Square is famous for being usable in minutes
3. **Integrated payments** — Payments built in = simpler for merchant
4. **Beautiful reporting** — Square's reports are visually excellent

---

# 11. Full Feature Comparison Matrix

## 11.1 Core POS & Billing

| Feature | Petpooja | Restroworks | eZee BurrP! | GoFrugal | TMBill | Atlas MVP |
|---|---|---|---|---|---|---|
| Table management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| KOT printing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| KDS screen | ✅ (add-on) | ✅ | ✅ | ✅ | ✅ | ✅ (included) |
| Split bill | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bill void with reason | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multi-payment modes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Offline billing | ⚠ Limited | ✅ | ⚠ Weak | ⚠ | ⚠ | ✅ 72 hrs |
| GST-compliant invoice | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| WhatsApp receipt | ✅ (add-on) | ❌ | ❌ | ❌ | ✅ | ✅ (included) |
| Billing speed | Slow peak | Good | Good | Good | Good | < 45 sec target |

## 11.2 Inventory

| Feature | Petpooja | Restroworks | eZee BurrP! | GoFrugal | TMBill | Atlas MVP |
|---|---|---|---|---|---|---|
| Stock tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recipe-based deduction | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GRN entry | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Low-stock alerts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wastage tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Batch/expiry tracking | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ (Phase 2) |
| 3-way match (PO/GRN/inv) | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ (Phase 2) |
| Central kitchen | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ (Phase 2) |

## 11.3 Online Orders & Aggregators

| Feature | Petpooja | Restroworks | eZee BurrP! | GoFrugal | TMBill | Atlas MVP |
|---|---|---|---|---|---|---|
| Zomato integration | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Swiggy integration | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Unified order queue | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Menu sync to aggregators | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ (Phase 2) |
| Auto-accept orders | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| ONDC | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ (Phase 2) |
| Aggregator settlement | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |

## 11.4 Reports & Analytics

| Feature | Petpooja | Restroworks | eZee BurrP! | GoFrugal | TMBill | Atlas MVP |
|---|---|---|---|---|---|---|
| Report count | 80+ | 200+ | 50+ | 70+ | 30+ | 12 core |
| Daily sales summary | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hourly sales | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Discount report | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Void report | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cash reconciliation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| P&L snapshot | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| GSTR-1 export | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Mobile reports | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| WhatsApp nightly summary | ❌ add-on | ❌ | ❌ | ❌ | ❌ | ✅ included |

## 11.5 Customer & Loyalty

| Feature | Petpooja | Restroworks | eZee BurrP! | GoFrugal | TMBill | Atlas MVP |
|---|---|---|---|---|---|---|
| Customer capture | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Visit history | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Loyalty points | ✅ (add-on) | ✅ | ✅ | ✅ | ✅ | ❌ (Phase 2) |
| SMS campaigns | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (Phase 2) |
| WhatsApp campaigns | ✅ (add-on) | ✅ | ❌ | ✅ | ✅ | ❌ (Phase 2) |
| Customer segments | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ (Phase 2) |

## 11.6 Staff & HR

| Feature | Petpooja | Restroworks | eZee BurrP! | GoFrugal | TMBill | Atlas MVP |
|---|---|---|---|---|---|---|
| Staff profiles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Attendance tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leave management | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ (Phase 2) |
| Payroll | ✅ (separate) | ❌ | ✅ | ❌ | ❌ | ❌ (Phase 2) |
| Biometric integration | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ (Phase 2) |

## 11.7 AI & Smart Features

| Feature | Petpooja | Restroworks | eZee BurrP! | GoFrugal | TMBill | Atlas MVP |
|---|---|---|---|---|---|---|
| Demand forecasting | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (Phase 2) |
| AI inventory agent | ✅ (new) | ❌ | ❌ | ❌ | ❌ | ❌ (Phase 2) |
| Void/fraud anomaly alerts | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ included |
| Cash discrepancy alert | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ included |
| WhatsApp command response | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ included |
| Upsell suggestions | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ on order screen |

---

# 12. Onboarding Comparison — How Each Competitor Handles It

## 12.1 Onboarding Time to "First Bill"

| Product | Time to First Bill | Approach |
|---|---|---|
| **DotPe** | < 10 minutes | Self-serve, QR only (not full POS) |
| **Square** | 15–30 minutes | Guided wizard, self-serve |
| **Toast** | 1–3 days | Guided wizard + hardware delivery |
| **Petpooja** | ~1 day | Mostly self-serve, some manual setup |
| **TMBill** | 1–2 days | Demo + manual setup |
| **GoFrugal** | 2–5 days | Onboarding sessions (4–9 hours) |
| **eZee BurrP!** | 2–5 days | Training sessions + documentation |
| **Restroworks** | 2–4 weeks | Sales-led, dedicated onboarding manager |
| **Atlas MVP Target** | **< 30 minutes** | Guided wizard, self-serve |

## 12.2 Petpooja Onboarding — Step by Step

```
1. Go to petpooja.com
2. Click "Start Free" → login with Google/email
3. Add restaurant details (name, address, GSTIN, FSSAI)
4. Add menu categories → items → variations
5. Set up tables (manual, no visual editor in signup flow)
6. Configure GST rates per item
7. Add staff accounts
8. Configure printer (must know IP/port — technical step)
9. Payment (₹10,000/year)
10. Ready to bill
```

**Pain points identified:**
- No guided wizard — user must figure out sequence
- Printer setup requires technical knowledge
- Menu creation is manual and time-consuming
- GST configuration not guided
- No "test bill" prompt at end of setup

## 12.3 Toast Onboarding — Step by Step (Reference for Best Practice)

```
1. signup.toasttab.com → Enter basics
2. Plan selection with side-by-side comparison
3. Hardware selector (recommends based on answers)
4. Hardware ships in 2–3 days
5. Setup wizard walks through:
   - Restaurant info
   - Payment setup
   - Menu creation (import from PDF optional)
   - Table map (drag-and-drop)
   - Staff setup
   - Printer assignment
6. "Test Transaction" prompt — guided first bill
7. "Checklist" view shows completion %
8. Live chat support available at every step
```

**What's great:**
- Progress % shown throughout
- Test transaction prompt
- PDF menu import
- Side-by-side plan comparison

## 12.4 Atlas Onboarding Target Design

Based on DotPe (speed) + Toast (guidance):

```
Phase 1: Quick start (5 min)
  → Enter restaurant name
  → Phone number (OTP verify)
  → Select restaurant type (QSR / Café / Fine Dining / etc.)
  → Done — account is created

Phase 2: First bill setup (15 min)
  Step 1: Add first menu item (one item is enough to start)
  Step 2: Add first table
  Step 3: Configure GST (guided — "Are you GST registered? Yes/No")
  Step 4: Connect printer (optional — can skip, use digital only)
  Step 5: ✅ "You're ready to take your first order!"
           [Take First Order] button

Phase 3: Complete setup (ongoing, not blocking)
  → Add full menu (can import via Excel)
  → Add staff
  → Connect Zomato/Swiggy
  → Set up WhatsApp notifications
  → Each step has completion badge

Progress bar visible throughout.
WhatsApp support button on every screen.
```

**Target: First bill in < 15 minutes. Complete setup in < 45 minutes.**

---

# 13. Pricing Comparison

## 13.1 Price Per Month (What Restaurant Actually Pays)

| Product | Entry Price | Includes | Hidden Costs |
|---|---|---|---|
| **Atlas** | ₹0 (free tier) | Billing, 50 bills/day | None |
| **Atlas Starter** | ₹499/month | All MVP features | None |
| **Petpooja Core** | ₹833/month | Core POS, 100+ reports | KDS, loyalty, WhatsApp are extra |
| **Petpooja Growth** | ₹950/month | Core + marketplace | Many add-ons |
| **TMBill Billing** | ₹500/month | Billing + KOT only | Third-party integrations extra |
| **TMBill Standard** | ₹750/month | All features | Limited support |
| **GoFrugal Starter** | ₹750/month | POS + accounting | Advanced features extra |
| **eZee BurrP!** | ₹575 one-time/user | Full feature set | Per-user model |
| **Restroworks** | ₹1,250+/month | Enterprise features | Hardware, training extra |
| **DotPe** | ₹0 | QR menu only | Not a full POS |
| **Toast** | ₹5,750/month (~$69) | POS | Hardware $999+, 2.49% fees |
| **Square** | ₹0 | Basic POS | 2.6% transaction fee |

## 13.2 Total Annual Cost for a Typical 1-Outlet Restaurant

| Product | Software/Year | Hardware | Support | Year 1 Total |
|---|---|---|---|---|
| **Atlas** | ₹5,988 (₹499/month) | Uses any printer | WhatsApp | ₹6,000–8,000 |
| **Petpooja** | ₹10,000 | Any printer | Included | ₹10,000–15,000 |
| **TMBill Standard** | ₹8,999 | Any printer | Inconsistent | ₹9,000–12,000 |
| **GoFrugal** | ₹8,999+ | Any printer | 4–9 hrs only | ₹9,000–15,000 |
| **Restroworks** | ₹15,000+ | Any device | Dedicated | ₹15,000–25,000 |
| **Toast** | ₹69,000 | ₹80,000 hardware | Good | ₹1,50,000+ |

**Atlas is 40–60% cheaper than Petpooja with more features included.**

---

# 14. UI/UX Comparison

## 14.1 Design Quality Assessment

| Product | UI Quality | Mobile UX | Speed | Learning Curve |
|---|---|---|---|---|
| **Toast** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Fast | Low |
| **Square** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Fast | Very Low |
| **Restroworks** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Good | Medium |
| **Petpooja** | ⭐⭐⭐ | ⭐⭐⭐ | Slow peak | Medium |
| **eZee BurrP!** | ⭐⭐⭐ | ⭐⭐ | Good | High |
| **GoFrugal** | ⭐⭐ | ⭐⭐ | Good | Very High |
| **TMBill** | ⭐⭐⭐ | ⭐⭐⭐ | Good | High |
| **DotPe** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Fast | Very Low |
| **Atlas Target** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | < 1.5s | Low |

## 14.2 Common UI Complaints Across All Competitors

From user reviews across Capterra, G2, SoftwareSuggest:

1. **Slow during peak hours** — Petpooja, TMBill
2. **Complex navigation** — GoFrugal, eZee BurrP!
3. **Non-intuitive order-taking screen** — Petpooja (multiple reviews say "not user friendly")
4. **Too many clicks** to complete common tasks
5. **Reports not visual** enough — all except Toast/Square
6. **Mobile app inferior** to desktop — Petpooja, eZee BurrP!
7. **Printer setup complex** — all products

**Atlas UI Priority:** Every screen must be usable by a non-technical 19-year-old without training.

---

# 15. Support Quality Comparison

| Product | Support Channels | Response Time | Quality |
|---|---|---|---|
| **Petpooja** | 24/7 phone, chat, WhatsApp | Fast initially, slow during expansion | ⭐⭐⭐⭐ |
| **Restroworks** | 24/7 phone, chat, email | Good, dedicated manager | ⭐⭐⭐⭐ |
| **eZee BurrP!** | 24/7 phone, chat | Fast, highly praised | ⭐⭐⭐⭐⭐ |
| **GoFrugal** | Chat, email, phone | Slow, "not hands-on" | ⭐⭐ |
| **TMBill** | WhatsApp, callback | Inconsistent — polarized reviews | ⭐⭐ |
| **Toast** | 24/7 phone, chat | Good in USA, poor elsewhere | ⭐⭐⭐⭐ |
| **Square** | Chat, email (no phone basic) | Acceptable | ⭐⭐⭐ |
| **Atlas Target** | WhatsApp first + in-app chat | < 2 min WhatsApp, 24x7 | ⭐⭐⭐⭐⭐ |

**Atlas Support Model:** WhatsApp-first (not a call center). Restaurant owners are on WhatsApp all day. Support via the same app they use for everything else.

---

# 16. Strategic Gaps Atlas Can Exploit

## Gap 1: No Competitor Does WhatsApp-Native Owner Experience

All competitors offer dashboards. None offer a WhatsApp-native daily operating summary that owners can interact with via replies. This is **Atlas's single biggest differentiator for launch**.

Every restaurant owner in India uses WhatsApp. Zero training needed. Zero app to download. Just a message they already know how to use.

## Gap 2: Opaque Pricing Everywhere

Petpooja, Restroworks, GoFrugal — none show pricing on their website. All require a sales call. This is friction for small restaurant owners who want to make a fast decision.

**Atlas**: Full pricing page, no sales call needed, start for free, upgrade with a credit card.

## Gap 3: Billing Speed Is Universally Complained About

"Slow during peak hours" — mentioned for Petpooja, TMBill, and others. In a restaurant, slow billing = angry customers, longer queues, missed tips.

**Atlas guarantee:** Every screen under 1.5 seconds. Billing under 45 seconds.

## Gap 4: No Competitor Has a Great Onboarding Experience

eZee BurrP! has training sessions. GoFrugal has 4–9 hours of onboarding. Petpooja is mostly figure-it-out-yourself. None have a guided wizard with progress bar, test transaction, and instant support.

**Atlas**: Guided wizard inspired by Toast + DotPe. First bill in 15 minutes. First complete setup in < 45 minutes.

## Gap 5: Fraud/Cash Anomaly Alerts Are Not Standard

Not a single competitor offers real-time cash discrepancy or void anomaly alerts to the owner's WhatsApp. This is a massive gap. Restaurant owners lose ₹3,000–15,000/month to undetected fraud.

**Atlas**: Instant anomaly alert to owner's WhatsApp. Zero configuration needed.

## Gap 6: KDS Is an Add-On, Not Included

Petpooja charges extra for KDS. Most competitors treat it as an upgrade.

**Atlas**: KDS included in Starter plan. Any Android tablet is a KDS. No additional cost.

## Gap 7: India-Specific Restaurant Types Are Ignored

Petpooja, GoFrugal, and others focus on standard QSR/café/fine-dining. None have optimized workflows for India-specific formats: Dhaba, Mess, Juice Center, Sweet Shop (Mithai), Tea Stall.

**Atlas**: First-class support for Indian restaurant types from day one.

---

# 17. Atlas Positioning vs. Each Competitor

| Competitor | Atlas Message |
|---|---|
| **Petpooja** | "Everything Petpooja does, faster, cheaper, and with WhatsApp built in." |
| **Restroworks** | "Restroworks is for chains. Atlas is built for you — the single outlet owner who wants enterprise power at a fair price." |
| **GoFrugal** | "GoFrugal takes weeks to set up. Atlas takes 30 minutes." |
| **TMBill** | "Same price as TMBill. Twice the support. Owner WhatsApp alerts included." |
| **eZee BurrP!** | "eZee was built for hotels. Atlas was built for restaurants." |
| **DotPe** | "DotPe gives you a QR menu. Atlas gives you your entire business." |

---

# 18. Key Takeaways for Atlas Product Team

1. **Build billing obsessively.** Every competitor has weak points here. This is where Atlas wins or loses.

2. **Make onboarding a product, not an afterthought.** First restaurant should be live in 15 minutes. Track this as a KPI from day 1.

3. **Launch WhatsApp nightly summary on day 1.** Not Phase 2. Day 1. This is the single feature that no competitor has and every owner will talk about.

4. **Show pricing on the website.** This alone will generate 3x the inbound vs. competitors.

5. **Include KDS in the base plan.** Don't charge extra for it. Market it as "free KDS with every plan."

6. **Target Petpooja users specifically.** They're unhappy about speed and hidden costs. They already know what a POS is. Easy migration win.

7. **Apply for Zomato and Swiggy API partner status immediately.** This takes 4–8 weeks approval time. Cannot launch MVP without it.

8. **Study Toast's UX.** Their order screen, table management, and guided setup are the best in the world. Atlas should be the "Toast of India."

---

# Related Documents

- MVP-001 — MVP Scope and Definition
- BRD-001 — Business Requirements Document
- DOM-101 — Restaurant Industry Overview
- ARCH-001 — System Architecture

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial Research Document |

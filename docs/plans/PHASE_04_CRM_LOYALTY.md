# Phase 4 — CRM & Loyalty
**Priority:** 🟠 High | **Estimate:** 3 weeks | **Depends on:** —

---

## 1. Overview

Transform Atlas's basic customer list into a full CRM + Loyalty engine. Features: loyalty points system, wallet, customer segmentation, birthday automation, offer campaigns, customer feedback, SMS/WhatsApp communication, purchase history analytics, and a customer-facing loyalty portal.

---

## 2. Current State vs Target State

| Feature | Current | Target |
|---------|---------|--------|
| Customer CRUD | ✅ Basic | Enhanced |
| Customer search | ✅ | ✅ |
| Customer history | ❌ | ✅ |
| Loyalty points | ❌ | ✅ |
| Points redemption | ✅ Basic (billing) | Full engine |
| Wallet | ❌ | ✅ |
| Birthday campaigns | ❌ | ✅ |
| Customer segments | ❌ | ✅ |
| Offers & campaigns | ❌ | ✅ |
| Feedback system | ❌ | ✅ |
| SMS integration | ❌ | ✅ |
| WhatsApp messages | ❌ | ✅ |
| Customer portal (QR) | ❌ | ✅ |
| Referral system | ❌ | ✅ |

---

## 3. Feature Breakdown

### 3.1 Loyalty Points Engine

Full earn/burn rules for loyalty points.

**Earning Rules (configurable per outlet):**
- X points per ₹Y spent (e.g. 1 point per ₹10)
- Bonus points for specific items
- Bonus points on birthday
- Double points during promotional period
- No points on discounted items (configurable)

**Burning Rules:**
- Z rupees = 1 point (e.g. 100 points = ₹10)
- Minimum bill amount to redeem
- Maximum redemption per visit (e.g. max 20% of bill)
- Expiry: points expire after N months of inactivity

**DB Changes:**
```prisma
model LoyaltyTransaction {
  id             String          @id @default(cuid())
  tenantId       String
  customerId     String
  type           LoyaltyTxType   // EARN | BURN | EXPIRE | ADJUST
  points         Int             // positive = earned, negative = burned/expired
  billId         String?
  description    String
  expiresAt      DateTime?
  createdAt      DateTime        @default(now())
  customer       Customer        @relation(...)

  @@index([tenantId, customerId])
}

enum LoyaltyTxType {
  EARN
  BURN
  EXPIRE
  BONUS
  ADJUST
  REFERRAL
}

model Customer {
  // existing ...
  loyaltyPoints    Int      @default(0)
  loyaltyTier      String?  // BRONZE | SILVER | GOLD | PLATINUM
  lastVisitAt      DateTime?
  totalVisits      Int      @default(0)
  totalSpentInPaise Int     @default(0)
  referralCode     String?  @unique
  referredBy       String?  // customerId
}

// Loyalty program settings (stored in tenant settings JSON or new model)
model LoyaltyProgram {
  id                   String  @id @default(cuid())
  tenantId             String  @unique
  isEnabled            Boolean @default(false)
  earnRate             Int     @default(1)   // points per rupee
  earnPerRupees        Int     @default(10)  // earn 1 point per ₹10
  burnRate             Int     @default(100) // 100 points = ₹1
  minBurnPoints        Int     @default(100)
  maxBurnPct           Int     @default(20)  // max 20% of bill
  pointExpiry          Int     @default(365) // days
  birthdayBonusPct     Int     @default(200) // 2x on birthday
  tierBronzeMin        Int     @default(0)
  tierSilverMin        Int     @default(1000)
  tierGoldMin          Int     @default(5000)
  tierPlatinumMin      Int     @default(20000)

  @@index([tenantId])
}
```

**API:**
- `GET /api/v1/loyalty/program` — get program settings
- `PATCH /api/v1/loyalty/program` — update settings (OWNER only)
- `GET /api/v1/customers/:id/loyalty` — customer loyalty balance + tier + history
- `POST /api/v1/loyalty/earn` — manually add points (MANAGER)
- `POST /api/v1/loyalty/adjust` — admin adjustment (OWNER)

**Automatic Earning:**
- On bill payment completed → calculate points → create LoyaltyTransaction
- On birthday (cron job) → add bonus points

---

### 3.2 Wallet System

Pre-paid wallet that customers load and spend.

**Use Cases:**
- Corporate accounts load ₹5,000 for employee meals
- Customer gets ₹100 voucher on first visit
- Refunds deposited to wallet instead of cash

**DB Changes:**
```prisma
model WalletTransaction {
  id           String          @id @default(cuid())
  tenantId     String
  customerId   String
  type         WalletTxType    // CREDIT | DEBIT | REFUND
  amountInPaise Int
  billId       String?
  description  String
  balanceBefore Int
  balanceAfter  Int
  createdBy    String
  createdAt    DateTime        @default(now())
  customer     Customer        @relation(...)

  @@index([tenantId, customerId])
}

enum WalletTxType {
  CREDIT      // load money
  DEBIT       // use wallet for payment
  REFUND      // refund into wallet
  ADJUSTMENT  // manual correction
}

model Customer {
  // existing ...
  walletBalanceInPaise Int     @default(0)
}
```

**API:**
- `POST /api/v1/customers/:id/wallet/credit` — load wallet (MANAGER, OWNER)
- `POST /api/v1/customers/:id/wallet/debit` — used automatically during bill payment
- `GET /api/v1/customers/:id/wallet` — balance + transactions

**Frontend:**
- Wallet balance shown on customer profile
- "Load Wallet" button (MANAGER, OWNER)
- Wallet payment option in billing modal

---

### 3.3 Customer Segments

Group customers by behavior for targeted campaigns.

**System Segments (auto-calculated):**
- NEW — first visit in last 30 days
- REGULAR — visited 3+ times in last 60 days
- VIP — total spend > ₹10,000
- AT_RISK — visited before but not in 60+ days
- LOST — no visit in 90+ days
- BIRTHDAY_WEEK — birthday within 7 days

**Custom Segments (manual):**
- Tags applied to customers
- Filter by: spend range, visit count, last visit date, tier

**DB Changes:**
```prisma
model CustomerTag {
  id         String   @id @default(cuid())
  tenantId   String
  customerId String
  tag        String
  createdBy  String
  createdAt  DateTime @default(now())

  @@unique([tenantId, customerId, tag])
  @@index([tenantId])
}
```

**API:**
- `GET /api/v1/customers/segments` — counts per segment
- `GET /api/v1/customers?segment=VIP` — filter by segment
- `POST /api/v1/customers/:id/tags` — add tag
- `DELETE /api/v1/customers/:id/tags/:tag` — remove tag

---

### 3.4 Birthday Automation

Automatic birthday rewards and greetings.

**Flow:**
1. Daily cron job at 8 AM
2. Find customers with birthday today
3. Send WhatsApp/SMS: "Happy Birthday [Name]! Enjoy 10% off today."
4. Add bonus loyalty points
5. Create special offer valid for 24 hours

**Configuration (in LoyaltyProgram):**
- Birthday discount %
- Birthday bonus points
- Message template
- Send via: WhatsApp | SMS | Both

**Implementation:**
- Cron: `POST /api/v1/internal/birthday-rewards` (CRON_SECRET header)
- Uses MSG91 for SMS, WhatsApp Business API for WhatsApp

---

### 3.5 Campaign Engine

Create and send targeted promotions to customer segments.

**Campaign Types:**
- SMS/WhatsApp blast to a segment
- Push notification (future)
- Offer: discount code, free item, double points

**Campaign Workflow:**
1. MANAGER creates campaign: name, target segment, message, offer, schedule
2. Preview: estimated recipients
3. Schedule: send now or at future date/time
4. System sends messages via MSG91 / WhatsApp
5. Track: sent, delivered, opened (for WhatsApp)

**DB Changes:**
```prisma
model Campaign {
  id            String         @id @default(cuid())
  tenantId      String
  name          String
  segment       String         // segment name or "ALL"
  tagFilter     String?
  messageText   String
  channel       String[]       // SMS | WHATSAPP
  couponId      String?        // optional offer
  scheduledAt   DateTime?
  sentAt        DateTime?
  status        CampaignStatus @default(DRAFT)
  recipientCount Int           @default(0)
  sentCount     Int            @default(0)
  createdBy     String
  createdAt     DateTime       @default(now())

  @@index([tenantId])
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  FAILED
}
```

**API:**
- `GET /api/v1/campaigns` — list
- `POST /api/v1/campaigns` — create
- `PATCH /api/v1/campaigns/:id` — update
- `POST /api/v1/campaigns/:id/send` — trigger send (OWNER, MANAGER)
- `GET /api/v1/campaigns/:id/stats` — delivery stats

---

### 3.6 Feedback System

Post-meal feedback collection via QR or SMS link.

**Feedback Form (simple):**
- Overall rating: 1–5 stars
- Category ratings: Food, Service, Ambience, Value
- Comments (optional)
- Would you recommend? (Yes/No)

**Collection Methods:**
- QR code on bill receipt → opens feedback form
- WhatsApp message sent after bill payment with link
- Tablet at exit (kiosk mode)

**DB Changes:**
```prisma
model CustomerFeedback {
  id                String   @id @default(cuid())
  tenantId          String
  customerId        String?
  billId            String?
  tableId           String?
  overallRating     Int      // 1–5
  foodRating        Int?
  serviceRating     Int?
  ambienceRating    Float?
  valueRating       Int?
  comments          String?
  wouldRecommend    Boolean?
  source            String   // QR | WHATSAPP | KIOSK
  submittedAt       DateTime @default(now())

  @@index([tenantId])
}
```

**API:**
- `POST /api/v1/public/feedback` — public endpoint for form submission
- `GET /api/v1/feedback` — list all feedback (OWNER, MANAGER)
- `GET /api/v1/feedback/summary` — avg ratings per category

**Frontend:**
- `/feedback/[tenantId]` — public feedback form
- `/feedback` — management view with ratings, trends, comments

---

### 3.7 Customer Profile Page (Enhanced)

Full 360° view of each customer.

**Sections:**
1. **Personal** — name, phone, email, birthday, tags
2. **Loyalty** — tier, points balance, transaction history
3. **Wallet** — balance, load/debit history
4. **Order History** — all past orders with dates, amounts
5. **Feedback** — their submitted feedback
6. **Campaigns** — messages sent to them

**API:**
- `GET /api/v1/customers/:id/timeline` — all activity in chronological order

---

### 3.8 Referral System

Customers get points for referring new customers.

**Flow:**
1. Customer has unique referral code (auto-generated)
2. Share code with friend
3. Friend uses code at first visit (cashier enters it)
4. Both get bonus points (configurable amounts)

**DB Changes:**
- `Customer.referralCode` (already added above)
- `Customer.referredBy` (already added above)
- `LoyaltyTransaction` with type `REFERRAL`

---

## 4. Role Permissions

| Feature | OWNER | MANAGER | CASHIER | WAITER | CHEF |
|---------|-------|---------|---------|--------|------|
| View customer list | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit customer | ✅ | ✅ | ✅ | ❌ | ❌ |
| Load wallet | ✅ | ✅ | ❌ | ❌ | ❌ |
| Add loyalty manually | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create campaign | ✅ | ✅ | ❌ | ❌ | ❌ |
| Send campaign | ✅ | ✅ | ❌ | ❌ | ❌ |
| View feedback | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage loyalty program | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Business Rules

1. Points earned = floor(billAmount / earnPerRupees) * earnRate
2. Points cannot be burned on bills where discount already applied (unless `allowStackBurnWithDiscount: true`)
3. Wallet balance can never go negative
4. Birthday bonus triggers once per year per customer
5. Campaign sending rate: max 100 SMS per minute (MSG91 rate limit)
6. Feedback link expires 24 hours after bill close
7. Customer with no phone number cannot receive SMS/WhatsApp
8. Loyalty points expire only if no transaction in `pointExpiry` days (rolling expiry)

---

## 6. QA Checklist

- [ ] Earn points: bill ₹500 at 1 pt/₹10 → 50 points added
- [ ] Burn points: redeem 100 pts = ₹1 off bill
- [ ] Birthday trigger: customer with today's birthday gets bonus points + message
- [ ] Wallet load ₹500 → balance shows ₹500 → use in billing → balance decreases
- [ ] Campaign: create → preview recipient count → send → sentCount updated
- [ ] Feedback QR link opens form → submit → appears in management dashboard
- [ ] Tier upgrade: customer crosses Silver threshold → tier updated
- [ ] Referral: friend uses code → both get points
- [ ] Segment NEW: only customers with first visit in last 30 days included
- [ ] CASHIER cannot create campaign → 403

---

## 7. API Routes Summary

```
GET    /api/v1/loyalty/program
PATCH  /api/v1/loyalty/program
GET    /api/v1/customers/:id/loyalty
POST   /api/v1/loyalty/earn
POST   /api/v1/loyalty/adjust
GET    /api/v1/customers/:id/wallet
POST   /api/v1/customers/:id/wallet/credit

GET    /api/v1/customers/segments
GET    /api/v1/customers/:id/timeline
POST   /api/v1/customers/:id/tags
DELETE /api/v1/customers/:id/tags/:tag

GET    /api/v1/campaigns
POST   /api/v1/campaigns
PATCH  /api/v1/campaigns/:id
POST   /api/v1/campaigns/:id/send
GET    /api/v1/campaigns/:id/stats

GET    /api/v1/feedback
GET    /api/v1/feedback/summary
POST   /api/v1/public/feedback
```

---

## 8. Definition of Done

- [ ] Points earned on every bill payment
- [ ] Points redeemed in billing modal
- [ ] Wallet loads and debits correctly
- [ ] Birthday cron sends messages
- [ ] Campaign sent to correct segment
- [ ] Feedback submitted via public link appears in dashboard
- [ ] Customer profile shows full timeline
- [ ] All QA items pass

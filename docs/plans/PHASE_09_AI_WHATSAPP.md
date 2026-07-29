# Phase 9 — AI & WhatsApp
**Priority:** 🟢 Later | **Estimate:** 4 weeks | **Depends on:** Phases 5, 8

---

## 1. Overview

Differentiate Atlas from Petpooja through AI-powered insights and WhatsApp-first management. Features: AI business advisor (chat interface), sales forecasting, smart reorder, menu optimization recommendations, WhatsApp Business API integration for bills/reports/campaigns, and automated WhatsApp workflows.

---

## 2. Features

### 2.1 WhatsApp Business API Integration

**Use Cases:**
- Send digital bill to customer's WhatsApp after payment
- Day-end report auto-sent to owner's WhatsApp every night
- Birthday offer sent via WhatsApp (Phase 4)
- Campaign blasts via WhatsApp (Phase 4)
- Low-stock alert to owner/manager via WhatsApp
- Customer feedback link via WhatsApp

**Implementation:**
- Provider: Meta WhatsApp Business API or MSG91 WhatsApp
- Requires: WABA account approval, template approval from Meta
- Template types: BILL, DAY_END_REPORT, LOW_STOCK, BIRTHDAY, CAMPAIGN

```prisma
model WhatsAppConfig {
  id           String   @id @default(cuid())
  tenantId     String   @unique
  phoneNumberId String
  accessToken  String   // encrypted
  isEnabled    Boolean  @default(false)
  ownerPhone   String?  // manager/owner WhatsApp number for reports
}

model WhatsAppLog {
  id         String   @id @default(cuid())
  tenantId   String
  to         String   // phone number
  template   String
  status     String   // SENT | DELIVERED | READ | FAILED
  messageId  String?  // WhatsApp message ID
  sentAt     DateTime @default(now())

  @@index([tenantId])
}
```

**API:**
- `GET/PATCH /api/v1/whatsapp/config` — configure
- `POST /api/v1/whatsapp/send-bill/:billId` — send bill to customer
- `POST /api/v1/whatsapp/send-report` — send day-end to owner

---

### 2.2 AI Business Advisor

A chat interface where the OWNER can ask questions about their business in natural language.

**Example queries:**
- "What was my best selling item last week?"
- "Which staff gave the most discounts this month?"
- "How much inventory should I order for the weekend?"
- "Why did revenue drop on Tuesday?"
- "Which items have the worst margin?"

**Implementation:**
- Model: Claude claude-haiku-4-5-20251001 (fast, cheap for structured queries)
- System prompt includes: tenant context, recent sales data (last 30 days summary)
- User query → Claude generates SQL-like intent → Atlas executes query → Claude formats response

**Architecture:**
```
User Query
    ↓
Claude (intent extraction + context)
    ↓
Atlas Query Engine (pre-built report functions)
    ↓
Data fetched from DB
    ↓
Claude (natural language response generation)
    ↓
Response to user
```

**DB Changes:**
```prisma
model AIConversation {
  id        String   @id @default(cuid())
  tenantId  String
  userId    String
  messages  Json     // array of {role, content, timestamp}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId, userId])
}
```

**API:**
- `POST /api/v1/ai/chat` — send message, get response (streaming)
- `GET /api/v1/ai/conversations` — history

**Frontend:**
- `/advisor` page — chat interface
- Pre-built quick questions as chips
- Streaming response display
- Charts auto-generated when numerical data returned

---

### 2.3 Sales Forecasting

Predict tomorrow's/next week's revenue based on historical patterns.

**Model:**
- Last 90 days of daily revenue data
- Day-of-week patterns (weekends higher)
- Holiday adjustments
- Simple: 7-day rolling average × day-of-week factor

**Displayed on dashboard:**
- "Expected revenue tomorrow: ₹18,500–₹21,000"
- "This weekend is projected to be 23% above last weekend"

**Implementation:**
- Backend: calculate on-demand or nightly cron
- No external AI needed — pure statistical calculation
- Phase 9 enhancement: use Claude to explain the forecast

---

### 2.4 Smart Reorder Suggestions

Based on consumption patterns, suggest optimal purchase quantities.

**Logic:**
- Avg daily consumption per item (last 30 days)
- Days until reorder point reached
- Suggested order = (daily_avg × lead_time_days + safety_stock)

**Displayed on inventory page:**
- "Order 20 KG flour in 3 days based on current consumption"
- Generates draft PO automatically

**API:**
- `GET /api/v1/ai/reorder-suggestions` — returns suggested quantities per item

---

### 2.5 Menu Optimization

AI-powered analysis of which items to promote, reprice, or remove.

**Insights:**
- "Paneer Tikka has 85% margin but only 12 orders/week — promote it more"
- "Veg Biryani is your #1 item but has only 35% margin — consider repricing"
- "Dragon Rolls have had 0 orders in 30 days — remove from menu?"

**Implementation:**
- Uses menu engineering data (Phase 5)
- Claude generates plain-English recommendations from the quadrant data
- Shows 5 actionable recommendations on menu page

---

### 2.6 Automated WhatsApp Workflows

Trigger-based WhatsApp messages without manual action.

| Trigger | Message | Recipient |
|---------|---------|-----------|
| Bill paid | Digital bill | Customer |
| Day end | Summary report | Owner |
| Low stock | Alert | Manager |
| Birthday | Offer message | Customer |
| No visit 30 days | "We miss you" offer | Customer |
| New QR order | "You have a new order" | Staff (duty phone) |

**Configuration:**
- Each workflow has ON/OFF toggle
- Custom message template editing

---

## 3. Role Permissions

| Feature | OWNER | MANAGER | CASHIER |
|---------|-------|---------|---------|
| AI Advisor | ✅ | ✅ | ❌ |
| WhatsApp config | ✅ | ❌ | ❌ |
| View AI forecasts | ✅ | ✅ | ❌ |
| Send bill to WhatsApp | ✅ | ✅ | ✅ |

---

## 4. Business Rules

1. AI chat does not have internet access — only Atlas DB context
2. WhatsApp messages require approved templates (Meta approval takes 1–3 days)
3. Customer WhatsApp opt-in required for marketing messages (not transactional)
4. AI forecast disclaimer: "Based on historical patterns; not a guarantee"
5. Reorder suggestions are advisory, not automatic orders

---

## 5. QA Checklist

- [ ] AI chat: ask "best item last week" → correct item returned
- [ ] Bill WhatsApp: paid bill → customer receives message within 30 seconds
- [ ] Day-end WhatsApp: triggered at close → owner receives summary
- [ ] Sales forecast: shown on dashboard with reasonable range
- [ ] Reorder suggestion: item below reorder point appears in suggestions
- [ ] Menu optimization: items in "Dog" quadrant flagged for removal

---

## 6. Definition of Done

- [ ] WhatsApp bill delivery working end-to-end
- [ ] AI advisor responds to 10 common business questions correctly
- [ ] Sales forecast shown on dashboard
- [ ] Smart reorder suggestions accurate to within 15% of actual need
- [ ] All QA items pass

---

## Atlas vs Petpooja — Differentiation Summary

| Area | Petpooja | Atlas Advantage |
|------|----------|----------------|
| AI Advisor | None | ✅ Natural language business queries |
| WhatsApp Reports | Basic | ✅ Full automated workflow |
| Sales Forecasting | None | ✅ Built-in |
| Menu Optimization AI | None | ✅ AI-powered recommendations |
| UI/UX | Dated, dense | ✅ Modern, clean, fast |
| Mobile Captain App | Separate download | ✅ PWA, no install needed |
| QR Ordering | Add-on paid | ✅ Built-in |
| Real-time Updates | Polling | ✅ WebSocket/SSE |
| Offline Support | Limited | ✅ Service worker queue |
| Setup Time | Days | ✅ Minutes |

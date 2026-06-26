# API-001 — API Specifications

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| Document ID    | API-001                                 |
| Title          | RestaurantOS — API Specifications       |
| Version        | 1.0.0                                   |
| Status         | Draft                                   |
| Category       | API Design                              |
| Author         | Vraj Prajapati                          |
| Classification | Confidential — Internal Use Only        |
| Last Updated   | 2026-06-25                              |

---

# 1. API Design Principles

1. **RESTful** — Resources are nouns, HTTP verbs define actions
2. **Consistent** — Same patterns across all 600+ endpoints
3. **Versioned** — Breaking changes never affect existing clients
4. **Secure by default** — Every endpoint requires authentication unless explicitly public
5. **Predictable errors** — Every error uses the same structure with actionable messages
6. **Pagination always** — No endpoint returns unbounded lists

---

# 2. API Standards

## 2.1 Base URL Structure

```
Production:  https://api.restaurantos.in/v1
Staging:     https://api-staging.restaurantos.in/v1
```

## 2.2 Versioning

- URL versioning: `/v1/`, `/v2/`
- `v1` is stable; no breaking changes
- New major versions announced 6 months in advance
- Old versions supported for 12 months after deprecation announcement

## 2.3 Authentication

All requests must include:
```
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_uuid>
X-Outlet-ID: <outlet_uuid>     (required for outlet-scoped operations)
```

## 2.4 Request Format

```
Content-Type:  application/json
Accept:        application/json
X-Request-ID:  <uuid>           (idempotency key for mutations)
```

## 2.5 Standard Response Envelope

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-06-25T21:45:00Z"
  }
}
```

**List Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 25,
    "total": 150,
    "total_pages": 6,
    "has_next": true,
    "has_prev": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "BILL_ALREADY_PAID",
    "message": "This bill has already been paid and cannot be modified.",
    "detail": "Bill INV-2026-08234 was paid at 2026-06-25T20:30:00Z",
    "field": null,
    "docs_url": "https://docs.restaurantos.in/errors/BILL_ALREADY_PAID"
  },
  "request_id": "uuid"
}
```

## 2.6 HTTP Status Codes

| Code | Meaning | When Used |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST that creates resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource state conflict (bill already paid) |
| 422 | Unprocessable | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected server-side error |

## 2.7 Pagination

```
Query params: ?page=1&per_page=25&sort=created_at&order=desc
Defaults:     page=1, per_page=25, max per_page=100
```

## 2.8 Filtering

```
?status=paid
?status[]=paid&status[]=void
?created_after=2026-06-01T00:00:00Z
?created_before=2026-06-30T23:59:59Z
?search=butter+chicken
```

## 2.9 Rate Limits

| Client Type | Limit | Window |
|---|---|---|
| Standard tenant | 1,000 req/min | Per API key |
| High-volume tenant | 5,000 req/min | Per API key |
| Auth endpoints | 10 req/min | Per IP |
| OTP endpoints | 5 req/min | Per phone number |

Rate limit headers returned on all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 842
X-RateLimit-Reset: 1719346800
```

---

# 3. API Endpoint Catalog

## 3.1 Authentication API

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/login` | Email + password login | None |
| POST | `/auth/login/otp/request` | Request SMS OTP | None |
| POST | `/auth/login/otp/verify` | Verify OTP, receive token | None |
| POST | `/auth/refresh` | Refresh access token | Refresh token |
| POST | `/auth/logout` | Invalidate session | Bearer |
| POST | `/auth/logout/all` | Invalidate all sessions | Bearer |
| GET  | `/auth/sessions` | List active sessions | Bearer |
| DELETE | `/auth/sessions/:id` | Revoke a session | Bearer |
| POST | `/auth/password/reset/request` | Request password reset | None |
| POST | `/auth/password/reset/confirm` | Confirm reset with token | None |
| POST | `/auth/password/change` | Change own password | Bearer |
| POST | `/auth/2fa/setup` | Set up 2FA | Bearer |
| POST | `/auth/2fa/verify` | Verify 2FA code | Bearer |
| DELETE | `/auth/2fa` | Disable 2FA | Bearer |

---

## 3.2 Order API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Create new order |
| GET | `/orders` | List orders (with filters) |
| GET | `/orders/:id` | Get order details |
| PATCH | `/orders/:id` | Update order (status, notes) |
| DELETE | `/orders/:id` | Cancel order |
| POST | `/orders/:id/items` | Add item to order |
| PUT | `/orders/:id/items/:item_id` | Update item (qty, modifiers) |
| DELETE | `/orders/:id/items/:item_id` | Remove item from order |
| POST | `/orders/:id/kots` | Submit KOT to kitchen |
| GET | `/orders/:id/kots` | List KOTs for order |
| POST | `/orders/:id/hold` | Hold order |
| POST | `/orders/:id/resume` | Resume held order |
| POST | `/orders/:id/transfer` | Transfer to another table |

**POST /orders — Request:**
```json
{
  "channel": "dine_in",
  "table_id": "uuid",
  "cover_count": 4,
  "customer_id": "uuid",
  "waiter_id": "uuid",
  "items": [
    {
      "menu_item_id": "uuid",
      "variant_id": "uuid",
      "quantity": 2,
      "modifiers": [
        { "modifier_id": "uuid" }
      ],
      "instructions": "Extra spicy, no onion"
    }
  ]
}
```

---

## 3.3 Billing API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/bills` | Generate bill from order |
| GET | `/bills` | List bills |
| GET | `/bills/:id` | Get bill details |
| POST | `/bills/:id/discounts` | Apply discount to bill |
| DELETE | `/bills/:id/discounts/:discount_id` | Remove discount |
| POST | `/bills/:id/payments` | Record payment |
| POST | `/bills/:id/split` | Split bill |
| POST | `/bills/:id/void` | Void bill |
| POST | `/bills/:id/refund` | Process refund |
| POST | `/bills/:id/print` | Trigger print |
| POST | `/bills/:id/send/whatsapp` | Send WhatsApp receipt |
| POST | `/bills/:id/send/email` | Send email receipt |
| GET | `/bills/:id/receipt` | Get receipt PDF |
| GET | `/bills/:id/gst-invoice` | Get GST invoice PDF |

**POST /bills — Request:**
```json
{
  "order_id": "uuid",
  "customer_id": "uuid",
  "customer_gstin": "29ABCDE1234F1Z5"
}
```

**POST /bills/:id/payments — Request:**
```json
{
  "payments": [
    {
      "mode": "cash",
      "amount": 600,
      "tendered": 700
    },
    {
      "mode": "upi",
      "amount": 600,
      "reference": "UPI_TXN_ID_123"
    }
  ]
}
```

---

## 3.4 Kitchen (KDS) API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/kds/tickets` | Get active KOTs for kitchen section |
| GET | `/kds/tickets/:id` | Get KOT detail |
| PATCH | `/kds/tickets/:id/items/:item_id` | Update item status |
| POST | `/kds/tickets/:id/complete` | Mark KOT as complete (bump) |
| POST | `/kds/tickets/:id/recall` | Recall completed ticket |
| POST | `/kds/tickets/:id/priority` | Set ticket as priority |
| GET | `/kds/performance` | Kitchen performance metrics |

**WebSocket: Kitchen Real-Time Channel**
```
ws://api.restaurantos.in/v1/kds/ws

Events:
  → new_kot: New KOT arrived
  → kot_updated: KOT status changed
  → kot_cancelled: KOT cancelled
  → item_86: Item out of stock
```

---

## 3.5 Table Management API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tables` | List all tables with current status |
| GET | `/tables/:id` | Get table details |
| PATCH | `/tables/:id/status` | Update table status |
| POST | `/tables/:id/assign` | Assign staff to table |
| POST | `/tables/merge` | Merge tables |
| POST | `/tables/:id/split` | Split table |
| GET | `/floor-plan` | Get floor plan with real-time status |
| GET | `/waitlist` | Get current waitlist |
| POST | `/waitlist` | Add to waitlist |
| PATCH | `/waitlist/:id` | Update waitlist entry |
| DELETE | `/waitlist/:id` | Remove from waitlist |

---

## 3.6 Menu API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/menu` | Full menu (with categories, items, modifiers) |
| GET | `/menu/categories` | List categories |
| POST | `/menu/categories` | Create category |
| PUT | `/menu/categories/:id` | Update category |
| DELETE | `/menu/categories/:id` | Delete category |
| GET | `/menu/items` | List items |
| POST | `/menu/items` | Create item |
| GET | `/menu/items/:id` | Get item details |
| PUT | `/menu/items/:id` | Update item |
| DELETE | `/menu/items/:id` | Delete item (soft) |
| PATCH | `/menu/items/:id/availability` | Toggle item availability |
| POST | `/menu/items/:id/variants` | Add variant |
| PUT | `/menu/items/:id/variants/:variant_id` | Update variant |
| POST | `/menu/items/:id/modifiers` | Add modifier group |
| GET | `/menu/86-list` | Get all currently unavailable items |
| POST | `/menu/items/:id/86` | Mark item as unavailable |
| DELETE | `/menu/items/:id/86` | Mark item as available |

---

## 3.7 Inventory API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/inventory/items` | List inventory items |
| POST | `/inventory/items` | Create item |
| PUT | `/inventory/items/:id` | Update item |
| GET | `/inventory/stock` | Current stock levels |
| GET | `/inventory/stock/alerts` | Items below reorder point |
| POST | `/inventory/grn` | Create GRN |
| GET | `/inventory/grn` | List GRNs |
| GET | `/inventory/grn/:id` | GRN details |
| PUT | `/inventory/grn/:id` | Update GRN |
| POST | `/inventory/grn/:id/confirm` | Confirm GRN received |
| POST | `/inventory/indents` | Create stock indent |
| GET | `/inventory/indents` | List indents |
| POST | `/inventory/indents/:id/fulfill` | Fulfill indent |
| POST | `/inventory/adjustments` | Manual stock adjustment |
| POST | `/inventory/wastage` | Record wastage |
| GET | `/inventory/wastage` | Wastage report |
| POST | `/inventory/transfers` | Create stock transfer |
| POST | `/inventory/audits` | Start physical count |
| PUT | `/inventory/audits/:id/items` | Submit count for items |
| POST | `/inventory/audits/:id/close` | Close audit |

---

## 3.8 Customer and CRM API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Customer profile |
| PUT | `/customers/:id` | Update customer |
| GET | `/customers/:id/visits` | Visit history |
| GET | `/customers/:id/loyalty` | Loyalty account |
| GET | `/customers/search?q=phone` | Search by phone/name |
| POST | `/customers/:id/tags` | Add tag to customer |
| DELETE | `/customers/:id/tags/:tag` | Remove tag |
| POST | `/customers/segments` | Create segment |
| GET | `/customers/segments` | List segments |
| POST | `/campaigns` | Create campaign |
| POST | `/campaigns/:id/send` | Send campaign |
| GET | `/campaigns/:id/stats` | Campaign analytics |

---

## 3.9 Reports API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/sales/daily` | Daily sales summary |
| GET | `/reports/sales/hourly` | Hourly breakdown |
| GET | `/reports/sales/items` | Item-wise sales |
| GET | `/reports/sales/categories` | Category-wise sales |
| GET | `/reports/sales/payment-modes` | Payment mode breakdown |
| GET | `/reports/finance/pnl` | P&L report |
| GET | `/reports/finance/cash-flow` | Cash flow report |
| GET | `/reports/finance/gst` | GST summary |
| GET | `/reports/finance/gst/gstr1` | GSTR-1 export data |
| GET | `/reports/inventory/stock` | Current stock report |
| GET | `/reports/inventory/consumption` | Consumption vs. theoretical |
| GET | `/reports/inventory/variance` | Stock variance report |
| GET | `/reports/inventory/wastage` | Wastage analysis |
| GET | `/reports/customers/retention` | Repeat visit analysis |
| GET | `/reports/customers/loyalty` | Loyalty metrics |
| GET | `/reports/hr/attendance` | Staff attendance |
| POST | `/reports/export` | Async export (CSV/PDF) |
| GET | `/reports/export/:job_id` | Check export status |
| GET | `/reports/export/:job_id/download` | Download export |

**Common Query Parameters for All Reports:**
```
?start_date=2026-06-01
?end_date=2026-06-30
?outlet_id=uuid           (or all outlets for owner)
?group_by=day|week|month
?format=json|csv
```

---

## 3.10 AI Recommendations API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/ai/insights/daily` | Today's AI recommendations |
| GET | `/ai/forecast/demand` | Demand forecast (7/14/30 days) |
| GET | `/ai/forecast/inventory` | Inventory needs forecast |
| GET | `/ai/pricing/suggestions` | Price optimization suggestions |
| POST | `/ai/ask` | Natural language query |
| GET | `/ai/anomalies` | Detected anomalies |
| GET | `/ai/menu/performance` | Menu performance analysis |

**POST /ai/ask — Natural Language Query:**
```json
{
  "question": "Why did revenue drop by 18% last Tuesday?",
  "context": {
    "outlet_id": "uuid",
    "date_range": { "start": "2026-06-17", "end": "2026-06-17" }
  }
}
```

**Response:**
```json
{
  "answer": "Revenue dropped 18% on Tuesday June 17th vs. the same day last week. Three contributing factors: (1) Rainy weather reduced walk-in covers by 31%, (2) Swiggy was running a competitor's exclusive discount that day, (3) Your top 2 selling items (Butter Chicken, Biryani) were 86'd by 6:30 PM due to inventory shortage. Recommended action: Set reorder alerts for these items 2 days earlier.",
  "confidence": 0.87,
  "data_sources": ["sales_data", "weather_api", "inventory_log", "aggregator_data"],
  "related_insights": [...]
}
```

---

# 4. Webhook Events

Outbound webhooks notify external systems of events.

| Event | Payload | Use Case |
|---|---|---|
| `bill.paid` | Bill summary | Accounting integration |
| `order.created` | Order details | Custom kitchen displays |
| `inventory.low_stock` | Item + quantity | Third-party procurement |
| `customer.visited` | Customer + spend | External CRM |
| `delivery.status_changed` | Order + status | Customer notification app |
| `loyalty.points_updated` | Customer + points | Loyalty app sync |

**Webhook Delivery:**
- Maximum 3 retry attempts: 5s, 30s, 300s
- Signed with HMAC-SHA256 in `X-Webhook-Signature` header
- 200 response expected within 10 seconds

---

# 5. Error Code Dictionary

| Code | HTTP Status | Description |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | Role lacks required permission |
| `RESOURCE_NOT_FOUND` | 404 | Entity does not exist |
| `BILL_ALREADY_PAID` | 409 | Bill cannot be modified |
| `BILL_ALREADY_VOID` | 409 | Bill already voided |
| `ITEM_OUT_OF_STOCK` | 422 | Item not available |
| `TABLE_OCCUPIED` | 422 | Table not available |
| `DISCOUNT_EXCEEDS_LIMIT` | 422 | Exceeds role's max discount |
| `INSUFFICIENT_LOYALTY_POINTS` | 422 | Not enough points to redeem |
| `PO_APPROVAL_REQUIRED` | 422 | PO value requires approval |
| `STOCK_BELOW_ZERO` | 422 | Cannot reduce stock below zero |
| `INVALID_GST_NUMBER` | 400 | GSTIN format invalid |
| `DUPLICATE_BILL_NUMBER` | 409 | Bill number already exists |
| `SESSION_LIMIT_EXCEEDED` | 429 | Too many concurrent sessions |
| `RATE_LIMIT_EXCEEDED` | 429 | API rate limit hit |

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial API Specifications |

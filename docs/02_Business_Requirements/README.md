# BRD-001 — Business Requirements Document

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| Document ID    | BRD-001                                  |
| Title          | Restaurant Management System — BRD       |
| Version        | 1.0.0                                    |
| Status         | Draft                                    |
| Category       | Business Requirements                    |
| Author         | Vraj Prajapati                           |
| Reviewed By    | —                                        |
| Classification | Confidential — Internal Use Only         |
| Last Updated   | 2026-06-25                               |

---

# 1. Executive Summary

Restaurant businesses in India suffer from operational inefficiencies that erode 15–30% of potential profit every year. Owners make critical decisions (purchasing, staffing, pricing) based on outdated, incomplete, or manually compiled data.

Project Atlas will solve this by building a complete Restaurant ERP — not a billing tool — that digitizes, automates, and intelligently optimizes every function of a restaurant business.

The platform targets every restaurant from a ₹20,000/month tea stall to a ₹10 Cr/year enterprise chain.

---

# 2. Business Problem Statement

## 2.1 Primary Problem

**Restaurant owners spend 4–6 hours per day on administrative tasks that should take 15 minutes.**

This time is spent:
- Manually checking sales registers and reconciling cash
- Calling managers to get stock status
- Reviewing paper KOTs for billing accuracy
- Manually updating inventory after every shift
- Downloading reports from 3–4 different platforms (Zomato, Swiggy, POS, Excel)

## 2.2 Financial Impact of Current State

| Problem | Estimated Loss Per Restaurant Per Year |
|---|---|
| Inventory theft and unrecorded consumption | ₹1.2L – ₹6L |
| Food wastage due to poor forecasting | ₹80K – ₹4L |
| Discount and coupon abuse | ₹50K – ₹2L |
| Cash discrepancy and register fraud | ₹60K – ₹3L |
| Aggregator settlement errors undetected | ₹30K – ₹1.5L |
| Over-purchasing due to no par stock system | ₹40K – ₹2L |
| Staff overtime due to poor scheduling | ₹30K – ₹1.2L |
| **Total estimated preventable loss** | **₹3.9L – ₹19.7L** |

## 2.3 Secondary Problem

**Restaurant operators cannot scale because there is no operational intelligence.**

Current tools give data. They do not give decisions.

A restaurant owner sees "chicken sold 200 portions this week." They do not know:
- Whether that is above or below expected
- Whether they need to order more tomorrow
- Whether a price change would improve margin
- Whether a particular dish is cannibalizing a higher-margin item

Atlas will close this gap with an AI decision layer.

---

# 3. Market Analysis

## 3.1 Indian Restaurant Market Size

| Metric | Value |
|---|---|
| India foodservice market size (2024) | ₹5.99 Lakh Crore (~$72B) |
| Organized segment (using software) | ~22% |
| Unorganized segment (opportunity) | ~78% |
| CAGR (2024–2029) | 10–12% |
| Total restaurants in India | ~7.5 Million |
| Restaurants with POS software | ~650,000 |
| Total addressable market for Atlas | ~2.5 Million restaurants |

## 3.2 Target Segments

**Tier 1 — Immediate Market (Years 1–2)**
- Standalone restaurants: 500–5,000 sq ft, ₹5L–₹1.5Cr annual revenue
- Small chains: 2–10 outlets
- Cloud kitchens

**Tier 2 — Growth Market (Years 2–4)**
- Mid-size chains: 10–50 outlets
- Franchise operators
- Hotel restaurants

**Tier 3 — Enterprise Market (Years 4+)**
- Large chains: 50+ outlets
- National franchise brands
- Multi-brand restaurant groups

## 3.3 Competitor Landscape

| Competitor | Strengths | Critical Weaknesses | Atlas Opportunity |
|---|---|---|---|
| Petpooja | Large customer base, integrations | Outdated UX, no AI, weak analytics | Modern UX + AI layer |
| Restroworks | Enterprise features | Complex, expensive, poor mobile | Affordable enterprise |
| Toast (US) | Strong hardware | US-centric, no GST, no Indian payments | India-native |
| Square | Ease of use | No inventory, no kitchen management | Complete vs. point solution |
| GoFrugal | Inventory features | Very complex, old UI | Modern + simple |
| DotPe | Aggregator integration | No backend operations | Full-stack solution |

**Atlas's Sustainable Competitive Advantages:**
1. AI-native decision engine (no competitor has this)
2. India-first: GST, UPI, WhatsApp, FSSAI, regional languages
3. Complete ERP vs. point solution
4. Offline-first architecture
5. Price point competitive with Petpooja, features exceeding Restroworks

---

# 4. Stakeholder Analysis

## 4.1 Internal Stakeholders

| Stakeholder | Primary Goal | Success Metric |
|---|---|---|
| Restaurant Owner | Increase profit, reduce manual work | Monthly P&L via mobile, 80% less manual reporting |
| General Manager | Smooth daily operations | Zero billing errors, real-time visibility |
| Head Chef | Kitchen efficiency, cost control | Food cost %, order accuracy |
| Cashier | Fast, error-free billing | Billing time < 45 seconds, zero cash mismatch |
| Inventory Manager | Stock accuracy | Zero stockouts, < 0.5% variance |
| Marketing Team | Customer retention | Loyalty redemption rate, repeat visit % |
| Accountant | Clean financials | GST-ready reports, zero reconciliation errors |

## 4.2 External Stakeholders

| Stakeholder | Relationship | Atlas Responsibility |
|---|---|---|
| Customer | Revenue generator | Fast service, accurate billing, loyalty experience |
| Vendor | Supply chain | PO management, GRN, payment processing |
| Zomato / Swiggy | Order channel | Aggregator integration, order sync |
| Payment Gateways | Revenue processing | Razorpay, Paytm, Stripe integration |
| GSTN | Tax authority | Accurate GST invoice, GSTR-1 data export |
| FSSAI | Compliance authority | Hygiene records, labeling compliance |
| Banks | Settlement | Bank reconciliation, payment settlement |

---

# 5. Business Goals

## 5.1 Primary Goals

| Goal ID | Business Goal | Target | Measurement |
|---|---|---|---|
| BG-001 | Reduce owner management effort | -80% time on admin | Daily active usage sessions |
| BG-002 | Increase restaurant profitability | +15% net margin | Revenue vs. cost tracking |
| BG-003 | Reduce food wastage | -25% wastage | Wastage log vs. baseline |
| BG-004 | Eliminate cash discrepancy | < ₹50/day variance | Cash reconciliation report |
| BG-005 | Increase customer retention | +20% repeat visits | CRM loyalty metrics |
| BG-006 | Enable multi-branch visibility | Real-time consolidated view | Dashboard usage |
| BG-007 | Reduce inventory theft | -60% variance | Stock audit reports |
| BG-008 | Enable data-driven decisions | Owner uses AI insights daily | AI recommendation usage |

## 5.2 Platform Business Goals

| Goal ID | Platform Goal | Target | Timeline |
|---|---|---|---|
| PG-001 | Reach 1,000 paid restaurants | ₹1Cr ARR | Month 18 |
| PG-002 | Reach 10,000 restaurants | ₹10Cr ARR | Month 36 |
| PG-003 | 95% customer retention | <5% monthly churn | Ongoing |
| PG-004 | NPS > 60 | Strong promoter base | Month 12 |

---

# 6. Business Rules

Business rules are non-negotiable constraints that the software must enforce.

## 6.1 Billing Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-001 | Every item on a bill must have a GST HSN code and applicable tax rate | System-level, cannot be bypassed |
| BR-002 | Bills once printed cannot be modified; an amendment bill must be issued | Hard system rule |
| BR-003 | Cash collected must be recorded against the specific bill | No anonymous cash entries |
| BR-004 | A bill can only be voided by a user with Void authority | RBAC enforcement |
| BR-005 | Service charge is not a government tax; it must be disclosed separately | Invoice formatting rule |
| BR-006 | Split bill total must equal original bill total exactly | Mathematical validation |
| BR-007 | A discount exceeding the configured threshold requires manager authorization | Approval workflow |
| BR-008 | A bill for GST purposes must include: GSTIN of restaurant, item-wise tax, and customer GSTIN (if B2B) | Legal requirement |
| BR-009 | Refunds must reference the original bill number | Traceability requirement |
| BR-010 | An advance payment must be tracked and deducted at final billing | Financial accuracy |

## 6.2 Inventory Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-011 | Stock cannot go below zero in the system (negative stock alerts) | System validation |
| BR-012 | Every stock receipt must reference a Purchase Order | Three-way match requirement |
| BR-013 | Items must be consumed on FIFO basis (First In, First Out) | Batch tracking |
| BR-014 | Wastage above configured threshold requires manager approval | Approval workflow |
| BR-015 | Inter-branch stock transfer requires approval from sending branch manager | Authorization rule |
| BR-016 | Expired items must be removed from available stock and recorded | Compliance rule |
| BR-017 | A GRN quantity cannot exceed the corresponding PO quantity by more than 5% without authorization | Over-delivery check |

## 6.3 Access Control Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-018 | A user can belong to only one restaurant outlet (unless explicitly granted multi-outlet access) | System constraint |
| BR-019 | Owner account cannot be deleted; only deactivated | Data integrity |
| BR-020 | Permission changes must be logged with who changed what and when | Audit trail |
| BR-021 | A user inactive for 90 days must be automatically suspended | Security policy |
| BR-022 | Failed login attempts exceeding 5 must lock the account for 30 minutes | Security policy |
| BR-023 | Session tokens expire after 8 hours of inactivity | Security policy |
| BR-024 | Any action in the system must be associated with a logged-in user | Audit requirement |

## 6.4 Financial Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-025 | Revenue is recognized at the time of payment, not order | Accounting standard |
| BR-026 | GST liability is created at the time of invoice issuance | Legal requirement |
| BR-027 | A voided bill must be excluded from revenue but retained in audit trail | Audit requirement |
| BR-028 | Advance payments must be held as liability until service is delivered | Accounting standard |
| BR-029 | All expenses must have an expense category, vendor, and payment mode | Financial accuracy |
| BR-030 | Payroll calculations must account for: basic, DA, HRA, allowances, PF deduction, ESI deduction, PT | Labor law compliance |

## 6.5 Customer and Loyalty Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-031 | A customer can have only one loyalty account per phone number per restaurant group | Uniqueness constraint |
| BR-032 | Loyalty points expire after the configured validity period (default: 12 months) | System scheduler |
| BR-033 | Loyalty redemption cannot exceed 50% of bill value (configurable) | Business policy |
| BR-034 | Points are earned only on net bill value (after discounts) | Calculation rule |
| BR-035 | Points are not earned on tax portion | Tax compliance |

## 6.6 Order Management Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-036 | An order item marked as "cooking started" cannot be voided without manager authorization | Kitchen control |
| BR-037 | KOT must be sent to kitchen before food preparation begins | Process control |
| BR-038 | An order cannot be billed until all items are marked as served | Billing accuracy |
| BR-039 | A table cannot be assigned to a new order until it is marked as "available" | Table control |
| BR-040 | Aggregator orders must be auto-accepted within 3 minutes or they are rejected | Platform SLA |

---

# 7. Key Performance Indicators

## 7.1 Operational KPIs

| KPI | Description | Target | Frequency |
|---|---|---|---|
| Table Turnover Rate | Tables served / total tables per service | > 2.5 | Daily |
| Average Order Fulfillment Time | Order submitted to food served | < 15 min | Per shift |
| Order Accuracy Rate | Correct orders / total orders | > 98% | Daily |
| Billing Speed | Time to generate and close a bill | < 45 seconds | Per shift |
| Cash Reconciliation Variance | System total vs. physical cash | < ₹50 | Daily |

## 7.2 Financial KPIs

| KPI | Formula | Target | Frequency |
|---|---|---|---|
| Food Cost % | (COGS / Revenue) × 100 | < 32% | Weekly |
| Labor Cost % | (Labor Cost / Revenue) × 100 | < 35% | Monthly |
| Prime Cost % | Food Cost % + Labor Cost % | < 65% | Monthly |
| Net Profit Margin | (Net Profit / Revenue) × 100 | > 10% | Monthly |
| Revenue Per Cover | Total Revenue / Total Covers | Track trend | Daily |
| Inventory Turnover | COGS / Average Inventory | > 12/year | Monthly |
| Wastage % | (Wastage Cost / COGS) × 100 | < 3% | Weekly |

## 7.3 Customer KPIs

| KPI | Description | Target | Frequency |
|---|---|---|---|
| Repeat Visit Rate | % customers who visit more than once/month | > 35% | Monthly |
| Loyalty Enrollment Rate | % customers enrolled in loyalty | > 40% | Monthly |
| NPS Score | Net Promoter Score from feedback | > 60 | Monthly |
| Online Rating | Zomato/Google aggregate rating | > 4.2 | Weekly |
| Customer Acquisition Cost | Marketing spend / new customers | < ₹150 | Monthly |

---

# 8. Revenue Model for Project Atlas

## 8.1 Pricing Structure

| Plan | Target | Monthly Price | Key Features |
|---|---|---|---|
| Starter | Single outlet, < ₹15L ARR | ₹1,999/mo | Billing, Inventory, Basic Reports |
| Professional | Single outlet, < ₹1Cr ARR | ₹4,999/mo | + CRM, Loyalty, Advanced Analytics |
| Business | Multi-branch (up to 5) | ₹9,999/mo | + All modules, AI Basic |
| Enterprise | 5+ branches / chains | Custom | Full platform + AI Decision Engine |
| Cloud Kitchen | Per kitchen | ₹2,499/mo | + Multi-brand, Aggregator integration |

## 8.2 Additional Revenue Streams

- Hardware sales (tablets, receipt printers, KDS screens): 20–30% margin
- Payment processing: 0.1–0.2% transaction fee above gateway rate
- Marketplace: vendor integrations, payment gateway partnerships
- Professional services: onboarding, training, customization

---

# 9. Assumptions and Constraints

## 9.1 Technical Assumptions
- Internet connectivity is available at the restaurant (with offline fallback)
- Restaurant owners have smartphones (Android or iOS)
- Minimum one internet-connected device per outlet for billing

## 9.2 Business Assumptions
- Indian regulatory environment (GST, FSSAI, labor laws) is primary compliance target
- INR is the primary currency; multi-currency is a future feature
- WhatsApp Business API is available for automated messaging

## 9.3 Constraints
- Must support offline billing for up to 72 hours
- Must generate GST-compliant invoices from day one
- Data must be stored in India (data residency requirement)
- Must integrate with top 3 aggregators: Zomato, Swiggy, Magicpin

---

# 10. Risk Register

| Risk ID | Risk Description | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| RSK-001 | Petpooja launches aggressive discounting | High | High | Focus on AI differentiation |
| RSK-002 | GST rule changes require re-architecture | Medium | High | Configurable tax engine |
| RSK-003 | Internet connectivity issues in Tier 2/3 cities | High | High | Offline-first architecture |
| RSK-004 | Restaurant staff reluctant to adopt new software | High | High | Training program, WhatsApp helpdesk |
| RSK-005 | Aggregator API changes break integration | Medium | High | Adapter pattern, monitoring alerts |
| RSK-006 | Data breach damages brand trust | Low | Critical | SOC2-ready security from day one |
| RSK-007 | Cash flow problems from hardware sales model | Medium | Medium | Subscription-first, hardware optional |
| RSK-008 | Scale challenges at 10,000+ restaurants | Medium | High | Multi-region architecture from v1 |

---

# Related Documents

- DOM-100 to DOM-116 — Domain Knowledge Base
- PRD-001 — Product Requirements Document
- ARCH-001 — System Architecture
- SEC-001 — Security and Compliance

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial BRD |

# SEC-001 — Security, Access Control and Compliance

| Field          | Value                                          |
| -------------- | ---------------------------------------------- |
| Document ID    | SEC-001                                        |
| Title          | Security, RBAC, Permissions, Notifications     |
| Version        | 1.0.0                                          |
| Status         | Draft                                          |
| Category       | Security and Compliance                        |
| Author         | Vraj Prajapati                                 |
| Classification | Confidential — Internal Use Only               |
| Last Updated   | 2026-06-25                                     |

---

# 1. Security Architecture Overview

RestaurantOS handles financial transactions, customer PII, tax data, and business intelligence. Every layer of the platform must be designed with security as a first-class concern.

Security is not a feature. It is the foundation.

## 1.1 Security Layers

```
Layer 1: Network Security
  Cloudflare WAF + DDoS protection
       ↓
Layer 2: API Gateway
  Rate limiting, IP allowlist, JWT validation
       ↓
Layer 3: Application Security
  RBAC, ABAC, Input validation, OWASP mitigations
       ↓
Layer 4: Data Security
  Encryption at rest, PII masking, column-level encryption
       ↓
Layer 5: Audit Security
  Immutable audit logs, tamper-detection
       ↓
Layer 6: Infrastructure Security
  VPC, secrets manager, key rotation, vulnerability scanning
```

---

# 2. Role-Based Access Control (RBAC)

## 2.1 Role Definitions

| Role ID | Role Name | Scope | Description |
|---|---|---|---|
| ROLE-01 | Platform Super Admin | Platform | Atlas internal — full platform access |
| ROLE-02 | Platform Support | Platform | Read-only access for support |
| ROLE-03 | Restaurant Owner | Tenant | Full access to their restaurant group |
| ROLE-04 | Business Partner | Tenant | Configurable sub-owner access |
| ROLE-05 | General Manager | Outlet Group | All outlets they manage |
| ROLE-06 | Branch Manager | Outlet | Single outlet full access |
| ROLE-07 | Floor Manager | Outlet | FOH operations only |
| ROLE-08 | Captain | Outlet | Their section orders |
| ROLE-09 | Waiter / Server | Outlet | Order taking for assigned tables |
| ROLE-10 | Cashier | Outlet | Billing and payment only |
| ROLE-11 | Host / Hostess | Outlet | Reservations and seating only |
| ROLE-12 | Head Chef | Outlet | Kitchen, inventory view, recipes |
| ROLE-13 | Sous Chef | Outlet | Kitchen operations only |
| ROLE-14 | Kitchen Staff | Outlet | KDS only |
| ROLE-15 | Bartender | Outlet | Bar KDS and bar stock |
| ROLE-16 | Inventory Manager | Outlet | Full inventory module |
| ROLE-17 | Purchase Manager | Outlet | Procurement module |
| ROLE-18 | Accountant | Outlet | Finance reports, read-only billing |
| ROLE-19 | HR Manager | Outlet | HR and attendance module |
| ROLE-20 | Marketing Executive | Outlet | CRM and loyalty module |
| ROLE-21 | Delivery Manager | Outlet | Delivery module |
| ROLE-22 | Auditor | Outlet | Read-only access to all reports |
| ROLE-23 | Custom Role | Configurable | User-defined role |

---

## 2.2 Complete Permission Matrix

### Billing Permissions

| Permission | Owner | GM | Branch Mgr | Floor Mgr | Cashier | Waiter | Chef |
|---|---|---|---|---|---|---|---|
| View current table orders | ✅ | ✅ | ✅ | ✅ | ✅ | Own | ✅ |
| Create new order | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Modify open order | ✅ | ✅ | ✅ | ✅ | ✅ | Own | ❌ |
| Void order item (cooking started) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Generate bill | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Apply discount ≤ configured limit | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Apply discount > configured limit | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Apply 100% discount (comp) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Apply coupon code | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Process cash payment | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Process card / UPI payment | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Void bill | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Process refund | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Print bill | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View bill history | ✅ | ✅ | ✅ | ✅ | Shift | ❌ | ❌ |
| Export billing data | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Inventory Permissions

| Permission | Owner | GM | Branch Mgr | Inventory Mgr | Chef | Cashier |
|---|---|---|---|---|---|---|
| View stock levels | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create GRN | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve GRN | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Issue stock indent | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Record wastage | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manual stock adjustment | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve manual adjustment | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Conduct physical stock audit | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Transfer stock between branches | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve inter-branch transfer | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View inventory reports | ✅ | ✅ | ✅ | ✅ | View | ❌ |
| Export inventory data | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Financial Permissions

| Permission | Owner | GM | Accountant | Branch Mgr | Cashier |
|---|---|---|---|---|---|
| View daily P&L | ✅ | ✅ | ✅ | Outlet | ❌ |
| View monthly P&L | ✅ | ✅ | ✅ | Outlet | ❌ |
| View all-branch P&L | ✅ | ✅ | ✅ | ❌ | ❌ |
| View expense report | ✅ | ✅ | ✅ | Outlet | ❌ |
| Record expense | ✅ | ✅ | ✅ | ✅ | ❌ |
| Approve expense | ✅ | ✅ | ❌ | ✅ | ❌ |
| View payroll | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export financial reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| View GST report | ✅ | ✅ | ✅ | ❌ | ❌ |
| View cash reconciliation | ✅ | ✅ | ✅ | ✅ | Shift |

### HR Permissions

| Permission | Owner | GM | HR Manager | Branch Mgr |
|---|---|---|---|---|
| View all staff | ✅ | ✅ | ✅ | Outlet |
| Add new staff | ✅ | ✅ | ✅ | ✅ |
| Edit staff profile | ✅ | ✅ | ✅ | Outlet |
| Deactivate staff | ✅ | ✅ | ✅ | ❌ |
| View attendance | ✅ | ✅ | ✅ | Outlet |
| Approve leave | ✅ | ✅ | ✅ | Outlet |
| Process payroll | ✅ | ❌ | ✅ | ❌ |
| Change staff role | ✅ | ❌ | ❌ | ❌ |
| Change staff permissions | ✅ | ❌ | ❌ | ❌ |

---

# 3. Attribute-Based Access Control (ABAC) Rules

ABAC extends RBAC to support context-based rules.

| Rule ID | Condition | Effect |
|---|---|---|
| ABAC-001 | Discount > 20% AND Role = Cashier | Deny — require manager approval |
| ABAC-002 | Bill void AND Time > 2 hours after billing | Require owner approval |
| ABAC-003 | Login from new device AND Role = Owner | Trigger 2FA verification |
| ABAC-004 | Data access AND Outlet ≠ user's assigned outlet | Deny — unless multi-outlet permission |
| ABAC-005 | Export data AND Time = business hours | Allow |
| ABAC-006 | Export data AND Time = outside business hours | Require additional confirmation |
| ABAC-007 | PO value > ₹50,000 AND approver level = Branch Mgr | Escalate to Owner |
| ABAC-008 | Aggregator price override AND Role ≠ Owner/GM | Deny |
| ABAC-009 | Staff salary view AND viewer != HR/Owner | Deny |
| ABAC-010 | Loyalty comp ≥ ₹500 AND Role = Cashier | Deny — require manager |

---

# 4. Authentication Specification

## 4.1 Authentication Methods

| Method | Applicable To | Expiry | Notes |
|---|---|---|---|
| Email + Password | All users | 8 hours session | bcrypt, min 8 chars |
| OTP via SMS | All users | 5 minutes | 6-digit OTP |
| OTP via WhatsApp | Field staff | 5 minutes | Alternative to SMS |
| Biometric (Mobile) | App users | 8 hours session | FaceID/Fingerprint |
| PIN (4/6 digit) | Quick cashier re-auth | 30 minutes | For discount approval |
| 2FA (TOTP) | Owner, GM | Per session | Google Authenticator |
| Hardware Token | Platform Admin | Per session | FIDO2 |

## 4.2 Token Architecture

```
Access Token:  JWT, 60-minute expiry
Refresh Token: Opaque, 30-day expiry, single-use rotation
Device Token:  Long-lived (90 days), device-specific
```

## 4.3 Session Rules

- Owner can see all active sessions across devices
- Force logout for any session (lost device scenario)
- Concurrent sessions: allowed (max 5 per user)
- Session idle timeout: 8 hours
- Critical action re-auth: PIN required for void, refund, discount > threshold

---

# 5. Audit Trail Specification

## 5.1 What Must Be Audited

Every financially significant or security-sensitive action must create an immutable audit record.

| Category | Actions Audited |
|---|---|
| Billing | Create bill, void bill, apply discount, process refund, payment recorded |
| Inventory | GRN created, stock issued, manual adjustment, wastage recorded, audit conducted |
| Menu | Item price changed, item added, item deleted, availability changed |
| Access | Login, logout, failed login, password change, role change, permission change |
| Procurement | PO created, PO approved, PO sent, vendor added |
| Financial | Expense recorded, salary processed, cash reconciliation |
| Customer | Customer profile created, loyalty redemption, feedback submitted |

## 5.2 Audit Record Structure

```json
{
  "audit_id": "uuid",
  "tenant_id": "uuid",
  "outlet_id": "uuid",
  "user_id": "uuid",
  "user_name": "string",
  "user_role": "string",
  "action": "BILL_VOID",
  "entity_type": "bill",
  "entity_id": "bill_uuid",
  "old_value": { "status": "paid", "amount": 1200 },
  "new_value": { "status": "void", "amount": 0 },
  "reason": "Customer complaint — wrong item billed",
  "ip_address": "string",
  "device_id": "string",
  "timestamp": "ISO 8601",
  "request_id": "uuid"
}
```

## 5.3 Audit Log Rules

- Audit logs are write-once, read-many (append-only)
- No user — including Platform Super Admin — can delete audit logs
- Audit logs retained for minimum 7 years (GST compliance requirement)
- Audit logs stored in separate, isolated infrastructure
- Real-time audit streaming to SIEM for security monitoring

---

# 6. Notification System

## 6.1 Notification Channels

| Channel | Use Case | Technology |
|---|---|---|
| In-App Push | All real-time operational alerts | Firebase FCM |
| WhatsApp | Owner daily reports, customer receipts | WhatsApp Business API |
| SMS | OTP, critical alerts | MSG91 / Route Mobile |
| Email | Monthly reports, invoices, onboarding | SMTP / SendGrid |
| Webhook | Integration events to third parties | REST webhook |

## 6.2 Notification Rules by Event

### Billing Events

| Event | Who Gets Notified | Channel | When |
|---|---|---|---|
| Bill paid (all) | Owner (summary) | WhatsApp (EOD) | End of day |
| Discount > 20% applied | Owner + GM | In-App | Immediate |
| Bill voided | Owner + GM | In-App + SMS | Immediate |
| Refund processed | Owner + GM | In-App | Immediate |
| Cash discrepancy > ₹200 | Owner + GM | SMS + In-App | On shift close |
| Daily revenue exceeds target | Owner | WhatsApp | EOD |

### Inventory Events

| Event | Who Gets Notified | Channel | When |
|---|---|---|---|
| Item below reorder point | Owner + GM + Inventory Mgr | In-App | Immediate |
| Item out of stock | Owner + GM + Floor Mgr + Chef | In-App + SMS | Immediate |
| Stock variance > 5% after audit | Owner + GM | In-App + Email | After audit |
| Expiry within 2 days | Inventory Mgr + Chef | In-App | Daily 8 AM |
| GRN received | GM + Accountant | In-App | On creation |
| PO approval required | Owner/GM | In-App + SMS | On submission |

### Order and Kitchen Events

| Event | Who Gets Notified | Channel | When |
|---|---|---|---|
| KOT waiting > 15 minutes | Head Chef + Floor Mgr | In-App | Threshold crossed |
| Item marked out of stock | All online waiters | In-App | Immediate |
| Order rating < 3 stars (delivery) | Owner + GM | In-App | Immediate |
| Kitchen rush alert (> 30 open tickets) | Head Chef | In-App | Threshold |

### HR Events

| Event | Who Gets Notified | Channel | When |
|---|---|---|---|
| Staff didn't clock in (15 min after shift) | Branch Mgr + HR | In-App | Threshold |
| Leave request submitted | HR + Branch Mgr | In-App | On submission |
| Leave approved | Staff member | In-App + SMS | On approval |
| Payroll processed | All staff + Owner | In-App | On processing |

### Financial Events

| Event | Who Gets Notified | Channel | When |
|---|---|---|---|
| Vendor payment due in 3 days | Accountant + Owner | In-App + Email | Daily 9 AM |
| Expense approval required > ₹X | Owner | In-App + SMS | On submission |
| Revenue below target (day-over-day -20%) | Owner + GM | WhatsApp | EOD |
| GST filing due (7 days) | Accountant + Owner | Email + In-App | 7 days before |

### Security Events

| Event | Who Gets Notified | Channel | When |
|---|---|---|---|
| New device login | Account owner | SMS + Email | Immediate |
| Failed login × 5 | Account owner + Platform | Email | Immediate |
| Password changed | User + Owner | Email | Immediate |
| User role changed | Affected user + Owner | In-App + Email | Immediate |
| Suspicious activity detected | Platform Security | Internal | Immediate |

### Customer Events

| Event | Who Gets Notified | Channel | When |
|---|---|---|---|
| Birthday today | Floor Mgr + Captain | In-App | Day of |
| Anniversary today | Floor Mgr + Captain | In-App | Day of |
| VIP customer arrives | Floor Mgr + GM | In-App | On seating |
| Loyalty points about to expire (7 days) | Customer | WhatsApp | 7 days before |
| Negative feedback (< 3 stars) | Owner + GM | In-App + SMS | Immediate |

## 6.3 Notification Preferences

- Each user can configure which notifications they receive
- Owner-level notifications cannot be disabled by staff
- Critical operational alerts (stockout, bill void) cannot be disabled
- Notification frequency throttling: max 1 per event per 15 minutes for non-critical

---

# 7. Data Security

## 7.1 Encryption Standards

| Data Type | Encryption | Notes |
|---|---|---|
| Data in transit | TLS 1.3 | All APIs and web traffic |
| Passwords | bcrypt, cost factor 12 | Never stored as plaintext |
| Payment card data | PCI-DSS tokenization | Card numbers never stored |
| Database at rest | AES-256 | AWS RDS encrypted volumes |
| Backup files | AES-256 | Encrypted before upload to S3 |
| S3 objects | SSE-KMS | Server-side encryption with KMS |
| API keys/secrets | AWS Secrets Manager | Never in code or env vars |

## 7.2 PII Data Handling

| PII Field | Stored As | Masked In | Retention |
|---|---|---|---|
| Customer phone | Encrypted | Logs, analytics exports | 5 years post last visit |
| Customer email | Encrypted | Logs | 5 years post last visit |
| Staff Aadhar / PAN | Encrypted column | All non-HR screens | Duration of employment + 5 years |
| Payment card | Tokenized | All systems | Token stored, card never |
| Bank account details | Encrypted | All non-finance screens | As required by law |

## 7.3 Data Residency

- All data stored in AWS ap-south-1 (Mumbai)
- No data transferred outside India without explicit consent
- Backup to ap-south-2 (Hyderabad) within India
- Customer data deletion within 30 days of account termination request

---

# 8. OWASP Top 10 Mitigation

| OWASP Risk | Mitigation in RestaurantOS |
|---|---|
| A01: Broken Access Control | RBAC + ABAC enforced at API layer, all endpoints authenticated |
| A02: Cryptographic Failures | TLS 1.3 everywhere, AES-256 at rest, no weak algorithms |
| A03: Injection | Parameterized queries (ORM), input validation, no raw SQL |
| A04: Insecure Design | Threat modeling per module, security review before each release |
| A05: Security Misconfiguration | IaC with hardened defaults, security scanning in CI/CD |
| A06: Vulnerable Components | Dependabot automated scanning, monthly dependency review |
| A07: Auth and Session Failures | JWT with rotation, account lockout, 2FA for critical roles |
| A08: Integrity Failures | Signed artifacts in CI/CD, integrity checks on updates |
| A09: Logging Failures | Centralized immutable logging, all sensitive actions audited |
| A10: SSRF | Allowlist for outbound calls, no user-controllable URLs |

---

# 9. Compliance Framework

## 9.1 GST Compliance

| Requirement | Implementation |
|---|---|
| HSN/SAC code per item | Mandatory field in menu setup |
| Tax rate per HSN | Configurable tax master |
| CGST + SGST / IGST split | Auto-calculated based on supply type |
| GSTIN on invoice | Mandatory in restaurant profile |
| Buyer GSTIN on B2B invoices | Optional field at billing |
| GSTR-1 data export | Monthly export in GSTN format |
| Credit note format | Standard GST credit note for refunds |
| E-invoice (IRN) | For turnovers > ₹10Cr (Phase 2) |

## 9.2 FSSAI Compliance

| Requirement | Implementation |
|---|---|
| FSSAI license number display | Mandatory in restaurant profile + receipt |
| Veg/Non-veg labeling | Required tag per item |
| Allergen information | Optional but recommended per item |
| Hygiene inspection records | Document upload module (Phase 2) |
| Food safety training records | HR training record module (Phase 2) |

## 9.3 Payment Compliance (PCI-DSS)

| Requirement | Implementation |
|---|---|
| No card data storage | Payment tokenization only |
| Secure card transmission | TLS 1.3, PCI-compliant gateway |
| Access control to payment data | Only Finance role can view settlement reports |
| Audit log for payment events | All payment actions audited |

## 9.4 Labor Law Compliance

| Requirement | Implementation |
|---|---|
| PF deduction calculation | Auto in payroll module |
| ESI deduction | Auto in payroll module |
| Professional Tax | Configurable by state |
| Minimum wage compliance | Alert if salary < state minimum wage |
| Overtime calculation | Time-and-a-half after 8 hours |

---

# 10. Incident Response Plan

## 10.1 Security Incident Classification

| Level | Description | Response Time | Escalation |
|---|---|---|---|
| P1 | Data breach, active attack | 15 minutes | CEO + CTO |
| P2 | Platform down, auth compromised | 1 hour | CTO |
| P3 | Performance degradation, partial outage | 4 hours | Engineering Lead |
| P4 | Minor issue, no data risk | 24 hours | Engineering team |

## 10.2 Data Breach Response Protocol

1. Identify and contain: Isolate affected systems within 15 minutes
2. Assess: Determine scope of exposure within 2 hours
3. Notify: CERT-In notification within 6 hours (regulatory requirement)
4. Affected customers notification within 72 hours
5. Root cause analysis and remediation plan within 7 days
6. Post-incident review and documentation within 14 days

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial Security Document |

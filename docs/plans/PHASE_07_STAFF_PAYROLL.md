# Phase 7 — Staff & Payroll
**Priority:** 🟡 Medium | **Estimate:** 3 weeks | **Depends on:** —

---

## 1. Overview

Atlas has basic staff management (CRUD, roles, PIN, active status). This phase adds attendance tracking, shift management, leave management, salary calculation, payroll processing, staff performance KPIs, and activity logs.

---

## 2. Current vs Target

| Feature | Current | Target |
|---------|---------|--------|
| Staff CRUD | ✅ | Enhanced |
| Role assignment | ✅ | ✅ |
| PIN management | ✅ | ✅ |
| Deactivate staff | ✅ | ✅ |
| Attendance (clock in/out) | ❌ | ✅ |
| Shift management | ❌ | ✅ |
| Leave management | ❌ | ✅ |
| Salary configuration | ❌ | ✅ |
| Payroll calculation | ❌ | ✅ |
| Payroll processing | ❌ | ✅ |
| Staff performance KPIs | ❌ | ✅ |
| Activity log | ❌ | ✅ |
| Staff schedule | ❌ | ✅ |

---

## 3. Feature Breakdown

### 3.1 Attendance System

**Clock In/Out Flow:**
1. Staff opens Atlas on any device
2. Taps "Clock In" (shows current time + confirms)
3. System records attendance entry
4. Staff taps "Clock Out" when leaving
5. Duration auto-calculated

**Attendance Methods:**
- Manual (staff clicks in app)
- PIN-based (staff enters their 4-digit PIN at kiosk)
- QR scan (future)

**DB Changes:**
```prisma
model AttendanceEntry {
  id          String    @id @default(cuid())
  tenantId    String
  userId      String
  date        String    // YYYY-MM-DD (IST)
  clockIn     DateTime
  clockOut    DateTime?
  hoursWorked Float?    // calculated on clock out
  status      AttendanceStatus @default(PRESENT)
  notes       String?
  recordedBy  String?   // if manager manually records
  createdAt   DateTime  @default(now())
  user        User      @relation(...)

  @@unique([tenantId, userId, date])
  @@index([tenantId, date])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  HALF_DAY
  LEAVE
  HOLIDAY
  LATE
}
```

**API:**
- `POST /api/v1/attendance/clock-in` — authenticated staff action
- `POST /api/v1/attendance/clock-out`
- `GET /api/v1/attendance` — list (MANAGER, OWNER) — filter by userId, date range
- `POST /api/v1/attendance` — manual entry (MANAGER, OWNER)
- `PATCH /api/v1/attendance/:id` — correct entry

**Frontend:**
- Clock In/Out button on staff's own profile page (or dedicated `/attendance` kiosk page)
- Staff attendance page: calendar view + summary

---

### 3.2 Shift Management

Define shifts and assign staff to them.

**DB Changes:**
```prisma
model Shift {
  id          String   @id @default(cuid())
  tenantId    String
  name        String   // "Morning Shift", "Evening Shift"
  startTime   String   // "09:00" (24h, IST)
  endTime     String   // "17:00"
  graceMins   Int      @default(15) // late if clock-in > graceMins after startTime
  createdAt   DateTime @default(now())

  @@index([tenantId])
}

model StaffSchedule {
  id         String   @id @default(cuid())
  tenantId   String
  userId     String
  shiftId    String
  date       String   // YYYY-MM-DD
  shift      Shift    @relation(...)
  user       User     @relation(...)

  @@unique([tenantId, userId, date])
  @@index([tenantId])
}
```

**API:**
- CRUD for shifts
- `POST /api/v1/staff/schedules` — assign staff to shift on date
- `GET /api/v1/staff/schedules` — weekly schedule view

**Frontend:**
- Weekly schedule grid: staff rows × day columns
- Drag/drop or click to assign shift

---

### 3.3 Leave Management

**Leave Types:**
- Paid Leave (PL)
- Sick Leave (SL)
- Casual Leave (CL)
- Loss of Pay (LOP)
- Holiday

**Flow:**
1. Staff requests leave (or MANAGER records it)
2. MANAGER/OWNER approves/rejects
3. Approved leave reflected in attendance
4. Leave balance tracked per employee

**DB Changes:**
```prisma
model LeaveBalance {
  id        String   @id @default(cuid())
  tenantId  String
  userId    String
  year      Int
  plTotal   Int      @default(12)
  plUsed    Int      @default(0)
  slTotal   Int      @default(6)
  slUsed    Int      @default(0)
  clTotal   Int      @default(6)
  clUsed    Int      @default(0)

  @@unique([tenantId, userId, year])
}

model LeaveRequest {
  id         String      @id @default(cuid())
  tenantId   String
  userId     String
  type       String      // PL | SL | CL | LOP
  from       String      // YYYY-MM-DD
  to         String      // YYYY-MM-DD
  days       Float
  reason     String?
  status     LeaveStatus @default(PENDING)
  approvedBy String?
  approvedAt DateTime?
  createdAt  DateTime    @default(now())
  user       User        @relation(...)

  @@index([tenantId])
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}
```

**API:**
- `GET/POST /api/v1/staff/leaves` — request and list
- `POST /api/v1/staff/leaves/:id/approve`
- `POST /api/v1/staff/leaves/:id/reject`
- `GET /api/v1/staff/:id/leave-balance`

---

### 3.4 Salary Configuration

Set each staff member's salary structure.

**Salary Types:**
- Monthly fixed
- Daily rate (calculated from working days)
- Hourly rate (calculated from attendance hours)

**Deductions:**
- PF (Provident Fund) — configurable %
- ESI (Employee State Insurance)
- LOP deductions
- TDS (Tax Deducted at Source)

**Allowances:**
- HRA, Transport, Meal allowance

**DB Changes:**
```prisma
model SalaryStructure {
  id                String   @id @default(cuid())
  tenantId          String
  userId            String   @unique
  type              SalaryType  // MONTHLY | DAILY | HOURLY
  basicSalary       Int      // paise per month/day/hour
  hra               Int      @default(0)
  transportAllowance Int     @default(0)
  mealAllowance     Int     @default(0)
  pfEnabled         Boolean  @default(false)
  pfRate            Int      @default(12) // %
  esiEnabled        Boolean  @default(false)
  effectiveFrom     DateTime
  user              User     @relation(...)

  @@index([tenantId])
}

enum SalaryType {
  MONTHLY
  DAILY
  HOURLY
}
```

---

### 3.5 Payroll Processing

Monthly payroll generation.

**Flow:**
1. OWNER/MANAGER opens Payroll for a month
2. System pulls attendance for the month
3. Calculates: working days, leaves, overtime, late marks
4. Applies salary structure: basic + allowances - deductions
5. Shows payslip preview per employee
6. "Process Payroll" — locks the month's payroll
7. Mark salary as paid (cash/bank transfer)

**DB Changes:**
```prisma
model PayrollRun {
  id           String       @id @default(cuid())
  tenantId     String
  month        String       // "2026-07"
  status       PayrollStatus @default(DRAFT)
  processedBy  String?
  processedAt  DateTime?
  paidAt       DateTime?
  totalInPaise Int          @default(0)
  slips        PaySlip[]

  @@unique([tenantId, month])
  @@index([tenantId])
}

model PaySlip {
  id                  String   @id @default(cuid())
  payrollId           String
  userId              String
  tenantId            String
  month               String
  workingDays         Int
  presentDays         Int
  leavesDays          Float
  lopDays             Float
  basicSalary         Int      // paise
  hra                 Int
  allowances          Int
  grossSalary         Int
  pfDeduction         Int
  esiDeduction        Int
  lopDeduction        Int
  otherDeductions     Int
  netSalary           Int
  isPaid              Boolean  @default(false)
  paidAt              DateTime?
  paymentMode         String?  // CASH | BANK | UPI
  payroll             PayrollRun @relation(...)

  @@unique([payrollId, userId])
  @@index([tenantId])
}

enum PayrollStatus {
  DRAFT
  PROCESSED
  PAID
}
```

**API:**
- `GET /api/v1/payroll` — list payroll runs
- `POST /api/v1/payroll` — create for a month
- `POST /api/v1/payroll/:id/process` — calculate all payslips
- `GET /api/v1/payroll/:id/slips` — get all payslips
- `POST /api/v1/payroll/:id/mark-paid` — mark all paid

**Frontend:**
- `/payroll` — monthly payroll view
- Payslip modal with all components visible
- Print/export payslip as PDF

---

### 3.6 Staff Performance KPIs

Per-staff metrics visible to MANAGER/OWNER.

**Metrics:**
- Orders served (from waiter report)
- Avg check value
- Covers served
- Punctuality score (on-time clockins / total)
- Leave frequency

**Frontend:**
- Staff list card shows performance badge
- Staff profile: performance chart last 30 days

---

### 3.7 Activity Log

Track all significant actions per staff member.

**Already partially exists** via audit logs on billing. Extend to:
- Login/logout events
- Order actions (created, cancelled)
- Void requests
- Discount applications
- Clock in/out

**DB Changes:**
```prisma
model ActivityLog {
  id         String   @id @default(cuid())
  tenantId   String
  userId     String
  action     String   // "ORDER_CANCEL", "BILL_VOID", "CLOCK_IN"
  entityType String?  // "Order", "Bill"
  entityId   String?
  metadata   Json?
  ipAddress  String?
  createdAt  DateTime @default(now())

  @@index([tenantId, userId])
  @@index([tenantId, createdAt])
}
```

---

## 4. Role Permissions

| Feature | OWNER | MANAGER | CASHIER | WAITER | CHEF |
|---------|-------|---------|---------|--------|------|
| View attendance | ✅ | ✅ | Own | Own | Own |
| Record attendance | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage shifts | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve leave | ✅ | ✅ | ❌ | ❌ | ❌ |
| View payroll | ✅ | ✅ | ❌ | ❌ | ❌ |
| Process payroll | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit salary | ✅ | ❌ | ❌ | ❌ | ❌ |
| View activity log | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 5. Business Rules

1. Staff cannot clock in if already clocked in (must clock out first)
2. MANAGER cannot edit OWNER salary structure
3. Payroll for a month cannot be processed if attendance is incomplete
4. Leave approved → attendance for those days marked LEAVE automatically
5. PF/ESI: employee share deducted from salary; employer share tracked separately
6. Monthly payroll once PAID status cannot be reopened

---

## 6. QA Checklist

- [ ] Clock in: creates attendance record with timestamp
- [ ] Clock out: calculates hoursWorked correctly
- [ ] Late mark: clockIn > shift startTime + graceMins → status = LATE
- [ ] Leave request: PENDING → MANAGER approves → attendance updated
- [ ] Payroll: 25 working days, 2 leave days, 1 LOP → calculations correct
- [ ] PF deduction at 12% of basic salary
- [ ] Payslip shows all components
- [ ] WAITER can only view their own attendance → cannot view others

---

## 7. API Routes Summary

```
POST   /api/v1/attendance/clock-in
POST   /api/v1/attendance/clock-out
GET    /api/v1/attendance
POST   /api/v1/attendance
PATCH  /api/v1/attendance/:id

GET    /api/v1/staff/shifts
POST   /api/v1/staff/shifts
PATCH  /api/v1/staff/shifts/:id
GET    /api/v1/staff/schedules
POST   /api/v1/staff/schedules

GET    /api/v1/staff/leaves
POST   /api/v1/staff/leaves
POST   /api/v1/staff/leaves/:id/approve
POST   /api/v1/staff/leaves/:id/reject
GET    /api/v1/staff/:id/leave-balance

GET    /api/v1/staff/:id/salary
POST   /api/v1/staff/:id/salary
PATCH  /api/v1/staff/:id/salary

GET    /api/v1/payroll
POST   /api/v1/payroll
POST   /api/v1/payroll/:id/process
GET    /api/v1/payroll/:id/slips
POST   /api/v1/payroll/:id/mark-paid
```

---

## 8. Definition of Done

- [ ] Clock in/out creates attendance records
- [ ] Payroll calculates correctly for a full month
- [ ] Leave management: request → approve → reflected in attendance
- [ ] Payslip printable as PDF
- [ ] Activity log captures all key actions
- [ ] All QA items pass

# Atlas POS — Master Implementation Plan
**Version:** 1.0 | **Date:** 2026-07-24 | **Author:** Engineering Team

---

## Executive Summary

Atlas currently has a functional POS core (auth, orders, billing, menu, inventory, KOT, tables, reports, aggregators). This plan closes the gap between Atlas and Petpooja — a full Restaurant Operating System — through 9 focused implementation phases.

Each phase has its own detailed plan file. Phases are ordered by business impact and dependency. A team of 3–4 engineers can execute one phase in 2–4 weeks depending on scope.

---

## Current Atlas Feature Matrix

| Module | Status | Notes |
|--------|--------|-------|
| Auth (email, PIN, OTP, sessions) | ✅ Done | |
| Multi-role RBAC | ✅ Done | Just audited & hardened |
| Orders (create, confirm, serve, cancel, transfer) | ✅ Done | |
| KOT (accept, start, done, cancel, print) | ✅ Done | |
| Billing (generate, payment, void) | ✅ Done | |
| Menu (categories, items, variants, addons) | ✅ Done | |
| Inventory (items, suppliers, POs, recipes) | ✅ Done | Basic |
| Tables & Floors | ✅ Done | Basic |
| Reports (daily, items, payments, GST, inventory) | ✅ Done | 5 reports |
| Aggregators (Zomato/Swiggy webhook + CRUD) | ✅ Done | Basic |
| Staff management | ✅ Done | |
| Customer management | ✅ Done | Basic |
| Notifications | ✅ Done | Basic |
| Settings | ✅ Done | |

---

## Phase Overview

| Phase | Name | Priority | Duration Est. | Depends On |
|-------|------|----------|---------------|------------|
| **P1** | Advanced Billing & KOT | 🔴 Critical | 3 weeks | — |
| **P2** | Floor Plan & Captain App | 🔴 Critical | 3 weeks | P1 |
| **P3** | Inventory Pro | 🟠 High | 4 weeks | — |
| **P4** | CRM & Loyalty | 🟠 High | 3 weeks | — |
| **P5** | Reports & Analytics Pro | 🟠 High | 2 weeks | P1, P3 |
| **P6** | Online Ordering Pro | 🟡 Medium | 3 weeks | P1 |
| **P7** | Staff & Payroll | 🟡 Medium | 3 weeks | — |
| **P8** | Multi-Outlet | 🟢 Later | 4 weeks | P1–P5 |
| **P9** | AI & WhatsApp | 🟢 Later | 4 weeks | P5, P8 |

---

## Role Matrix — Complete System

| Feature | OWNER | MANAGER | CASHIER | WAITER | CHEF | INV_MGR |
|---------|-------|---------|---------|--------|------|---------|
| Full dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create orders | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancel orders | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Generate bills | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Apply discount | ✅ | ✅ | Limited | ❌ | ❌ | ❌ |
| Void bills | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| KOT management | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Menu edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Inventory edit | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Staff manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ | ❌ | Inv only |
| Settings | ✅ | Limited | ❌ | ❌ | ❌ | ❌ |
| Payroll | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Multi-outlet | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Technology Stack (unchanged)

- **Monorepo:** Turborepo
- **Backend:** Fastify + TypeScript + Prisma + Neon PostgreSQL
- **Frontend:** Next.js 14 App Router + Tailwind CSS + shadcn/ui
- **Auth:** JWT (15m access + 30d refresh) + Zustand
- **Package:** `packages/db` for Prisma schema
- **Deploy:** Vercel (web) + Railway (API)

---

## Engineering Standards

- Every new API route must have `authenticate` + `requireRole` guard
- Never use `prisma migrate dev` — always `prisma db push` from `packages/db`
- Never use `variant="destructive"` — always `variant="danger"`
- No commit unless explicitly asked
- Write no comments unless the WHY is non-obvious
- All hooks called before any early return (React Rules of Hooks)
- New Prisma models need an index on `tenantId` for all tenant-scoped queries

---

## Plan Files

| File | Phase |
|------|-------|
| [PHASE_01_BILLING_KOT.md](./PHASE_01_BILLING_KOT.md) | Advanced Billing & KOT |
| [PHASE_02_FLOOR_CAPTAIN.md](./PHASE_02_FLOOR_CAPTAIN.md) | Floor Plan & Captain App |
| [PHASE_03_INVENTORY_PRO.md](./PHASE_03_INVENTORY_PRO.md) | Inventory Pro |
| [PHASE_04_CRM_LOYALTY.md](./PHASE_04_CRM_LOYALTY.md) | CRM & Loyalty |
| [PHASE_05_REPORTS_ANALYTICS.md](./PHASE_05_REPORTS_ANALYTICS.md) | Reports & Analytics |
| [PHASE_06_ONLINE_ORDERING.md](./PHASE_06_ONLINE_ORDERING.md) | Online Ordering Pro |
| [PHASE_07_STAFF_PAYROLL.md](./PHASE_07_STAFF_PAYROLL.md) | Staff & Payroll |
| [PHASE_08_MULTI_OUTLET.md](./PHASE_08_MULTI_OUTLET.md) | Multi-Outlet |
| [PHASE_09_AI_WHATSAPP.md](./PHASE_09_AI_WHATSAPP.md) | AI & WhatsApp |

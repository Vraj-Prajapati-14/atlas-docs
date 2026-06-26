# ARCH-001 — System Architecture and Technology Stack

| Field          | Value                                       |
| -------------- | ------------------------------------------- |
| Document ID    | ARCH-001                                    |
| Title          | RestaurantOS — System Architecture          |
| Version        | 1.0.0                                       |
| Status         | Draft                                       |
| Category       | Technical Architecture                      |
| Author         | Vraj Prajapati                              |
| Classification | Confidential — Internal Use Only            |
| Last Updated   | 2026-06-25                                  |

---

# 1. Architecture Philosophy

RestaurantOS is designed as a cloud-native, microservices-based SaaS platform.

The architecture follows three hard rules:

1. **Failure isolation** — A kitchen display going down must not affect billing
2. **Independent scaling** — The analytics service scales independently from the billing service
3. **Offline survivability** — Core restaurant functions work without internet for 72 hours

---

# 2. Technology Stack Decision Record

## 2.1 Backend Services

| Layer | Technology | Version | Decision Rationale |
|---|---|---|---|
| API Runtime | Node.js | 22 LTS | Async I/O, large ecosystem, team expertise |
| API Framework | Fastify | 4.x | 2x faster than Express, built-in TypeScript, schema validation |
| Language | TypeScript | 5.x | Type safety across 600+ APIs, reduces runtime errors |
| ORM | Prisma | 5.x | Type-safe queries, migrations, multi-DB support |
| AI Services | Python | 3.12 | Industry standard for ML/AI; separate service |
| AI Framework | FastAPI | 0.x | High performance, OpenAPI auto-generation |

**Why not Go?** Team velocity advantage of TypeScript outweighs Go's performance for this use case. AI services in Python are non-negotiable.

**Why not Django?** FastAPI is 3x faster with async support; Django too heavy for microservices.

## 2.2 Frontend

| Layer | Technology | Version | Decision Rationale |
|---|---|---|---|
| Web Framework | Next.js | 14+ | SSR + SSG, App Router, superior performance |
| Language | TypeScript | 5.x | Type safety for complex restaurant forms |
| State Management | Zustand | 4.x | Lightweight, performant, simple API |
| Data Fetching | TanStack Query | 5.x | Server state, caching, offline mutations |
| UI Component Base | shadcn/ui | Latest | Accessible, customizable, no overhead |
| CSS | Tailwind CSS | 3.x | Rapid UI development, consistent design |
| Forms | React Hook Form + Zod | Latest | Performance, schema validation |
| Charts | Recharts | 2.x | React-native charts for dashboards |
| Tables | TanStack Table | 8.x | Virtual scrolling for large datasets |
| Offline | Workbox + IndexedDB | Latest | PWA offline billing capability |

## 2.3 Mobile App

| Layer | Technology | Version | Decision Rationale |
|---|---|---|---|
| Framework | React Native | 0.73+ | Code sharing with web, large talent pool |
| Navigation | React Navigation | 6.x | De-facto standard |
| State | Zustand | 4.x | Same as web for consistency |
| Offline Sync | WatermelonDB | Latest | High-performance local DB for offline |
| Build | Expo (bare workflow) | Latest | Faster builds, OTA updates |

**Targets:** Android 10+, iOS 15+

## 2.4 Database

| Use Case | Technology | Rationale |
|---|---|---|
| Primary Data Store | PostgreSQL 16 | ACID, complex queries, JSON support, mature |
| Caching Layer | Redis 7.x | Session cache, rate limiting, real-time counters |
| Message Queue | Apache Kafka | High-throughput event streaming, replay |
| Search | Elasticsearch 8.x | Full-text search on menus, customers, orders |
| Time-Series Analytics | TimescaleDB | Extension on Postgres for sales analytics |
| Document Storage | MongoDB | Flexible schema for audit logs (Phase 2) |
| File Storage | AWS S3 | Receipts, menu images, reports |

**Why PostgreSQL over MySQL?** Better JSON support, LATERAL joins, better partitioning, superior concurrent write performance.

## 2.5 Infrastructure

| Layer | Technology | Rationale |
|---|---|---|
| Cloud Provider | AWS | Primary cloud, best India region support |
| Container Runtime | Docker | Standard containerization |
| Container Orchestration | Kubernetes (EKS) | Auto-scaling, self-healing, rollback |
| Service Mesh | Istio | mTLS between services, traffic management |
| API Gateway | Kong | Rate limiting, auth, request routing |
| CDN | Cloudflare | Global CDN + WAF + DDoS protection |
| Load Balancer | AWS ALB | L7 load balancing with health checks |
| IaC | Terraform | Infrastructure as code, reproducible |
| Secrets | AWS Secrets Manager | Centralized secret management |
| DNS | Cloudflare | Anycast DNS with DDoS protection |

## 2.6 DevOps and CI/CD

| Tool | Purpose |
|---|---|
| GitHub | Source control |
| GitHub Actions | CI/CD pipeline |
| ArgoCD | GitOps deployment |
| SonarQube | Code quality and security scanning |
| Trivy | Container vulnerability scanning |
| Helm | Kubernetes package management |
| DataDog | APM, logs, metrics, uptime monitoring |
| PagerDuty | On-call alerting |
| Sentry | Error tracking |

## 2.7 AI and Machine Learning

| Component | Technology |
|---|---|
| LLM Provider | Anthropic Claude (claude-sonnet-4-6) |
| Embedding Model | text-embedding-3-large (OpenAI) |
| Vector Database | Pinecone |
| ML Framework | scikit-learn, XGBoost, Prophet |
| ML Training | AWS SageMaker |
| ML Serving | Seldon Core on Kubernetes |
| Feature Store | AWS SageMaker Feature Store |

---

# 3. Microservices Architecture

## 3.1 Service Catalog

| Service | Responsibility | DB | Port |
|---|---|---|---|
| identity-service | Auth, users, roles, permissions | PostgreSQL | 3001 |
| tenant-service | Restaurant, branch, config management | PostgreSQL | 3002 |
| menu-service | Menu, items, modifiers, recipes | PostgreSQL | 3003 |
| order-service | Orders, KOTs, order lifecycle | PostgreSQL | 3004 |
| kitchen-service | KDS, kitchen workflows, ticket management | PostgreSQL | 3005 |
| billing-service | Bills, invoices, payments, GST | PostgreSQL | 3006 |
| inventory-service | Stock, GRN, wastage, audit | PostgreSQL | 3007 |
| procurement-service | Vendors, POs, quotations | PostgreSQL | 3008 |
| customer-service | CRM, customer profiles, segments | PostgreSQL | 3009 |
| loyalty-service | Points, tiers, redemptions | PostgreSQL | 3010 |
| delivery-service | Aggregator integration, rider management | PostgreSQL | 3011 |
| hr-service | Staff, attendance, leave | PostgreSQL | 3012 |
| payroll-service | Payroll calculations, payslips | PostgreSQL | 3013 |
| finance-service | Expenses, P&L, cash management | PostgreSQL | 3014 |
| notification-service | WhatsApp, SMS, push, email dispatch | Redis | 3015 |
| analytics-service | Reports, dashboards, data aggregation | TimescaleDB | 3016 |
| ai-service | AI recommendations, forecasting, insights | Python/FastAPI | 3017 |
| audit-service | Immutable audit log management | PostgreSQL | 3018 |
| search-service | Full-text search across entities | Elasticsearch | 3019 |
| file-service | File upload, image processing, S3 management | S3 | 3020 |
| webhook-service | Outbound webhooks, integrations | PostgreSQL | 3021 |
| offline-sync-service | Offline data sync for field devices | PostgreSQL | 3022 |

## 3.2 System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                         INTERNET / CLIENT                               │
│          Web App    Mobile App    3rd Party Integrations                │
└────────────────────────────┬───────────────────────────────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │    Cloudflare CDN    │
                   │    WAF + DDoS        │
                   └──────────┬──────────┘
                              │
                   ┌──────────▼──────────┐
                   │     AWS ALB          │
                   │   Load Balancer      │
                   └──────────┬──────────┘
                              │
                   ┌──────────▼──────────┐
                   │    Kong API Gateway  │
                   │  Auth | Rate Limit  │
                   │  Routing | Logging  │
                   └────────┬────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
┌────────▼──────┐  ┌────────▼──────┐  ┌───────▼───────┐
│  identity-svc │  │  tenant-svc   │  │   menu-svc    │
└───────────────┘  └───────────────┘  └───────────────┘
         │                  │                  │
┌────────▼──────┐  ┌────────▼──────┐  ┌───────▼───────┐
│  order-svc    │  │  billing-svc  │  │  kitchen-svc  │
└───────────────┘  └───────────────┘  └───────────────┘
         │                  │                  │
┌────────▼──────┐  ┌────────▼──────┐  ┌───────▼───────┐
│ inventory-svc │  │ customer-svc  │  │ delivery-svc  │
└───────────────┘  └───────────────┘  └───────────────┘
         │                  │
   ┌─────▼──────────────────▼──────┐
   │           Kafka                │
   │    Event Streaming Bus         │
   └─────┬──────────────────┬──────┘
         │                  │
┌────────▼──────┐  ┌────────▼──────┐
│ analytics-svc │  │   ai-svc      │
└───────────────┘  └───────────────┘
         │                  │
┌────────▼──────┐  ┌────────▼──────┐
│notification-sv│  │  audit-svc    │
└───────────────┘  └───────────────┘
```

---

# 4. Event-Driven Architecture

## 4.1 Kafka Topics

| Topic | Producer | Consumers | Payload |
|---|---|---|---|
| `order.created` | order-service | kitchen-svc, inventory-svc, analytics-svc | Order details |
| `order.item.added` | order-service | kitchen-svc | Item + modifiers |
| `order.item.voided` | order-service | kitchen-svc, billing-svc | Item void reason |
| `order.completed` | order-service | billing-svc, analytics-svc | Final order |
| `bill.generated` | billing-service | loyalty-svc, analytics-svc, notification-svc | Bill summary |
| `bill.paid` | billing-service | loyalty-svc, crm-svc, analytics-svc | Payment details |
| `bill.voided` | billing-service | audit-svc, notification-svc | Void reason |
| `inventory.low_stock` | inventory-service | notification-svc, ai-svc | Item + current qty |
| `inventory.out_of_stock` | inventory-service | order-svc, notification-svc | Item ID |
| `inventory.grn_created` | inventory-service | analytics-svc, finance-svc | GRN details |
| `inventory.wastage_recorded` | inventory-service | analytics-svc, ai-svc | Wastage details |
| `delivery.order_received` | delivery-service | kitchen-svc, notification-svc | Aggregator order |
| `delivery.order_delivered` | delivery-service | analytics-svc, loyalty-svc | Delivery status |
| `customer.visited` | billing-service | crm-svc, loyalty-svc, analytics-svc | Visit + spend |
| `loyalty.points_redeemed` | loyalty-service | billing-svc, analytics-svc | Redemption |
| `staff.clocked_in` | hr-service | analytics-svc, notification-svc | Staff + time |
| `ai.recommendation_ready` | ai-service | notification-svc, analytics-svc | Recommendation |

## 4.2 Event Sourcing for Critical Data

Order lifecycle is event-sourced for complete auditability:

```
OrderCreated → ItemAdded → ItemAdded → KOTSent →
ItemPreparing → ItemReady → ItemServed →
BillRequested → BillGenerated → PaymentRecorded → BillClosed
```

Every state transition is a durable event. State can be rebuilt from events at any time.

---

# 5. Offline Architecture

## 5.1 Offline Capability Requirements

| Function | Offline Required | Storage | Sync Strategy |
|---|---|---|---|
| Billing | Yes (critical) | IndexedDB / WatermelonDB | Conflict-free sync on reconnect |
| Order Taking | Yes | Local DB | Queue-based sync |
| KDS Display | Yes | Local cache | Reconnect refresh |
| Menu browsing | Yes | Local cache | Delta sync every 6 hours |
| Reports | No | N/A | Online only |
| Inventory | Partial | Local cache | Read-only offline |

## 5.2 Offline Sync Strategy

```
Device goes offline
       ↓
All writes go to local IndexedDB queue
       ↓
Operations continue normally
       ↓
Device reconnects
       ↓
Sync service detects connection
       ↓
Flush local queue to server
       ↓
Conflict resolution:
  Bills: Server timestamp wins (no overwrite, append)
  Inventory: Manual resolution if conflict
       ↓
Server confirms sync
       ↓
Local queue cleared
```

---

# 6. Multi-Tenancy Architecture

## 6.1 Tenancy Model

RestaurantOS uses a **schema-per-tenant** model for PostgreSQL.

```
PostgreSQL Cluster
│
├── schema: public           (shared platform tables)
├── schema: tenant_abc123    (Restaurant Group A)
├── schema: tenant_def456    (Restaurant Group B)
└── schema: tenant_xyz789    (Restaurant Group C)
```

**Advantages:**
- Complete data isolation between tenants
- Easier compliance (GDPR, data deletion)
- No cross-tenant data leak risk
- Independent schema migrations per tenant

**Trade-off:** Higher DB connection overhead → mitigated by connection pooling (PgBouncer).

## 6.2 Tenant Data Flow

```
Request → API Gateway → Extract tenant_id from JWT
       ↓
Service sets PostgreSQL search_path to tenant schema
       ↓
All queries scoped to tenant automatically
       ↓
Response returned with tenant data only
```

---

# 7. API Gateway Configuration

| Feature | Configuration |
|---|---|
| Authentication | JWT validation at gateway level |
| Rate Limiting | 1000 req/min per API key; 100 req/min for auth endpoints |
| Request Routing | Path-based routing to microservices |
| Request Transformation | Header injection (tenant_id, user_id) |
| Response Caching | GET endpoints, 30-second TTL |
| Circuit Breaker | Open after 50% errors in 1 minute |
| Request Logging | All requests logged with correlation ID |
| API Versioning | URL versioning: /api/v1/, /api/v2/ |

---

# 8. Deployment Architecture

## 8.1 Environments

| Environment | Purpose | Scale | Data |
|---|---|---|---|
| Development | Local developer testing | Single pod | Seed data |
| Staging | Pre-production testing | 1/4 production scale | Anonymized production clone |
| Production | Live customer traffic | Full scale | Real data |
| DR (Disaster Recovery) | Failover | 1/2 production scale | Real-time replica |

## 8.2 Production Infrastructure

```
Availability Zones: 3 (ap-south-1a, 1b, 1c)

Kubernetes Nodes: Auto-scaling 10–50 nodes
  - m5.4xlarge: API services
  - c5.2xlarge: Kafka brokers
  - r5.2xlarge: PostgreSQL primary (RDS)

PostgreSQL: RDS Multi-AZ, read replicas in each AZ
Redis: ElastiCache cluster, 3 nodes
Kafka: MSK (3 brokers, cross-AZ)
Elasticsearch: 3-node cluster

S3: Versioned bucket, cross-region replication to ap-southeast-1
CloudFront: Static asset CDN
```

## 8.3 Scaling Strategy

| Service | Scaling Trigger | Min Pods | Max Pods |
|---|---|---|---|
| billing-service | CPU > 60% or RPS > 500 | 3 | 50 |
| order-service | CPU > 60% or queue depth > 1000 | 3 | 30 |
| analytics-service | Schedule (peak hours) + CPU | 2 | 20 |
| notification-service | Queue depth > 500 | 2 | 20 |
| ai-service | Custom metric (request queue) | 1 | 10 |

---

# 9. Monitoring and Observability

## 9.1 Three Pillars

**Metrics (DataDog)**
- Service-level: RPS, error rate, latency (p50, p95, p99)
- Business-level: Bills/hour, orders/hour, active sessions
- Infrastructure: CPU, memory, disk, network

**Logs (DataDog Log Management)**
- Structured JSON logs from all services
- Correlation ID through entire request chain
- Log levels: ERROR, WARN, INFO, DEBUG

**Traces (DataDog APM)**
- Distributed tracing across all microservices
- Automatic instrumentation via OpenTelemetry
- Flame graphs for performance debugging

## 9.2 Alerting Rules

| Alert | Threshold | Action |
|---|---|---|
| API error rate | > 1% for 5 minutes | Page on-call |
| P99 latency | > 2000ms for 5 minutes | Page on-call |
| Billing service down | 0 healthy pods | Page CEO + CTO (P1) |
| Database replication lag | > 60 seconds | Page on-call |
| Disk usage | > 80% | Ticket + alert |
| Kafka consumer lag | > 10,000 messages | Alert engineering |

---

# 10. Architecture Decision Records (ADR)

| ADR ID | Decision | Rationale |
|---|---|---|
| ADR-001 | Node.js over Go for API services | Team velocity, ecosystem, sufficient performance |
| ADR-002 | PostgreSQL over MySQL | Better JSON, partitioning, concurrent write performance |
| ADR-003 | Schema-per-tenant over shared schema | Data isolation, compliance, independent migrations |
| ADR-004 | Kafka over RabbitMQ | Event replay capability, higher throughput, better at scale |
| ADR-005 | Offline-first for billing | Restaurants cannot afford downtime during service |
| ADR-006 | Next.js over SPA | SEO for marketing site, SSR for performance |
| ADR-007 | React Native over Flutter | Larger team talent pool, code sharing with web |
| ADR-008 | Kong over custom API gateway | Production-grade, plugin ecosystem, avoids NIH syndrome |
| ADR-009 | Claude for LLM | Best-in-class reasoning, context window, safety |
| ADR-010 | AWS ap-south-1 primary | Data residency (India), best latency from Indian cities |

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial Architecture Document |

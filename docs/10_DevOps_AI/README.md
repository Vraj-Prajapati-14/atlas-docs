# OPS-001 — DevOps, Infrastructure and AI Architecture

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| Document ID    | OPS-001                                      |
| Title          | RestaurantOS — DevOps, Infra and AI          |
| Version        | 1.0.0                                        |
| Status         | Draft                                        |
| Category       | DevOps and AI Architecture                   |
| Author         | Vraj Prajapati                               |
| Classification | Confidential — Internal Use Only             |
| Last Updated   | 2026-06-25                                   |

---

# PART 1: DEVOPS AND INFRASTRUCTURE

---

# 1. Infrastructure Overview

## 1.1 Cloud Infrastructure Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS ap-south-1 (Mumbai)                           │
│                                                                      │
│  ┌────────────────── VPC: 10.0.0.0/16 ──────────────────┐          │
│  │                                                        │          │
│  │  ┌─── Public Subnet ───┐  ┌──── Private Subnet ────┐ │          │
│  │  │  ALB (HTTPS only)   │  │  EKS Node Groups       │ │          │
│  │  │  NAT Gateway        │  │  RDS (PostgreSQL)      │ │          │
│  │  │  Bastion (SSH)      │  │  ElastiCache (Redis)   │ │          │
│  │  └────────────────────┘  │  MSK (Kafka)            │ │          │
│  │                           │  Elasticsearch          │ │          │
│  │                           └────────────────────────┘ │          │
│  └────────────────────────────────────────────────────────┘          │
│                                                                      │
│  S3 Buckets:  receipts, images, reports, backups                    │
│  CloudFront: static assets CDN                                      │
│  Route 53: DNS                                                       │
│  Secrets Manager: all credentials                                   │
│  KMS: encryption keys                                               │
└─────────────────────────────────────────────────────────────────────┘
```

## 1.2 Kubernetes Cluster (EKS)

### Node Pools

| Pool Name | Instance Type | Min | Max | Purpose |
|---|---|---|---|---|
| api-pool | m5.2xlarge | 3 | 30 | API services |
| worker-pool | c5.2xlarge | 2 | 20 | Background workers, Kafka consumers |
| ai-pool | g4dn.xlarge (GPU) | 1 | 5 | AI inference (when needed) |
| monitoring-pool | m5.xlarge | 2 | 2 | DataDog agents, logging |

### Autoscaling

```yaml
# Horizontal Pod Autoscaler example for billing-service
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 3
  maxReplicas: 50
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "500"
```

---

# 2. CI/CD Pipeline

## 2.1 Pipeline Overview

```
Developer pushes code
       ↓
GitHub receives push
       ↓
GitHub Actions triggers pipeline
       ↓
Stage 1: Code Quality (parallel)
  ├── TypeScript compilation (tsc)
  ├── ESLint + Prettier check
  ├── SonarQube analysis
  └── Dependency vulnerability scan (npm audit)
       ↓
Stage 2: Testing (parallel)
  ├── Unit tests (Jest)
  ├── Integration tests (testcontainers)
  └── Contract tests (Pact)
       ↓
Stage 3: Security Scan
  ├── SAST (Semgrep)
  ├── Container scan (Trivy)
  └── Secret scan (Gitleaks)
       ↓
Stage 4: Build
  ├── Docker image build
  └── Push to ECR (private registry)
       ↓
Stage 5: Deploy to Staging
  ├── Helm chart update
  ├── ArgoCD detects change
  ├── Rolling deployment
  └── Smoke tests run
       ↓
Stage 6: Manual Gate (for production)
  └── Engineering Lead approves
       ↓
Stage 7: Deploy to Production
  ├── Blue/Green or Canary deployment
  ├── Health check monitoring
  └── Auto-rollback on error
```

## 2.2 Branch Strategy

| Branch | Purpose | Deploy Target | Protection |
|---|---|---|---|
| `feature/*` | Feature development | None (local only) | None |
| `develop` | Integration branch | Dev environment | PR required |
| `staging` | Pre-production | Staging environment | PR + 1 review |
| `main` | Production code | Production | PR + 2 reviews + tests pass |
| `hotfix/*` | Critical fixes | Production (fast path) | PR + lead approval |

## 2.3 Deployment Strategies

### Blue/Green Deployment (Default for Production)
```
Current (Blue): v1.2.3 — 100% traffic
       ↓
Deploy Green: v1.2.4 — 0% traffic
       ↓
Run smoke tests on Green
       ↓
Shift 10% traffic to Green
       ↓
Monitor for 5 minutes (error rate, latency)
       ↓
If healthy: shift 100% traffic to Green
If unhealthy: shift 100% back to Blue immediately
       ↓
Blue becomes standby for rollback (30 minutes)
```

### Canary Deployment (For High-Risk Changes)
```
Deploy canary: 5% traffic for 30 minutes
Monitor metrics vs. baseline
If within threshold: promote to 25% → 50% → 100%
If anomaly: auto-rollback
```

---

# 3. Monitoring and Observability

## 3.1 Metrics Dashboard (DataDog)

### Service Level Objectives (SLOs)

| Service | SLO | Error Budget |
|---|---|---|
| Billing API | 99.95% success rate | 21.9 minutes/month |
| Order API | 99.9% success rate | 43.8 minutes/month |
| Full Platform | 99.9% uptime | 8.7 hours/year |

### Golden Signals (Monitored per Service)

| Signal | Metric | Alert Threshold |
|---|---|---|
| Latency | P99 response time | > 1500ms |
| Traffic | Requests per second | Baseline ± 50% |
| Errors | Error rate (5xx) | > 0.5% |
| Saturation | CPU + Memory | > 80% |

## 3.2 Business Metrics Dashboard

Real-time business KPIs tracked alongside technical metrics:

| Metric | Update Frequency | Alert |
|---|---|---|
| Bills generated per hour | Real-time | Drop > 30% vs. avg |
| Payment success rate | Real-time | < 98% |
| KOT to kitchen latency | Real-time | > 2 seconds |
| Aggregator order acceptance | Real-time | < 95% |
| Offline sync queue depth | Real-time | > 1,000 items |

## 3.3 Log Management

**Log Format (Structured JSON):**
```json
{
  "timestamp": "2026-06-25T21:45:00.000Z",
  "level": "INFO",
  "service": "billing-service",
  "version": "1.2.4",
  "request_id": "uuid",
  "tenant_id": "uuid",
  "outlet_id": "uuid",
  "user_id": "uuid",
  "action": "BILL_CREATED",
  "duration_ms": 87,
  "message": "Bill INV-2026-08234 created successfully",
  "metadata": { "bill_id": "uuid", "amount": 107500 }
}
```

**Log Levels:**
- `ERROR` — Exceptions, failures requiring investigation
- `WARN` — Non-critical issues, degraded functionality
- `INFO` — Significant business events (bill created, payment processed)
- `DEBUG` — Detailed diagnostic (disabled in production by default)

---

# 4. Database Operations

## 4.1 Backup Strategy

| Type | Frequency | Retention | Storage |
|---|---|---|---|
| Automated snapshot | Daily | 30 days | AWS RDS automated |
| Transaction log backup | Continuous | 7 days | AWS RDS |
| Weekly full backup | Weekly | 90 days | S3 Glacier |
| Monthly archive | Monthly | 7 years | S3 Glacier Deep Archive |

## 4.2 Disaster Recovery

| Scenario | RTO | RPO | Action |
|---|---|---|---|
| Single service failure | < 2 min | 0 | Kubernetes auto-restart |
| Availability zone failure | < 5 min | < 1 min | Multi-AZ failover |
| Region failure | < 30 min | < 5 min | DR region activation |
| Data corruption | < 4 hours | < 15 min | Point-in-time restore |

## 4.3 Zero-Downtime Migrations

Every database migration must be:
1. Backwards compatible (old code works with new schema)
2. Deployed to production before code change
3. Cleaned up in a separate migration after 2 deploys

```
Step 1: Add nullable column (old code unaware)
Step 2: Deploy new code (reads new column if present)
Step 3: Backfill existing rows
Step 4: Add NOT NULL constraint
Step 5: Remove old column (after old code retired)
```

---

# PART 2: AI ARCHITECTURE

---

# 5. AI Vision

RestaurantOS AI is a decision engine, not a reporting tool.

The difference:

```
REPORTING (what everyone else does):
"Revenue dropped 18% last Tuesday."

DECISION ENGINE (what Atlas does):
"Revenue dropped 18% last Tuesday because:
  • Rain reduced walk-in covers by 31%
  • Butter Chicken and Biryani were 86'd by 6:30 PM
  • Swiggy had a competitor promotion running

Recommended actions:
  1. Pre-order 20% more chicken on forecast-rain days ← ACTIONABLE
  2. Set automatic reorder alert for top 10 items ← ACTIONABLE
  3. Enable Rain Day special offer automatically ← ACTIONABLE"
```

---

# 6. AI Module Catalog

## 6.1 Demand Forecast AI

**Purpose:** Predict how many covers, which dishes, and how much inventory will be needed.

**Inputs:**
- Historical sales (24 months)
- Day of week
- Time of day
- Weather data (Open-Meteo API)
- Local events (public holidays, cricket matches, festivals)
- Aggregator trend data

**Outputs:**
- Cover forecast: next 7 days, by meal period
- Item-level demand forecast: top 50 items
- Inventory requirement forecast: linked to demand

**Model:** Facebook Prophet (time-series) + XGBoost (feature-based ensemble)

**Trigger:** Daily at 11 PM for next 7 days

**Accuracy Target:** Within 15% of actual for 80% of forecasts

---

## 6.2 Inventory Optimization AI

**Purpose:** Eliminate stockouts and overstocking by predicting optimal purchase quantities.

**Inputs:**
- Current stock levels
- Consumption history
- Demand forecast
- Vendor lead times
- Minimum order quantities
- Shelf life per item

**Outputs:**
- Daily purchase recommendations per item per vendor
- Suggested order date per item
- "Safe to skip" alerts (item will last without ordering)
- Alert when consumption deviates from recipe (theft/waste indicator)

**Model:** Inventory optimization using demand forecast + safety stock formula

---

## 6.3 Price Intelligence AI

**Purpose:** Identify pricing opportunities to increase revenue without losing covers.

**Inputs:**
- Item-level demand elasticity (historical)
- Competitor pricing (Zomato/Swiggy price scraping)
- Time-of-day and day-of-week patterns
- Item margin data
- Customer price sensitivity segments

**Outputs:**
- "Safe to increase price" recommendations with confidence %
- Time-based pricing suggestions (raise prices on Friday nights)
- Combo pricing recommendations (bundle items that are often ordered together)
- Menu items with margin below target — raise price or reduce cost

---

## 6.4 Waste Prediction AI

**Purpose:** Predict which items will be wasted today and take action before it happens.

**Inputs:**
- Current inventory levels
- Demand forecast
- Historical wastage patterns
- Day of week / weather

**Outputs:**
- Items at risk of wastage today
- Suggested actions: feature as today's special, create combo deal, alert chef to prep less

---

## 6.5 Customer Churn Prediction AI

**Purpose:** Identify customers who are at risk of not returning before they leave.

**Inputs:**
- Visit frequency history
- Average days between visits
- Last visit date
- Spend trend (increasing, flat, decreasing)
- Feedback scores

**Outputs:**
- Churn risk score per customer (0–100)
- Segmentation: At Risk, Slipping, Healthy
- Recommended action per segment (discount offer, personal message, birthday offer)

**Trigger:** Daily — AI scores all customers and flags those whose churn risk increased

---

## 6.6 Revenue Anomaly Detection AI

**Purpose:** Detect unusual patterns in revenue data that indicate fraud, errors, or opportunities.

**What it detects:**
- Cash discrepancies above statistical threshold
- Unusual void or discount patterns by cashier
- Revenue drop without operational explanation
- Unusually high return / refund rate
- Order value manipulation (items added then removed without billing)
- Aggregator settlement discrepancies

**Alert Format:**
```
⚠ ANOMALY DETECTED — Branch 2
Cashier Ravi Kumar has processed 8 voids today (avg: 1.2/day).
All voids are ₹200–₹400 cash bills.
This pattern has 87% correlation with cash theft in historical data.
Action required: Review void records and CCTV for today.
```

---

## 6.7 Restaurant Copilot (LLM — Claude)

**Purpose:** Answer any business question in natural language.

**Capabilities:**

| Query Example | Response Type |
|---|---|
| "Why did revenue drop last Tuesday?" | Root cause analysis |
| "What should I order today?" | Inventory recommendation |
| "Which items should I remove from menu?" | Menu optimization |
| "Show me my worst performing branch" | Comparative analytics |
| "What's my food cost % for chicken?" | Financial calculation |
| "Who is my best customer this month?" | CRM insight |
| "How many staff do I need for Saturday?" | Staffing recommendation |

**Technical Implementation:**

```python
# RAG (Retrieval Augmented Generation) Pipeline

1. User asks question via mobile app
2. Question embedded via text-embedding-3-large
3. Relevant context retrieved from vector store:
   - Outlet metrics
   - Historical patterns
   - Business rules
4. Prompt constructed:
   System: "You are RestaurantOS AI for [Restaurant Name]. 
            Answer business questions using data provided.
            Always give actionable recommendations."
   User: "[question]"
   Context: "[retrieved data]"
5. Claude claude-sonnet-4-6 generates response
6. Response cached for 30 minutes (same question, same data)
7. Response returned to user with data sources cited
```

---

## 6.8 AI Operations Copilot

**Purpose:** Proactively push insights to the owner without them asking.

**Daily Briefing (Sent at 7 AM via WhatsApp):**
```
Good morning Priya 👋

📊 Yesterday's Snapshot:
  Revenue: ₹54,200 (▲12% vs last week)
  Best performer: Butter Chicken (43 orders)

🤖 AI Says:
  1. It will rain this afternoon — cover count may drop 20%
     → Consider enabling "Monsoon Special" combo offer
  
  2. Stock alert: Chicken falls below par by 3 PM if forecast holds
     → Place order by 11 AM (Vendor: Sachin Meats)
  
  3. Loyalty: 23 customers haven't visited in 30+ days
     → Auto win-back campaign ready — tap to send

📋 Needs your attention:
  • Cash variance ₹220 at Branch 2 (from last night)
  • PO approval pending: Vegetables ₹8,400
```

---

# 7. AI Technical Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    AI Service Layer                        │
│  (Python, FastAPI, deployed as separate microservice)     │
│                                                           │
│  ┌────────────────────┐  ┌───────────────────────────┐  │
│  │  Forecast Engine   │  │  Anomaly Detection Engine │  │
│  │  (Prophet + XGB)   │  │  (Isolation Forest + ML)  │  │
│  └────────────────────┘  └───────────────────────────┘  │
│                                                           │
│  ┌────────────────────┐  ┌───────────────────────────┐  │
│  │  Recommendation    │  │  Copilot (RAG + Claude)   │  │
│  │  Engine            │  │                           │  │
│  └────────────────────┘  └───────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Feature Pipeline                           │  │
│  │  Raw Events → Feature Engineering → Feature Store  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
         ↓                              ↓
  TimescaleDB                    AWS SageMaker
  (Feature store)               (Model training)
         ↓
  Pinecone Vector DB
  (RAG retrieval)
```

## 7.1 Model Training Pipeline

```
Nightly at 1 AM:
  Pull 6-month sales data from analytics DB
  Feature engineering: lag features, rolling averages, external signals
  Retrain demand forecast model (Prophet)
  Validate against last 7 days (MAPE calculation)
  If MAPE < 15%: deploy to production
  If MAPE ≥ 15%: alert engineering, keep previous model
  Log model performance to MLflow
```

## 7.2 AI Cost Management

| Component | Estimated Cost | Optimization |
|---|---|---|
| Claude API (Copilot) | $0.003/1K input, $0.015/1K output | Cache frequent questions, RAG reduces token usage |
| OpenAI Embeddings | $0.0001/1K tokens | Batch embed, cache vectors |
| SageMaker training | $0.50/hour (m5.xlarge) | Nightly 30-min runs = $15/month |
| Pinecone | $70/month (starter) | Per-tenant namespace |
| Total AI cost (1,000 restaurants) | ~$500/month | $0.50/restaurant/month |

---

# 8. Testing Strategy

## 8.1 Testing Pyramid

```
         ┌───────────────┐
         │  E2E Tests    │  ← 5% (Cypress, critical paths only)
         │   (Slow)      │
       ┌─┴───────────────┴─┐
       │ Integration Tests  │  ← 20% (API + DB, real containers)
       │   (Medium)        │
     ┌─┴───────────────────┴─┐
     │     Unit Tests         │  ← 75% (fast, isolated, mocked)
     │     (Fast)             │
     └───────────────────────┘
```

## 8.2 Coverage Requirements

| Type | Minimum Coverage | Critical Paths |
|---|---|---|
| Unit tests | 80% line coverage | Billing, tax calculation: 100% |
| Integration tests | All API endpoints | All billing flows: 100% |
| E2E tests | 10 critical user journeys | Bill creation to payment: always |

## 8.3 Performance Testing

| Test | Tool | Frequency | Pass Criteria |
|---|---|---|---|
| Load test | k6 | Pre-release | P99 < 1500ms at 500 RPS |
| Stress test | k6 | Monthly | System stable at 2x expected peak |
| Billing load test | k6 | Every release | 100 bills/second, < 500ms P95 |
| Offline sync test | Custom | Every release | 72 hours offline, 100% sync accuracy |

---

# Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-06-25 | Vraj Prajapati | Initial DevOps + AI Document |

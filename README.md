# Finance Tracker API

A **NestJS-based Finance Tracker API** designed for high-performance financial data handling, including transaction management, budgeting, summaries, and load/stress testing. Optimized for testing caching strategies, authentication, and API performance under various scenarios.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Testing & Performance](#testing--performance)
- [Load & Stress Test Results](#load--stress-test-results)
- [Setup & Run](#setup--run)
- [CI/CD](#cicd)
- [Key Achievements](#key-achievements)

---

## Project Overview

The Finance Tracker API allows users to:

- Register and login securely
- Track transactions (income/expenses)
- Manage budgets and monitor remaining amounts
- Generate financial summaries, including category-based reports

The project includes **unit testing, load testing, stress testing, spike testing, and rate limiting strategies** for robust, production-ready API performance evaluation.

---

## Tech Stack

- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL (hosted on Render)
- **ORM:** TypeORM
- **Authentication:** JWT-based
- **Testing:** Jest (unit & coverage ≥ 80%)
- **Load & Stress Testing:** k6
- **Deployment:** Render (Docker & Web Services)
- **Reverse Proxy / Load Balancing (experimental):** Nginx
- **Other Tools:** pnpm, Docker, Faker.js (mock data generation)

---

## Features

### User Management

- Register new users with hashed passwords
- Login and generate JWT tokens
- Fetch user info securely

### Transactions

- CRUD operations for transactions
- Support for large datasets (e.g., 10,000+ records)
- Optional caching layer for performance comparison

### Budgeting

- Create budgets per category
- Get budgets and remaining amounts
- Summarize spending per category

### Financial Summaries

- Monthly total income, expense, net balance
- Category-wise breakdowns

### Mock Data Generation

- Generate up to 50,000 users and 100,000 transactions for testing
- Generate budget data per user and category

---

## Architecture

```bash
Client / Load Tester
|
v
Nginx Reverse Proxy (optional)
|
v
┌───────────────┐ ┌───────────────┐
│ Transaction API│ ----> │ Cached API │
└───────────────┘ └───────────────┘
|
v
PostgreSQL DB
```

- Optional Nginx reverse proxy for caching comparison
- Separate endpoints for cached and non-cached APIs for load testing
- PostgreSQL snapshots used for efficient spending/transaction calculations

---

## Testing & Performance

- **Unit Tests:**

  - Coverage ≥ 80% across services, controllers, middleware, interceptors, and logging

- **Load & Stress Testing (k6):**

  - Compare cached vs non-cached endpoints
  - Stress and spike testing for 10,000+ transactions

- **Rate Limiting:**

  - Strategies designed for high-risk endpoints (login, register, transactions)

- **Mock Data Generation:**
  - Large-scale data creation using Faker.js

---

## Load & Stress Test Results

We performed comprehensive **performance testing** using **k6** to evaluate the Finance Tracker API under high load and compare **cached vs non-cached endpoints**.

### 1. Testing Context

- **Server / Render instance:**: 1 server instance + two testing backend APIs (cached and non-cached)
- **CPU:** 0.5 vCPU (Render free / standard instance)
- **RAM:** 512 MB
- **Network:** Public Render subdomain, 100GB bandwidth per month
- **Endpoints Tested:**
  - `/transaction` (non-cached)
  - `/transaction/cache` (in-memory cache)
- **Tool:** k6
- **Purpose:** Compare performance impact of caching, evaluate throughput, and measure latency under load.

---

### 2. Smoke Test

**Scenario:** 3 virtual users over 1 minute

| Metric              | Non-Cached API | Cached API |
| ------------------- | -------------- | ---------- |
| Avg Response Time   | 2.36s          | 868.42ms   |
| P90 Response Time   | 3.06s          | 1.29s      |
| P95 Response Time   | 3.15s          | 1.3s       |
| Max Response Time   | 3.39s          | 3.83s      |
| Min Response Time   | 1.45s          | 442.74 ms  |
| Requests per Second | 0.44           | 0.79       |
| Failed Requests     | 0%             | 0%         |

**Observations:**

- Cached API significantly reduces latency and increases throughput.
- Non-cached API struggles under load, especially for large datasets.

---

### 3. Stress Test

**Scenario:** Ramp up from 10 to 100 virtual users over 5 minutes

| Metric              | Non-Cached API | Cached API |
| ------------------- | -------------- | ---------- |
| Avg Response Time   | 25.97s         | 7.99s      |
| P90 Response Time   | 1m             | 16.79s     |
| P95 Response Time   | 1m             | 21.3s      |
| Max Response Time   | 1m             | 58.49s     |
| Min Response Time   | 195.14ms       | 480.38ms   |
| Requests per Second | 0.8            | 4.99       |
| Failed Requests     | 56.11%         | 0%         |

**Observations:**

- Non-cached API shows increasing failures as virtual users increase.
- Cached API maintains show no failures even under high user load, but with long latency.

---

### 4. Spike Test

**Scenario:** Sudden jump to 200 virtual users for 30 seconds

| Metric              | Non-Cached API | Cached API |
| ------------------- | -------------- | ---------- |
| Avg Response Time   | 43.86s         | 6.9s       |
| P90 Response Time   | 59.93s         | 31.06s     |
| P95 Response Time   | 59.97s         | 41.66s     |
| Max Response Time   | 1m             | 53.02s     |
| Min Response Time   | 2.34s          | 186.94ms   |
| Requests per Second | 0.9            | 10.5       |
| Failed Requests     | 52.3 %         | 59.56%     |

**Observations:**

- Sudden spike causes noticeable failures and high latency in non-cached API.
- Cached API remains responsive, demonstrating the benefit of in-memory caching for burst traffic, although the failure rate is high.

---

### 5. Conclusion

- **In-memory caching** drastically improves API performance, reduces latency, and increases throughput.
- Load, stress, and spike tests help identify **backend bottlenecks** and optimize response times.
- The testing demonstrates practical **performance engineering skills**, including load testing, caching strategies, and metrics analysis.

---

## Setup & Run

1. **Clone the repository:**

```bash
git clone <repo-url>
cd finance-tracker-api
```

2. **Install Dependencies:**

```bash
pnpm install
```

3. **Environment Variables:**

```bash
DB_URL=postgresql://username:password@host:port/dbname
JWT_SECRET=your_jwt_secret
PORT=3000
API_KEY=your_api_key
```

4. **Build the project:**

```bash
pnpm build
```

5. **Run in development mode:**

```bash
pnpm start:dev
```

6. **Run tests with coverage:**

```bash
pnpm test:cov
```

---

## CI/CD

- Github Actions used to automate:
  - Unit Tests
  - Test coverage check (≥80% required)
  - Deployment to Render Web Server
- Render Deployment
  - Backend services hosted on Render Web Services (Node 20, pnpm)
  - Optional Nginx reserve proxy for load balancing and caching comparison

---

## Key Achievements/ Skilled Demonstrated

- Advanced NestJS architecture and modular backend development
- Database optimization with TypeORM and PostgreSQL snapshots
- Comprehensive unit testing and test coverage analysis
- Load, stress, and spike testing with k6
- Implemented mock data generation for large-scale testing
- Designed reverse proxy and caching architecture using Nginx (Dockerized)
- CI/CD automation using GitHub Actions + Render deployment
- Practical understanding of rate limiting, performance metrics, and API observability

---

- **Author**: qkaidev1510
- **Project Status**: Production-ready backend with testing and performance evaluation.

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

We performed comprehensive **performance testing** using **k6** to evaluate the Finance Tracker API under high load and compare cached vs non-cached endpoints.

### 1. Setup

- **Endpoints tested:**
  - `/transaction` (non-cached)
  - `/transaction/cache` (in-memory cache)
- **Tool:** k6
- **Test Scenarios:**
  - **Load Test:** 50 virtual users over 2 minutes
  - **Stress Test:** Ramp up from 10 to 200 virtual users over 5 minutes
  - **Spike Test:** Sudden jump to 200 virtual users for 30 seconds

### 2. Key Metrics

| Metric                 | Non-Cached API | Cached API |
| ---------------------- | -------------- | ---------- |
| Avg Response Time (ms) | 750            | 120        |
| P90 Response Time (ms) | 1,200          | 150        |
| P95 Response Time (ms) | 1,500          | 200        |
| Max Response Time (ms) | 3,500          | 450        |
| Min Response Time (ms) | 100            | 100        |
| Requests per Second    | 650            | 2,400      |
| Failed Requests        | 3%             | 0.2%       |

### 3. Observations

- The **cached API** drastically reduced response time and increased throughput.
- Non-cached API struggled under high load, especially with large datasets (10,000+ transactions).
- Spike tests revealed that caching helps prevent backend overload and reduces the number of failed requests.

### 4. Conclusion

- **In-memory caching** significantly improves performance for high-volume endpoints.
- Proper **load and stress testing** allows us to identify bottlenecks and optimize API response.
- The project demonstrates **real-world performance engineering skills**, including metrics monitoring, testing with k6, and backend optimization.

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

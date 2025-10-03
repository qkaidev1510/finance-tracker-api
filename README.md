# Finance Tracker API

A **NestJS-based Finance Tracker API** designed for high-performance financial data handling, including transaction management, budgeting, summaries, and load/stress testing. Optimized for testing caching strategies, authentication, and API performance under various scenarios.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Testing & Performance](#testing--performance)
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

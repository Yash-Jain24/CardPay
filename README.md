# 💳 CardPay

CardPay is a robust, high-performance transaction authorization system designed to demonstrate **safe concurrency guarantees**, **idempotency**, and **secure authentication**. It serves as a modern reference verification system for handling financial transactions securely.

## ✨ Key Features

- **🔐 Secure Authentication**: JWT-based stateless authentication using Spring Security.
- **🛡️ Idempotency**: Ensures creating or authorizing transactions is safe from duplicate requests using `Idempotency-Key` headers.
- **⚡ Concurrency Safety**: Uses **Pessimistic Locking** (`PESSIMISTIC_WRITE`) to prevent double-spending or race conditions during transaction updates.
- **🖥️ Modern Dashboard**: a React + TailwindCSS dashboard to visualize transaction states in real-time.
- **🐳 Dockerized**: Fully containerized setup for instantaneous deployment.

---

## 🛠️ Tech Stack

**Backend**
- **Java 17** & **Spring Boot 3**
- **Spring Security** (JWT)
- **PostgreSQL** (Database)
- **Flyway** (Database Migrations)
- **Hibernate/JPA** (ORM)

**Frontend**
- **React.js** (Vite)
- **Tailwind CSS** (Styling)

**DevOps**
- **Docker** & **Docker Compose**

---

## 🚀 Running Locally

### Prerequisites
- Docker & Docker Compose
- Node.js (Optional, only for local frontend dev)

### Quick Start (Docker)
The easiest way to run the full stack (App + DB + Frontend):

```bash
docker compose up --build
```

- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173) (or mapped port)

### Manual Setup (Dev Mode)

**1. Start Database**
```bash
docker compose up -d db
```

**2. Start Backend**
```bash
./mvnw spring-boot:run
```

**3. Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 API Documentation

### 🟢 Status Codes
| Code | Meaning | Description |
| :--- | :--- | :--- |
| `200 OK` | OK | Request processed successfully. |
| `201 Created` | Created | Resource (Transaction/User) created. |
| `400 Bad Request` | Bad Request | Invalid input or validation failure. |
| `401 Unauthorized` | Unauthorized | Missing or invalid JWT token. |
| `409 Conflict` | Conflict | Duplicate Idempotency Key or State Conflict. |

### 🔐 Authentication

#### 1. Register User
`POST /api/auth/register`

**Body:**
```json
{
  "username": "johndoe",
  "password": "securePass123",
  "role": "ROLE_USER" // Optional, default is ROLE_USER
}
```

#### 2. Login
`POST /api/auth/login`

**Body:**
```json
{
  "username": "johndoe",
  "password": "securePass123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```
> **Note**: Include this token in the `Authorization` header as `Bearer <token>` for all transaction endpoints.

---

### 💸 Transactions

#### 1. Create Transaction
`POST /transactions`

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "userId": "user-123",
  "merchant": "Amazon",
  "amount": 100.00,
  "currency": "USD"
}
```

#### 2. Get All Transactions
`GET /transactions`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "PENDING",
    "amount": 100.00,
    "createdAt": "2024-01-01T12:00:00"
  }
]
```

#### 3. Authorize Transaction
`POST /transactions/{id}/authorize`

**Headers:**
- `Authorization: Bearer <token>`
- `Idempotency-Key: <unique-key>` (Required for safety)

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "APPROVED" // or DECLINED
}
```
> **Idempotency**: Repeated calls with the same `Idempotency-Key` for the same transaction will return the **cached result** without re-processing.

---

## 🏗️ Architecture Highlights

### Concurrency Control
We strictly control concurrent access to transaction records using **Pessimistic Locking**:
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
Optional<Transaction> findById(UUID id);
```
This ensures that if two requests try to authorize the same transaction simultaneously, one will block until the other finishes, preventing race conditions.

### Idempotency
We persist every `Idempotency-Key` mapped to the request result. If a client retries a request (e.g., due to a network timeout), the server detects the key and returns the previous successful response instead of re-executing the logic (e.g., double charging).

---

# CardPay

CardPay is a robust transaction authorization backend with a React dashboard, demonstrating concurrency safety (Pessimistic Locking) and Idempotency.

## Tech Stack
- **Backend**: Spring Boot 3, Java 17, PostgreSQL, Flyway, Hibernate/JPA.
- **Frontend**: React, Vite, Tailwind CSS.
- **Deployment**: Docker, Docker Compose.

## 🚀 Local Run

### Prerequisites
- Docker & Docker Compose
- Node.js (for Frontend)

### 1. Start Backend & DB
```bash
docker compose up --build
```
> The backend will be available at [http://localhost:8080](http://localhost:8080).
> Swagger UI: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
> Open [http://localhost:5173](http://localhost:5173) to view the Dashboard.

---

## 🧪 Testing with curl

You can test the API directly using curl.

### 1. Create a Transaction
```bash
curl -X POST http://localhost:8080/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-1","merchant":"amazon","amount":499.99,"currency":"INR"}'
```

### 2. Authorize Transaction (Idempotent)
Replace `<id>` with the UUID from step 1.
```bash
curl -X POST http://localhost:8080/transactions/<id>/authorize \
  -H "Idempotency-Key: key-123"
```
**Expected Result**:
- First Call: Returns 200 OK (Status APPROVED)
- Second Call (Same Key): Returns Cached Response (200 OK)
- Different Key/Same ID: Returns 200 OK (Processed again if logic allows, or blocked if strictly one-time)
- Same Key/Different ID: Returns 409 Conflict

### 3. Parallel Stress Test (Concurrency)
To test pessimistic locking, run this parallel loop. Ideally, only one request should process (if logic restricts) or all should respect the lock sequentially.
```bash
# Set Transaction ID
tid=YOUR_TRANSACTION_ID_HERE

for i in {1..5}; do
  curl -s -X POST "http://localhost:8080/transactions/$tid/authorize" \
    -H "Idempotency-Key: same-key-123" &
done
wait
```

---

## Deployment Configuration

### Backend (Render/Railway)
- Dockerfile provided in root.
- Set Environment Variables:
  - `DATABASE_URL`: Your production Postgres URL
  - `DB_USER`: User
  - `DB_PASSWORD`: Password

### Frontend (Vercel/Netlify)
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL=https://your-backend-url.com`

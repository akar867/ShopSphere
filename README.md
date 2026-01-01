## ShopSphere — E‑Commerce Microservices Demo (Spring Boot + MySQL + React)

### What you get 

This project is a **demo online shop**:

- You can **browse products**, **search**, **sort**, and **paginate** through the catalog
- You can **add products to a cart**
- You can **checkout** which creates an **order**
- You can **pay** using a **demo payment gateway** (simulated “success/failure”)
- You can see your **order history**

It’s built as **multiple backend services** (microservices) plus a **React frontend**.

---

## Architecture (high level)

### Services (backend)

All backend code lives in `backend/`:

- **`api-gateway`** (`backend/services/api-gateway`)  
  Single entry point for the frontend. Routes `/api/*` requests to the correct service and exposes **one Swagger UI** that links to each service’s OpenAPI docs.

- **`auth-service`** (`backend/services/auth-service`)  
  User registration/login and **JWT** token creation.

- **`product-service`** (`backend/services/product-service`)  
  Product catalog (seeded demo products). Supports **pagination**, **sorting**, and **search**.

- **`order-service`** (`backend/services/order-service`)  
  Creates orders from cart items and lists order history. (Checks product availability by calling `product-service`.)

- **`payment-service`** (`backend/services/payment-service`)  
  Creates a payment “intent” and confirms payment using a **gateway abstraction** (demo provider: `DUMMY`).

### Frontend

Frontend code lives in `frontend/` (React + Vite + TypeScript + MUI):

- Browse catalog with **pagination/sorting/search**
- Cart
- Login/Register
- Checkout (order → payment intent → confirm payment → mark order paid)
- Orders page

---

## How the application flows (non‑technical)

1. **You open the website** and see products.
2. You **search/sort** and **add items to your cart**.
3. At checkout you **log in** (if you’re not already).
4. When you click “Pay now (Demo)”:
   - The system **creates an order**
   - It **creates a payment**
   - It **confirms the payment** (demo success)
   - It **marks the order as PAID**
5. You can go to **Orders** to see your purchases.

---

## How the application flows (technical)

### Authentication (JWT)

- `auth-service` issues JWTs with a `uid` claim and `roles` claim.
- `api-gateway`, `product-service`, `order-service`, and `payment-service` all validate the JWT using the same `JWT_SECRET`.

### Key API calls (through the gateway)

- **Login**
  - `POST /api/auth/login` → returns `{ accessToken, ... }`
- **Products (public)**
  - `GET /api/products?q=&page=&size=&sortBy=&direction=`
- **Create order (auth required)**
  - `POST /api/orders`
- **Create payment intent (auth required)**
  - `POST /api/payments/intent`
- **Confirm payment (auth required)**
  - `POST /api/payments/{paymentId}/confirm`
- **Mark order paid (auth required)**
  - `POST /api/orders/{orderId}/mark-paid`

---

## Pagination + sorting for products

Endpoint: `GET /api/products`

Query params:

- **`page`**: 0‑based page index (default `0`)
- **`size`**: page size (default `12`, max `100`)
- **`sortBy`**: `createdAt` | `price` | `name` (default `createdAt`)
- **`direction`**: `asc` | `desc` (default `desc`)
- **`q`**: optional search string (matches product name)

Response includes paging metadata:
- `totalElements`, `totalPages`, `hasNext`, `hasPrevious`

---

## Swagger (OpenAPI)

Once running, open:

- **Gateway Swagger UI**: `http://localhost:8080/swagger-ui.html`
  - Auth service docs: `/v3/api-docs/auth`
  - Product service docs: `/v3/api-docs/products`
  - Order service docs: `/v3/api-docs/orders`
  - Payment service docs: `/v3/api-docs/payments`

---

## Actuator + metrics

Each service exposes:

- `GET /actuator/health`
- `GET /actuator/metrics`
- `GET /actuator/prometheus`

---

## Running locally

### Option A: Docker Compose (recommended)

Prereqs:
- Docker + Docker Compose installed on your machine

Run:

```bash
docker compose up --build
```

Then open:
- Frontend (run separately; see below)
- API Gateway: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### Option B: Run backend services manually (no Docker)

Prereqs:
- Java 21
- A running MySQL instance (or change the `*_DB_URL` values to point to your DB)

From `backend/`:

```bash
./mvnw -DskipTests package
./mvnw -pl services/auth-service spring-boot:run
./mvnw -pl services/product-service spring-boot:run
./mvnw -pl services/order-service spring-boot:run
./mvnw -pl services/payment-service spring-boot:run
./mvnw -pl services/api-gateway spring-boot:run
```

### Run the frontend

From `frontend/`:

```bash
npm install
npm run dev
```

By default the UI expects the gateway at `http://localhost:8080`.
Override with `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

---

## Demo accounts

`auth-service` seeds demo users on startup:

- **User**: `user@example.com` / `User@1234`
- **Admin**: `admin@example.com` / `Admin@123`

Admin is required for product create/update endpoints.

---

## Folder map (what is where)

### Backend

- **`backend/pom.xml`**: parent Maven module (builds all services)
- **`backend/mvnw` + `backend/.mvn/`**: Maven wrapper (no system Maven needed)
- **`backend/services/auth-service`**: JWT auth, users table, login/register endpoints
- **`backend/services/product-service`**: products table, paging/sort/search endpoint
- **`backend/services/order-service`**: orders + order items tables, order creation/listing
- **`backend/services/payment-service`**: payments table, dummy gateway + confirm endpoint
- **`backend/services/api-gateway`**: routes + security + Swagger UI aggregation
- **`backend/platform/mysql/init/01-create-databases.sql`**: DB init for Docker MySQL

### Frontend

- **`frontend/src/app/`**: app shell (theme, routes, layout)
- **`frontend/src/features/auth/`**: login/register + token store
- **`frontend/src/features/products/`**: product catalog UI + API calls
- **`frontend/src/features/cart/`**: cart state + cart/checkout pages
- **`frontend/src/features/orders/`**: orders page + API calls
- **`frontend/src/features/payments/`**: payment API calls (demo gateway)
- **`frontend/src/shared/`**: shared API client + utilities

---

## Notes / limitations (demo choices)

- Payment gateway is **simulated** (`DUMMY`). The architecture is set up so a real provider (Stripe/Razorpay/etc.) can be added behind the `PaymentGateway` interface.
- In real production systems, order state changes after payment are typically driven by **webhooks** from the payment provider. Here we keep it demo-friendly and explicit.

---

## Admin UI (Product CRUD)

Login as the seeded admin user:

- **Admin**: `admin@example.com` / `Admin@123`

Then open the admin screen:

- `http://localhost:5173/admin/products`

From there you can:
- create a product
- edit a product

These screens call product-service endpoints protected by `ROLE_ADMIN`.

---

## Stripe integration (real payment provider)

Payment-service now supports provider `STRIPE` in addition to `DUMMY`.

### Frontend env vars

Set this in the frontend (see `frontend/.env.example`):

- `VITE_STRIPE_PUBLISHABLE_KEY` (required to show the Stripe card form)

### Backend env vars

Set these for `payment-service`:

- `STRIPE_SECRET_KEY` (required for Stripe)
- `PAYMENT_DEFAULT_PROVIDER` (optional, `DUMMY` by default; set to `STRIPE` if you want Stripe as default)
- `STRIPE_WEBHOOK_SECRET` (optional; webhook endpoint not required for basic intent creation)

### How it works (backend)

- `POST /api/payments/intent` with `{ "orderId": 123, "provider": "STRIPE" }`
  - creates a Stripe PaymentIntent and returns `clientSecret`
- `POST /api/payments/{paymentId}/confirm`
  - for Stripe payments, this refreshes the status from Stripe (by PaymentIntent id)

### How it works (frontend checkout)

At checkout you can select **Stripe** as the payment method:

1. UI creates an order: `POST /api/orders`
2. UI creates Stripe payment intent: `POST /api/payments/intent` with provider `STRIPE` → receives `clientSecret`
3. UI renders Stripe **PaymentElement** and calls `stripe.confirmPayment(...)`
4. UI calls `POST /api/payments/{paymentId}/confirm` to sync payment status from Stripe
5. If succeeded, UI calls `POST /api/orders/{orderId}/mark-paid`


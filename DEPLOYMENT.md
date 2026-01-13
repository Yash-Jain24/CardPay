# 🚀 Deployment Guide

This guide will help you deploy the **CardPay Core (Backend)** to [Render](https://render.com) and the **Frontend** to [Vercel](https://vercel.com).

---

## 🏗️ 1. Backend Deployment (Render)

Render is great for Dockerized Spring Boot apps.

### Steps:
1.  **Log in to Render** and go to your [Dashboard](https://dashboard.render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your **GitHub Repository** (`CardPay`).
4.  **Configuration**:
    - **Name**: `cardpay-api`
    - **Runtime**: `Docker` (Render will auto-detect the `Dockerfile`)
    - **Region**: Closest to you (e.g., `Singapore`, `Frankfurt`, etc.)
    - **Instance Type**: `Free` (or Starter for better performance)
5.  **Environment Variables** (Scroll down to "Advanced"):
    Add the following **key-value pairs**:

| Key | Value | Description |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates `application-prod.yml` |
| `DATABASE_URL` | *See Step 1.1* | Internal PostgreSQL URL |
| `DB_USER` | *See Step 1.1* | Database User |
| `DB_PASSWORD` | *See Step 1.1* | Database Password |
| `JWT_SECRET` | *(Generate Random)* | Min 32-char random string (e.g. `openssl rand -base64 32`) |

#### 1.1 Setting up Database (PostgreSQL on Render)
*If you don't have a database yet:*
1.  On Render Dashboard, click **New +** -> **PostgreSQL**.
2.  Name: `cardpay-db`.
3.  Plan: `Free`.
4.  Create it.
5.  Once created, copy the **Internal Connection Details** to fill the Environment Variables above.
    *   `DATABASE_URL` usually looks like `jdbc:postgresql://dpg-....render.com:5432/cardpay_db` (Modify the `postgres://` prefix to `jdbc:postgresql://` if needed for Java).

---

## 🎨 2. Frontend Deployment (Vercel)

Vercel is optimized for React/Vite apps.

### Steps:
1.  **Log in to Vercel** and click **Add New** -> **Project**.
2.  Import your **GitHub Repository** (`CardPay`).
3.  **Configure Project**:
    - **Framework Preset**: `Vite` (Should be auto-detected).
    - **Root Directory**: Click `Edit` and select `frontend`.
4.  **Environment Variables**:
    Add the backend URL you just deployed on Render.

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://cardpay-api.onrender.com` | Your Render Backend URL (no trailing slash) |

5.  Click **Deploy**.

---

## ✅ Verification
1.  Open your Vercel App URL (e.g., `https://cardpay.vercel.app`).
2.  Try to **Register** a new user.
3.  Try to **Create a Transaction**.
4.  If everything works, your Full Stack deployment is live! 🚀

# ShebaBD (সেবা বিডি) — Bangladesh Local Service Finder Marketplace

A full-stack, production-grade local on-demand service marketplace built specifically for Bangladesh. ShebaBD connects homeowners and businesses with verified plumbers, electricians, tutors, AC repair specialists, home cleaners, appliance technicians, and more across all 8 divisions and 64 districts in Bangladesh.

---

## 🌟 Key Highlights & Architecture

- **Next.js 16+ App Router & React 19**: Server Components by default, Client Components where interactivity is needed.
- **Tailwind CSS & Shadcn UI**: Custom Bangladesh emerald theme, dark mode support with zero flash, glassmorphism, responsive mobile drawers.
- **Bilingual (English + বাংলা)**: Instant live language toggle across the entire application using unified i18n dictionaries.
- **MongoDB + Mongoose Singleton**: Serverless-safe cached database connection with indexing (text search, geospatial, compound rating/category).
- **JWT Auth with httpOnly Cookies**: Dual-token system (1-hour access token, 7-day refresh token), SameSite=Strict, bcrypt password hashing.
- **Security & Helmet-Style Headers**: CSP, HSTS, X-Frame-Options, NoSQL injection & XSS sanitization, rate limiting on auth & write routes, brute-force account lockout.
- **Role-Based Access Control**: Strict `proxy.ts` protecting Customer Dashboard (`/dashboard`), Provider Hub (`/provider`), and Admin Console (`/admin`).
- **One Review per Completed Request**: Reviews are strictly restricted to customers who completed a service request with the provider, with automated average rating recalculation.

---

## 👥 User Roles & Flows

| Role | Access & Capabilities |
|---|---|
| **Visitor** | Browse services, search by keyword/category/division/district, view provider profiles, reviews, gallery. |
| **User (Customer)** | Register/Login, send service requests with preferred date/time/budget, track live status, cancel pending requests, leave 1-5 star reviews on completed jobs. |
| **Provider** | Register, manage business profile (category, skills, areas, hourly rate, price range, phone, gallery), toggle availability (Online/Offline), accept/reject incoming requests, mark jobs completed with final price and notes, reply to reviews. |
| **Admin** | Overview metrics (users, providers, requests, revenue), approve/reject/verify providers, block/unblock fraudulent accounts, create categories & areas with English & Bangla names, investigate moderation reports, delete inappropriate reviews. |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20+)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/job-service-bd`) or a free MongoDB Atlas connection string.

### 2. Environment Setup
Create a `.env.local` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/job-service-bd

# JWT Authentication Secrets (replace with 32+ character random secrets)
JWT_ACCESS_SECRET=shebabd_super_secret_access_jwt_key_bangladesh_123456
JWT_REFRESH_SECRET=shebabd_super_secret_refresh_jwt_key_bangladesh_67890

# Cloudinary (Optional for production image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed the Database
Populate the database with realistic Bangladesh categories, areas, verified top-rated providers, sample requests, and customer reviews:

```bash
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---


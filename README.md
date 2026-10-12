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

## 🔑 Demo Accounts for Instant Testing

| Role | Email | Password | Dashboard Link |
|---|---|---|---|
| **Super Admin** | `admin@shebabd.com` | `Admin@123456` | `/admin` |
| **Service Provider** | `rafiq.ac@shebabd.com` | `Password123` | `/provider` |
| **Customer / User** | `tarek@gmail.com` | `Password123` | `/dashboard` |

> *Tip: You can also click the quick-fill buttons on the [Login Page](/login) to auto-fill any of these credentials with one click!*

---

## 📁 Project Structure

```
job-service/
├── app/
│   ├── (public)/              # Public route group (home, services, providers, auth)
│   │   ├── categories/        # Categories showcase
│   │   ├── login/             # Login page with demo credentials
│   │   ├── register/          # Customer & Provider registration
│   │   ├── services/          # Multi-filter search (category, division, district, rating, price)
│   │   ├── providers/[id]/    # Provider detail page with gallery, reviews, and booking modal
│   │   ├── layout.tsx         # Public shared Navbar & Footer
│   │   └── page.tsx           # Homepage
│   ├── dashboard/             # Customer Dashboard
│   │   ├── layout.tsx         # Sidebar layout
│   │   ├── page.tsx           # Service requests tracker & Leave Review modal
│   │   └── profile/page.tsx   # Contact and delivery address settings
│   ├── provider/              # Provider Hub
│   │   ├── layout.tsx         # Provider navigation layout
│   │   ├── page.tsx           # Order manager (Accept, Reject, Mark Completed)
│   │   ├── profile/page.tsx   # Business title, rates, skills tags, and availability
│   │   └── reviews/page.tsx   # Reviews received with Provider Reply feature
│   ├── admin/                 # Super Admin Panel
│   │   ├── layout.tsx         # Dark theme console layout
│   │   ├── page.tsx           # Metric cards & recent order stream
│   │   ├── providers/page.tsx # Verify, approve, and reject providers
│   │   ├── users/page.tsx     # Block / Unblock customer and provider accounts
│   │   ├── categories/page.tsx# Bilingual category management
│   │   └── reports/page.tsx   # User report moderation
│   ├── api/                   # Route Handlers
│   │   ├── auth/              # register, login, logout, me, refresh
│   │   ├── categories/        # category endpoints
│   │   ├── areas/             # division/district/upazila endpoints
│   │   ├── providers/         # search, details, provider/me, verification
│   │   ├── requests/          # create request, list, status transitions
│   │   ├── reviews/           # post review (rule-enforced), replies, delete
│   │   ├── reports/           # report submission and moderation
│   │   ├── admin/             # stats, users, providers, categories
│   │   └── upload/            # Cloudinary image upload with safe fallback
│   ├── globals.css            # Tailwind theme tokens & glassmorphism utilities
│   └── layout.tsx             # Root layout wrapping I18n, Theme, and Auth providers
├── components/
│   ├── ui/                    # Shadcn primitives (button, badge, card, input, dialog, avatar)
│   ├── shared/                # Navbar, Footer, RatingStars
│   ├── home/                  # Hero, StatsBanner, CategoryGrid, TopProviders, PopularAreas, HowItWorks
│   ├── providers/             # RequestModal, ReportModal
│   └── dashboard/             # LeaveReviewModal
├── lib/
│   ├── mongodb.ts             # Cached Mongoose singleton connection
│   ├── auth.ts                # JWT access & refresh token helpers
│   ├── security.ts            # Rate limiter, password hashing, NoSQL/XSS sanitization, lockout
│   ├── bd-data.ts             # 8 divisions, districts, and popular neighborhoods (English & Bangla)
│   ├── i18n/                  # English (`en.ts`) and Bangla (`bn.ts`) translations + context
│   └── utils.ts               # BDT currency formatter (৳), phone formatter, date formatter
├── models/                    # Mongoose Models (User, Provider, Category, Area, ServiceRequest, Review, Report)
├── validators/                # Zod schemas (BD phone regex: 01XXXXXXXXX)
├── proxy.ts                   # Role-based route guard (Next.js 16 proxy)
└── scripts/
    └── seed.ts                # Realistic Bangladesh seed script
```

---

## 🔒 Security Best Practices Implemented

1. **Helmet-Style Security Headers (`next.config.ts`)**:
   - `Content-Security-Policy`
   - `Strict-Transport-Security` (HSTS)
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
2. **Rate Limiting**: In-memory sliding window rate limiter protects `/api/auth/login`, `/api/auth/register`, and `/api/requests`.
3. **Brute-Force Account Lockout**: Accounts are automatically locked for 15 minutes after 5 consecutive failed login attempts.
4. **Input Sanitization**: All incoming request payloads are recursively stripped of NoSQL injection keys (`$gt`, `$where`) and HTML tags to prevent XSS.
5. **Cookie Security**: JWT tokens are issued with `httpOnly: true`, `secure: true` (in production), and `sameSite: "strict"`.
6. **Password Security**: Passwords are never returned in database queries (`select: false`) and are hashed using bcrypt with salt rounds of 12.

---

## 🌐 Deployment Guide

### Deploying to Vercel
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. In the Vercel project settings, navigate to **Environment Variables** and add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_ACCESS_SECRET`: A secure random string.
   - `JWT_REFRESH_SECRET`: A secure random string.
   - `CLOUDINARY_CLOUD_NAME`: (Optional) Your Cloudinary Cloud Name.
   - `CLOUDINARY_API_KEY`: (Optional) Your Cloudinary API Key.
   - `CLOUDINARY_API_SECRET`: (Optional) Your Cloudinary API Secret.
   - `NEXT_PUBLIC_APP_URL`: Your production Vercel URL (e.g., `https://shebabd.vercel.app`).
4. Deploy! Vercel will automatically build the Next.js App Router bundle.

### Deploying MongoDB Atlas
1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) or Vercel's IP ranges.
3. Under **Database Access**, create a user with read and write privileges.
4. Under **Clusters > Connect**, copy the SRV connection URI and paste it as `MONGODB_URI`.
5. Run `npm run seed` once from your local terminal pointing to the Atlas URI to initialize the database with all categories and sample providers.

---

## 📄 License
This project is open-source under the MIT License.

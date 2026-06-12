# 🏢 Employee Management System (EMS)

A complete full-stack enterprise Employee Management System with React frontend, Node.js/Express backend, PostgreSQL database, JWT authentication, RBAC, leave management, asset tracking, reporting, and more.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Redux Toolkit, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| ORM | Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (Access + Refresh Tokens), bcryptjs |
| File Upload | Cloudinary, Multer |
| Email | Nodemailer (Gmail SMTP) |
| Docs | Swagger/OpenAPI |
| Export | ExcelJS (Excel/CSV export) |
| Deploy | Vercel (Frontend) + Render (Backend) |

---

## 📁 Project Structure

```
emp-mgmt/
├── backend/
│   └── src/
│       ├── config/          # DB, Cloudinary, Email, Swagger
│       ├── controllers/     # Request handlers
│       ├── middleware/      # Auth, Error, Rate Limit, Audit
│       ├── prisma/          # Schema + Seed
│       ├── routes/          # Express routes
│       ├── services/        # Business logic
│       └── utils/           # JWT, Response helpers
├── frontend/
│   └── src/
│       ├── api/             # Axios client + service functions
│       ├── components/      # Reusable UI components
│       ├── pages/           # All page components
│       ├── store/           # Redux slices
│       └── App.js           # Routes + Protected routes
├── render.yaml              # Render backend deployment
├── vercel.json              # Vercel frontend deployment
└── README.md
```

---

## ✅ Features

### Authentication & Security
- ✅ User Registration + Email Verification
- ✅ JWT Login with Access + Refresh Token rotation
- ✅ Forgot/Reset Password via email
- ✅ bcrypt password hashing (salt rounds: 12)
- ✅ Role-Based Access Control (SUPER_ADMIN / ADMIN / HR / MANAGER / EMPLOYEE)
- ✅ Rate limiting on auth endpoints
- ✅ Helmet.js security headers
- ✅ Protected Routes (Frontend + Backend)

### Employee Management
- ✅ Full CRUD with paginated list
- ✅ Multi-file upload (Profile photo, Resume, Documents via Cloudinary)
- ✅ Department assignment
- ✅ Manager hierarchy
- ✅ Skills with proficiency levels
- ✅ Emergency contacts (JSONB)
- ✅ Bank details (JSONB)
- ✅ Auto-generated Employee IDs (EMP0001...)

### Leave Management
- ✅ Apply for: Annual, Sick, Casual, Maternity, Paternity, Compensatory, Unpaid
- ✅ Half-day leave support
- ✅ Leave balance tracking (per type, per year)
- ✅ 3-step approval: Employee → Manager → HR
- ✅ Leave calendar conflict detection
- ✅ Manager approve/reject with comments
- ✅ HR final approve/reject
- ✅ Cancel pending leaves
- ✅ Automatic balance deduction on approval

### Asset Management
- ✅ Asset types: Laptop, Monitor, Keyboard, Mouse, Phone, ID Card, etc.
- ✅ Full asset lifecycle (Available → Allocated → Returned)
- ✅ Auto-generated asset tags (LAP-0001, MON-0002...)
- ✅ Allocation with employee assignment
- ✅ Return with condition tracking
- ✅ Full allocation history per asset

### Dashboard & Analytics
- ✅ Admin dashboard: org stats, dept headcount charts, asset distribution pie chart
- ✅ Manager dashboard: team overview, pending approvals
- ✅ Employee dashboard: leave balances, recent leaves, assigned assets
- ✅ Recharts bar/pie/line visualizations

### Notifications
- ✅ In-app notifications for leave approvals/rejections
- ✅ Asset assignment notifications
- ✅ Mark as read / mark all as read
- ✅ Email notifications (leave status, asset assigned, password reset, email verify)

### Audit Trail
- ✅ Every CREATE/UPDATE/DELETE logged with old + new values
- ✅ IP address + user agent tracking
- ✅ Filter by table, action, user
- ✅ Expandable diff view in UI

### Reports & Export
- ✅ Employee report (filter by dept, status)
- ✅ Leave report (filter by year, status, dept)
- ✅ Asset report (filter by type, status)
- ✅ Export to Excel (.xlsx) via ExcelJS
- ✅ Export to CSV
- ✅ Preview mode (first 20 records)

### Masters
- ✅ Department CRUD with manager assignment
- ✅ Skills CRUD with categories

### API
- ✅ Swagger/OpenAPI documentation at `/api/docs`
- ✅ RESTful API design
- ✅ Centralized error handling
- ✅ Prisma ORM with PostgreSQL transactions

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/emp-mgmt.git
cd emp-mgmt
npm install   # installs root concurrently
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your values:
# DATABASE_URL, JWT_SECRET, EMAIL_*, CLOUDINARY_*
```

### 3. Database Setup

```bash
cd backend

# Copy schema to prisma folder
cp src/prisma/schema.prisma prisma/schema.prisma

# Run migrations
npx prisma migrate dev --name init

# Seed with demo data
node src/prisma/seed.js
```

### 4. Configure Frontend

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Run Development

```bash
# From root:
npm run dev

# Or separately:
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | Admin@123 |
| HR | hr@company.com | Hr@123456 |

---

## 🌐 API Documentation

After starting the backend, visit:
```
http://localhost:5000/api/docs
```

### Key Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
POST   /api/auth/refresh           Refresh tokens
GET    /api/auth/me                Get current user

GET    /api/employees              List employees (paginated)
POST   /api/employees              Create employee
GET    /api/employees/:id          Get employee detail
PUT    /api/employees/:id          Update employee
DELETE /api/employees/:id          Deactivate employee

GET    /api/leaves                 Get leaves
POST   /api/leaves/apply           Apply for leave
POST   /api/leaves/:id/manager-action   Manager approve/reject
POST   /api/leaves/:id/hr-action        HR approve/reject
GET    /api/leaves/balance         Get leave balances

GET    /api/assets                 List assets
POST   /api/assets                 Create asset
POST   /api/assets/:id/allocate    Assign to employee
POST   /api/assets/allocations/:id/return   Return asset

GET    /api/dashboard/admin        Admin dashboard data
GET    /api/dashboard/employee     Employee dashboard data
GET    /api/dashboard/manager      Manager dashboard data

GET    /api/reports/employees      Employee report (supports ?format=excel|csv)
GET    /api/reports/leaves         Leave report
GET    /api/reports/assets         Asset report

GET    /api/notifications          Get notifications
PATCH  /api/notifications/:id/read Mark as read
PATCH  /api/notifications/read-all Mark all as read

GET    /api/audit                  Audit logs (Admin/HR only)
```

---

## 🚢 Deployment

### Backend → Render

1. Push to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Connect your repo, set `Root Directory` to `backend`
4. Add all environment variables from `.env.example`
5. Build: `npm install && npx prisma generate && npx prisma migrate deploy`
6. Start: `npm start`
7. Create a PostgreSQL database on Render and set `DATABASE_URL`

### Frontend → Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set `Root Directory` to `frontend`
4. Add env: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
5. Deploy

---

## 📊 Database Schema

Key models:
- **User** — Auth credentials, role, email verification
- **Employee** — Profile, department, manager hierarchy, JSONB fields
- **Department** — With manager FK
- **Skill** / **EmployeeSkill** — Many-to-many with proficiency
- **LeaveApplication** — Full approval workflow with audit fields
- **LeaveBalance** — Per employee, per type, per year
- **Asset** — Full lifecycle tracking
- **AssetAllocation** — History with return tracking
- **Notification** — Per-user with type + JSONB data
- **AuditLog** — Old/new values (JSONB), IP, user agent

---

## 🛡️ Security Features

- JWT token rotation on every refresh
- Refresh tokens stored in DB (can be revoked)
- bcrypt with cost factor 12
- Rate limiting: 100 req/15min global, 20 req/15min for auth
- CORS configured for specific origin
- Helmet.js security headers
- Input validation via express-validator
- Prisma parameterized queries (SQL injection prevention)
- Role-based route protection (frontend + backend)

---

## 📧 Email Notifications

Configure Gmail SMTP:
1. Enable 2FA on your Google account
2. Create an App Password at myaccount.google.com/apppasswords
3. Use that as `EMAIL_PASS` in .env

Emails sent for:
- Email verification on register
- Password reset link
- Leave approved/rejected
- Asset assigned

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit with meaningful messages
4. Open a pull request

---

*Built with ❤️ — Enterprise-grade EMS with modern stack*

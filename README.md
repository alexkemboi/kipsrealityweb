
# <img src="/public/favicon/favicon.ico" alt="RentFlow360 Logo" width="120" height="40"> RentFlow360

**RentFlow360: One platform for rental operations and financial management.**

**RentFlow360** is a full-stack property rental operations and financial management platform that unifies leasing, tenant management, invoicing, rent collection, payments, ledger accounting, maintenance, vendor workflows, and portfolio analytics in one secure, compliance-ready system.

---
## Why RentFlow360

Property operations and finance are often fragmented across disconnected tools. RentFlow360 brings workflows together into one operating system so teams can execute faster, reduce errors, and improve visibility across the full rental lifecycle.

- **Portfolio control** across properties, units, leases, and tenants  
- **Financial reliability** across invoices, collections, ledger, and journals  
- **Operational continuity** across maintenance, vendors, and utilities  
- **Governance by design** with role-based access and audit-friendly workflows  
- **Modern user experience** that is fast, intuitive, and API-driven  

---

## 🚀 Features

- **Portfolio Command Center**  
  Manage properties, units, occupancy, and lease status from one live portfolio view built for day-to-day control.

- **Tenant Lifecycle Management**  
  Handle onboarding, lease execution, renewals, notices, and communication history in a single tenant record.

- **Automated Revenue Engine**  
  Run invoicing, rent schedules, reminders, collections, and delinquency workflows with fewer manual touchpoints.

- **Finance & Compliance Core**  
  Track payments, maintain ledger and journal accuracy, support reconciliations, and generate audit-ready financial records.

- **Maintenance & Vendor Management**  
  Route requests by priority, assign vendors, enforce SLA timelines, and monitor service completion quality.

- **Dashboards & Reports**  
  Monitor occupancy, collections, arrears, work-order turnaround, and operating performance in real time.

- **Marketplace (Optional)**  
  Publish and discover listings to reduce vacancy cycles and improve leasing speed.

- **Role-Based Access Control (RBAC)**  
  Apply role-based permissions (Admin, Manager, Tenant, Vendor) with clear governance boundaries.

- **Secure Authentication**  
  Protect user sessions and access flows with NextAuth/JWT-based authentication, based on deployment setup.

---

## ⚡ Quick Setup

### Prerequisites

* Node.js ≥ 18
* npm or yarn
* MySQL database (local or remote)

### Clone & Install

```bash
git clone https://github.com/RentFlow3601/kipsrealityweb.git
cd kipsrealityweb
npm install
```

### Environment Variables

Create `.env.local`:

```env
DATABASE_URL=mysql://user:password@localhost:3306/rentflow360
NEXT_PUBLIC_API_URL=https://your-backend-endpoint.com
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup

```bash
npx prisma generate
npx prisma migrate deploy
# optional
npm run db:seed

### Run Dev Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## 🧱 Tech Stack

**Frontend**

* Next.js (App Router)
* React.js + TypeScript
* Tailwind CSS
* ShadCN UI components
* Axios / React Query

**Backend**

* Node.js / Express
* MySQL (via Sequelize / Prisma)
* RESTful API + Authentication

**Deployment**

* Frontend → [Vercel](https://vercel.com/)
* Backend → Node.js server / API endpoint

---

## 🧩 Folder Structure

```
rentflow360/
 ├── src/
 │   ├── app/             # Next.js App Router pages
 │   ├── components/      # Reusable UI components
 │   ├── lib/             # Utilities & helpers
 │   ├── styles/          # Global and module CSS
 │   ├── hooks/           # Custom React hooks
 │   └── services/        # API and data services
 ├── prisma/              # Schema, migrations, seed (if using Prisma)
 ├── public/              # Static assets
 ├── docs/                # Architecture/API/security docs
 ├── .github/workflows/   # CI/CD pipelines
 ├── package.json
 ├── postcss.config.mjs
 ├── tailwind.config.js
 └── README.md
```
## 📜 Scripts

 ```bash
npm run dev         # Start development server
npm run build       # Build app for production
npm start           # Run production server
npm run lint        # Lint codebase
npm run test        # Unit/integration tests
npm run e2e         # Playwright end-to-end tests (if configured)
npm run verify      # Lint + test + e2e
npm run db:migrate  # Run DB migrations (if configured)
npm run db:seed     # Seed DB data (if configured)
npm run db:reset    # Reset DB (dev only, if configured)

---

## 🧠 Common Build Issues

* **Sharp dependency**

  ```bash
  npm install sharp --os=linux --cpu=x64
  ```

* **PostCSS / Tailwind plugin error**
  Install the plugin and update `postcss.config.mjs`:

```bash
npm install @tailwindcss/postcss autoprefixer
```

```js
import tailwind from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [tailwind, autoprefixer],
};
```

---

## 🧪 Testing
* **Linting for code quality and consistency
* **Unit/Integration Tests for business logic correctness
* **End-to-End (E2E) Tests for full user workflows

```bash
npm run lint
npm run test
npm run e2e
```
* **CI quality gate

npm run lint
npm run test
npm run e2e
npm run build

* **Playwright artifacts

playwright-report/
test-results/

## 🔐 Security

* **Role-Based Access Control (RBAC)

## 🔐 Security

- **Role-Based Access Control (RBAC):** Granular, role-scoped permissions for Admin, Manager, Tenant, and Vendor workflows.
- **Secure Authentication:** NextAuth/JWT-based authentication with protected sessions and controlled access paths.
- **Secret Management:** Environment-variable based secret handling for credentials, keys, and integration tokens.
- **Audit-Ready Controls:** Finance and operations workflows designed for traceability, accountability, and reviewability.

### Best Practices

- Never commit `.env*` files to source control.
- Rotate secrets regularly and immediately after any exposure risk.
- Store production secrets only in secure deployment settings (never in code).
- Apply least-privilege access for users, service accounts, and integrations.
- Monitor authentication, permission, and payment-related events in logs.

---

## 🌍 Deployment

* **Frontend:** Auto-builds via Vercel from `main` or `production`.
* **Backend:** Deploy via Node / Express server.
* **Run database migrations during release.

---

## 👥 Contributors
* **Daniel Ruto** – Founder and CEO
* **Alex Kemboi** – PRODUCT AND PROJECT MANAGER
* **Yvonne Gat** – FRONT END DEVELOPER
* **Silvia** – FRONT END DEVELOPER
* **Hassan** – BACKEND ENGINEER

---

## 📜 License

This project is licensed under the **Kipsreality License**.




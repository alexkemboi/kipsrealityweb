
# <img src="/public/favicon/favicon.ico" alt="RentFlow360 Logo" width="120" height="40"> RentFlow360

**RentFlow360** is a full-stack property rental management platform designed to help property owners, tenants, and agents streamline rental operations. It provides tools for lease management, rent payments, tenant communication, analytics, vendor management, and a property marketplace — all from one unified dashboard.

---

## ⚡ Quick Setup

### Prerequisites

* Node.js ≥ 18
* npm or yarn
* MySQL database (local or remote)

### Clone & Install

```bash
git clone https://github.com/alexkemboi/kipsrealityweb.git
cd kipsrealityweb
npm install
```

### Environment Variables

Create `.env.local`:

```env
DATABASE_URL=mysql://user:password@localhost:3306/rentflow360
NEXT_PUBLIC_API_URL=https://your-backend-endpoint.com
NEXTAUTH_SECRET=your_secret_key
```

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

## 🚀 Features

* **Property Listings** – Manage apartments, units, and buildings efficiently.
* **Tenant Management** – Track tenants, lease terms, and contact details.
* **Automated Rent Flow** – Manage invoices, payments, and rent cycles.
* **Vendor & Service Management** – Manage vendor activities and service requests.
* **Dashboards & Reports** – Real-time insights into rental income and occupancy.
* **Marketplace** – List, browse, and discover rental properties for lease or sublease.
* **Role-Based Access** – Admin, Manager, Tenant, and Vendor access levels.
* **Secure Authentication** – Powered by NextAuth / JWT (depending on your setup).

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
 ├── public/              # Static assets
 ├── package.json
 ├── postcss.config.mjs
 ├── tailwind.config.js
 └── README.md
```

---

## 🧠 Common Build Issues

* **Sharp dependency**

  ```bash
  npm install sharp --os=linux --cpu=x64
  ```

* **PostCSS / Tailwind plugin error**
  Install the plugin and update `postcss.config.mjs`:

```bash
npm install @tailwindcss/postcss
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

```bash
npm run lint
npm run test
```

---

## 🌍 Deployment

* **Frontend:** Auto-builds via Vercel from `main` or `production`.
* **Backend:** Deploy via Node / Express server.

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



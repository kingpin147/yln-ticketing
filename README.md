# YLN Online Ticketing System 🎫

A premium, enterprise-grade internal ticketing solution built with **Next.js 15**, **Prisma**, and **Clerk**. Designed for visual efficiency and robust administration.

## 🚀 Key Features

### 🛠️ Core Workflow
- **Custom Ticket IDs**: Auto-generated sequential IDs (e.g., `YLN-0001`).
- **Hybrid Views**: Switch between a high-efficiency **Global List View** (/tickets) and a visual **Kanban Board**.
- **Smart Dashboard**: Role-aware widgets showing personal work, unassigned tickets, and global stats.
- **Global Search**: Real-time, debounced search across all ticket attributes.

### 🛡️ Advanced RBAC (Role-Based Access Control)
- **Super Admin**: Full platform control, user management, and core data deletion. Sees all tickets.
- **Sub Admin**: Team management and assignment capabilities. Sees all tickets.
- **Agent**: Dedicated workspace focusing on **assigned tickets only** for maximum focus.
- **Submitter**: Simplified portal for tracking personal issues only.

### 📊 Intelligence & Audit
- **Activity Log**: Every status change, assignment, and update is tracked in a permanent audit trail.
- **Internal Notes**: Private staff-only discussion threads for team collaboration.
- **Excel Export**: Instant `.xlsx` data generation for advanced reporting.
- **Email Automation**: Real-time notifications for ticket creation and status updates via **Resend**.

## 💻 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Prisma 7 + Neon Postgres
- **Auth**: Clerk (Role-based metadata)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Animation**: Framer Motion / tailwindcss-animate
- **Communication**: Resend API

## ⚙️ Project Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with the following:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_key
   DATABASE_URL=your_neon_url
   RESEND_API_KEY=your_resend_key
   ```

3. **Initialize Database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🚢 Deployment (Vercel)
The project is optimized for Vercel. Ensure you add the environment variables listed above to your Vercel project settings. The `package.json` includes a `postinstall` script to handle Prisma client generation in the cloud.

---
*Built with ❤️ for YLN Internal Operations.*

# 🛡️ Smart Warden - Digital Hostel Gate Pass System

**Smart Warden** is a comprehensive, full-stack role-based application designed to digitize and streamline the hostel gate pass workflow for educational institutions. It replaces manual paper-based logs with a secure, real-time digital authorization system.

## 🚀 Live Demo
- **Frontend:** [https://smart-warden.vercel.app](https://smart-warden.vercel.app)
- **Backend API:** [https://smart-warden.onrender.com](https://smart-warden.onrender.com)

---

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Students, HODs, Wardens, Security Guards, and Administrators.
- **Hierarchical Approval Workflow:** Gate passes must be approved by the HOD first, followed by the Warden, before being valid for exit.
- **QR Code Integration:** Secure, dynamic QR codes are generated for approved passes, allowing Security Guards to scan and verify student identities instantly at the gate.
- **Real-Time Notifications:** Powered by Socket.io, users receive instant alerts when a gate pass is approved, rejected, or pending their review.
- **Cloud Document Storage:** Students can attach supporting documents or medical certificates using Cloudinary integration.
- **Admin Control Center:** Global system analytics and instant user management (role assignment).

---

## 🛠️ Tech Stack

### Frontend (Client)
- **React.js** (Vite)
- **Tailwind CSS** (for responsive, modern UI)
- **Framer Motion** (for smooth micro-animations)
- **Zustand** (for lightweight global state management)
- **Lucide React** (for iconography)

### Backend (Server)
- **Node.js & Express.js**
- **Prisma ORM**
- **MySQL** (Relational Database hosted on Railway)
- **Socket.io** (WebSockets for real-time bidirectional communication)
- **JSON Web Tokens (JWT)** (for secure, stateless authentication)
- **Cloudinary** (for secure image & document hosting)

---

## 🔄 System Workflow

1. **Request:** A Student logs in and submits a gate pass request (reason, dates, supporting document).
2. **Level 1 Approval:** The Head of Department (HOD) reviews the request and approves/rejects it.
3. **Level 2 Approval:** If HOD approves, the request moves to the Hostel Warden for final approval.
4. **Authorization:** Once approved by the Warden, a unique QR token is generated for the student.
5. **Exit & Entry:** The student presents the QR code to the Security Guard at the gate. The guard scans the code, confirming authorization, and marks the student as `EXITED` or `RETURNED`.

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- MySQL (Local or Remote)

### 1. Clone the repository
```bash
git clone https://github.com/jagankumar2006/smart-warden.git
cd smart-warden
```

### 2. Setup the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
DATABASE_URL="mysql://username:password@localhost:3306/smart_warden"
JWT_SECRET="your_jwt_secret"
FRONTEND_URL="http://localhost:5173"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```
Run database migrations:
```bash
npx prisma db push
```
Start the server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL="http://localhost:5000"
```
Start the development server:
```bash
npm run dev
```

---

## ☁️ Deployment Architecture

- **Frontend:** Deployed on **Vercel** with automatic CI/CD from the `main` branch.
- **Backend:** Deployed on **Render** (Node.js environment) with CORS configured to accept frontend traffic.
- **Database:** Hosted on **Railway** (MySQL instance).

---
*Designed and built by Jagankumar M.*

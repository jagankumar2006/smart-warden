# 🛡️ Smart Warden - Digital Hostel Gate Pass System

**Smart Warden** is a comprehensive, full-stack role-based application designed to digitize and streamline the hostel gate pass workflow for educational institutions. It replaces manual paper-based logs with a highly secure, real-time digital authorization system.

---

## 🚀 Live Demo
- **Frontend:** [https://smart-warden.vercel.app](https://smart-warden.vercel.app)
- **Backend API:** [https://smart-warden.onrender.com](https://smart-warden.onrender.com)

---

## 🛠️ Technology Stack & Hosting

### Frontend (Client)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand
- **Animations**: Framer Motion
- **QR Code Scanning**: `html5-qrcode` (Live device camera scanning)
- **Hosting**: Vercel (Auto-deploys via GitHub)

### Backend (Server)
- **Runtime Environment**: Node.js v24 + Express.js
- **Database ORM**: Prisma
- **Real-Time Engine**: Socket.io
- **Security**: JSON Web Tokens (JWT), bcrypt password hashing
- **File Uploads**: Cloudinary API (for documents and profile pictures)
- **Hosting**: Render (Free Tier - spins down after 15 minutes of inactivity)

### Database
- **Database System**: MySQL
- **Hosting**: Railway

---

## 👥 Role-Based Access Control (RBAC) & Features

The system is strictly divided into 5 distinct roles. Each role has access to specific dashboards and capabilities:

### 1. STUDENT
- **Dashboard**: View personal stats (total requests, pending, approved).
- **New Request Flow**: Submit new gate pass requests, attaching optional PDF/Image proofs via Cloudinary.
- **Pass Tracking**: Track whether a pass is pending at the HOD or WARDEN level.
- **QR Generation**: Upon final approval by the Warden, a unique cryptographic QR code is generated. Students can display this QR code to security.

### 2. HOD (Head of Department)
- **Dashboard**: View all pending requests from students strictly belonging to their department.
- **Approval Workflow (Step 1)**: Review the reason and attached documents. Approve or reject the request. If rejected, the pass is instantly terminated. If approved, it moves to the Warden.

### 3. WARDEN
- **Dashboard**: View requests from students in their specific hostel block that have already been approved by the HOD.
- **Approval Workflow (Step 2)**: Final academic/residential approval. Upon Warden approval, the student receives their QR code.

### 4. SECURITY
- **Dashboard**: The gate scanner panel.
- **Live QR Scanner**: Uses the device's built-in camera (rear camera on mobile) to scan a student's QR code.
- **Manual Entry**: Fallback option to type the Token ID manually.
- **Verification**: Cross-references the cryptographic token with the database. If valid and approved, it shows the student's face, block, and department.
- **Gate Action**: Security clicks "Confirm Exit" when the student leaves (changes status to `EXITED`), and "Confirm Return" when they come back (changes status to `RETURNED`).

### 5. ADMIN
- **Dashboard**: Control center for the entire platform.
- **Analytics**: View system-wide statistics (Total Users, Total Passes Issued, Pending Approvals).
- **User Management**: View every registered user. Admins can promote/demote users (e.g., upgrading a registered user to "HOD" or "SECURITY").

---

## 🔒 Security & Privacy

### Authentication & Authorization
- Passwords are never stored in plaintext; they are salted and hashed using `bcrypt`.
- Every API route is protected by a JWT middleware that verifies the token signature.
- `allowedRoles` middleware strictly prevents a Student from accessing Warden API endpoints, even if they guess the URL.

### Data Protection
- **Environment Variables**: Sensitive data (Database URLs, Cloudinary Secrets, JWT Secrets) are securely stored in `.env` files and managed via cloud provider dashboards (Render/Vercel).
- **CORS Protection**: The Express backend strictly limits Cross-Origin Resource Sharing to the specific Vercel frontend domain, preventing external malicious sites from hijacking API calls.

### File Storage Security
- User uploads (profile images and medical proofs) are stored securely on Cloudinary. The backend middleware filters files to ensure only images/PDFs under 5MB are accepted, preventing malicious script uploads.

### Anti-Spoofing (QR Codes)
- QR codes are not just simple IDs; they contain secure cryptographic tokens linked uniquely to the pass and the database. Scanning an old or fake QR code will immediately flag as "Invalid or Expired" on the Security dashboard.

---

## ⚡ Real-Time Interactions (Socket.io)
When an HOD approves a pass, the backend emits a real-time socket event. If the Warden is currently online, their dashboard instantly updates and a toast notification pops up. The same happens for the Student when the Warden gives final approval.

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
*© 2026 Designed and built by JAGANKUMAR. All rights reserved.*

# Smart Warden - Architecture & Documentation

## Overview
Smart Warden is a comprehensive full-stack application designed to digitize the hostel gate pass workflow. It features a robust multi-role architecture, real-time notifications, and strict data validation to ensure secure and efficient gate pass management.

## System Architecture

### Frontend (Client)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Framer Motion for micro-animations
- **State Management:** Zustand (Auth, Notifications, Toast)
- **Routing:** React Router v7
- **Validation:** React Hook Form + Zod
- **Real-time:** Socket.io-client

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** MySQL (Railway Free Tier)
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **Real-time:** Socket.io
- **Cloud Storage:** Cloudinary (for profile pictures and gate pass documents)

### Deployment Architecture
- **Frontend Hosting:** Vercel (Free Tier)
- **Backend Hosting:** Render (Free Tier)
- **Database Hosting:** Railway MySQL (Free Tier)

---

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ GatePass : "requests"
    User ||--o{ Notification : "receives"
    
    User {
        string id PK
        string email
        string password
        string name
        enum role "STUDENT, WARDEN, HOD, SECURITY, ADMIN"
        string department
        string hostel_block
        string profile_image
        string phone_number
        string emergency_contact
    }
    
    GatePass {
        string id PK
        string student_id FK
        datetime out_date
        datetime return_date
        string reason
        enum status "PENDING_HOD, PENDING_WARDEN, APPROVED, REJECTED, EXITED, RETURNED"
        string document_url
        string qr_token
    }
    
    Notification {
        string id PK
        string user_id FK
        string title
        string message
        boolean read
        datetime created_at
    }
    
    AuditLog {
        string id PK
        string actionType
        string description
        string userId FK
        string ipAddress
        datetime created_at
    }
```

---

## Workflow Diagram (Gate Pass Request)

```mermaid
sequenceDiagram
    participant Student
    participant Backend
    participant HOD
    participant Warden
    participant Security

    Student->>Backend: Create Gate Pass Request
    Backend-->>Student: Return Success
    Backend->>HOD: Emit Notification (Pending HOD)
    
    HOD->>Backend: Approve Gate Pass
    Backend-->>HOD: Return Success
    Backend->>Student: Emit Notification (HOD Approved)
    Backend->>Warden: Emit Notification (Pending Warden)
    
    Warden->>Backend: Approve Gate Pass
    Backend-->>Warden: Return Success
    Backend->>Student: Emit Notification (Fully Approved + QR Code Generated)
    
    Student->>Security: Show QR Code at Gate
    Security->>Backend: Scan QR Code & Mark EXITED
    Backend-->>Security: Return Success
    
    Student->>Security: Show QR Code upon Return
    Security->>Backend: Scan QR Code & Mark RETURNED
    Backend-->>Security: Return Success
```

---

## Core API Endpoints

### Auth / Profile
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update phone/emergency contact
- `PUT /api/auth/profile-picture` - Upload profile picture (Cloudinary)
- `PUT /api/auth/password` - Change password

### Gate Pass
- `POST /api/gatepass` - Create a new pass request (Student)
- `GET /api/gatepass` - Get passes (Filtered by role)
- `PATCH /api/gatepass/:id/status` - Update status (HOD, Warden, Security)

### Notifications
- `GET /api/auth/notifications` - Get all notifications for current user
- `PATCH /api/auth/notifications/:id/read` - Mark single notification as read
- `PATCH /api/auth/notifications/read-all` - Mark all notifications as read

### Admin
- `GET /api/admin/analytics` - Fetch system usage analytics
- `GET /api/admin/audit-logs` - Fetch audit logs
- `GET /api/admin/departments` - Manage departments
- `GET /api/admin/hostels` - Manage hostel blocks

### Password Recovery
- `POST /api/recovery/forgot-password` - Request reset link
- `POST /api/recovery/reset-password/:token` - Reset password

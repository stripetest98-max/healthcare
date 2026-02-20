# MediCare - Healthcare Application

A full-stack healthcare application with authentication, built with Next.js, Node.js, and Supabase.

## Features

- 🏥 Medical-themed landing page
- 🔐 User authentication (Login, Register, Forgot Password)
- 📊 User dashboard
- 🔒 Protected routes
- 💾 Supabase integration

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Supabase Setup

The Supabase credentials are already configured in `frontend/.env.local`. 

Make sure your Supabase project has:
- Email authentication enabled
- Email confirmations configured (optional)

### 3. Run the Application

```bash
# Start backend server (from backend folder)
cd backend
npm run dev

# Start frontend (from frontend folder, in a new terminal)
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Application Flow

1. **Landing Page** (`/`) - Medical-themed homepage with "Sign In" button
2. **Login** (`/login`) - Sign in with email/password
3. **Register** (`/register`) - Create new account
4. **Forgot Password** (`/forgot-password`) - Reset password via email
5. **Dashboard** (`/dashboard`) - Protected user dashboard (only accessible after login)

## Key Features

- Auto-redirect to dashboard if already logged in
- Auto-redirect to login if not authenticated
- Session management with Supabase
- Password reset functionality
- Responsive design

## Project Structure

```
├── backend/
│   ├── server.js          # Express server
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx       # Landing page
│   │   ├── login/         # Login page
│   │   ├── register/      # Register page
│   │   ├── forgot-password/ # Password reset
│   │   └── dashboard/     # User dashboard
│   ├── lib/
│   │   └── supabase.ts    # Supabase client
│   └── .env.local         # Environment variables
└── README.md
```

## Notes

- The landing page automatically redirects logged-in users to the dashboard
- After login/register, users are redirected to the dashboard
- The dashboard is protected and requires authentication
- Logout redirects to the landing page

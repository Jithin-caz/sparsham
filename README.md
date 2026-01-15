# Palliative Care Club Inventory System

A Next.js 16 application for managing palliative care equipment inventory with MongoDB backend.

## Features

- **Public Access**: Anyone can view available items and submit requests (no login required)
- **Club Members**: Can approve/reject item requests (requires login and approval)
- **Super User (Admin)**: Can add/remove items, approve club members, and view transaction logs

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- MongoDB with Mongoose
- Tailwind CSS v4
- bcryptjs for password hashing
- Session-based authentication

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/palliative-club
SESSION_SECRET=your-long-random-secret-key-change-this-in-production
DEFAULT_ITEM_IMAGE=https://via.placeholder.com/300x200?text=Palliative+Care
```

**Note**: Make sure MongoDB is running locally, or update `MONGODB_URI` to your MongoDB Atlas connection string.

### 3. Start MongoDB

Make sure MongoDB is running on your system. If using local MongoDB:

```bash
# Windows (if MongoDB is installed as a service, it should start automatically)
# Or start manually:
mongod
```

### 4. Create Initial Super User

Start the development server:

```bash
npm run dev
```

Then seed the requested super user (bcrypt-hashed) into MongoDB:

```bash
npm run seed:super
```

Or create a super user via API by making a POST request to `/api/auth/seed-super`:

**Using PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/auth/seed-super -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"name":"Admin","email":"admin@example.com","password":"admin123"}'
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/auth/seed-super -H "Content-Type: application/json" -d "{\"name\":\"Admin\",\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```

### 5. Access the Application

- **Public Home**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Member Dashboard**: http://localhost:3000/member/dashboard (requires login)
- **Admin Dashboard**: http://localhost:3000/admin/dashboard (requires super user login)

## User Roles

### General Public
- Can view all available items
- Can submit requests with College ID, Name, Class, and Phone
- No login required

### Club Members
- Must be registered by admin
- Must be approved by admin before login
- Can approve/reject item requests
- Can view all requests

### Super User (Admin)
- Can add/remove items
- Can register new club members
- Can approve pending club members
- Can view transaction logs (weekly/monthly/yearly)

## Project Structure

```
sparsham/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── items/        # Item management
│   │   ├── requests/     # Request handling
│   │   ├── members/      # Member management
│   │   └── logs/         # Transaction logs
│   ├── admin/            # Admin dashboard
│   ├── member/           # Member dashboard
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
├── lib/                  # Utilities (auth, MongoDB)
├── models/               # Mongoose models
└── middleware.ts         # Route protection
```

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Security Notes

- Passwords are hashed using bcryptjs
- Sessions are stored in httpOnly cookies
- Route protection via middleware and server-side checks
- Super user routes require authentication and role verification

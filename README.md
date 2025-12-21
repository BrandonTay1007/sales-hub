# Pebble Sales Hub

> A modern sales commission tracking system for social media campaigns

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [License](#license)

## About

Pebble Sales Hub is a custom-built sales tracking and commission management system designed for businesses selling products through social media platforms (Facebook and Instagram).

**The Problem:**  
Manual tracking of sales and commissions using Excel and paper creates accuracy issues, especially as the business scales. Sales persons need clear visibility into their earnings, and administrators need reliable tools to manage campaigns and calculate payouts.

**The Solution:**  
A web-based platform that automates sales tracking, locks commission rates at the time of sale (commission snapshot), and provides real-time insights into performance through an intuitive dashboard.

## Features

### For Administrators
- **User Management** - Create and manage admin and sales person accounts with custom commission rates
- **Campaign Tracking** - Monitor Facebook and Instagram campaigns (posts, events, live streams)
- **Order Management** - Record multi-product sales orders with automatic total and commission calculations
- **Team Payouts** - View consolidated commission reports across all sales staff
- **Analytics Dashboard** - Performance insights, leaderboards, and revenue trends

### For Sales Personnel
- **Campaign Overview** - View assigned campaigns and performance metrics
- **Order History** - Track all sales orders under their campaigns
- **Commission Reports** - Monthly payout breakdowns by campaign
- **Personal Analytics** - Individual performance stats and rankings

### Core Capabilities
- **Commission Snapshot Logic** - Locks commission rates at order creation time, ensuring fair payouts even if rates change later
- **Human-Readable IDs** - Auto-generated reference IDs for campaigns (e.g., `FB-001`) and orders (e.g., `FB-001-12`)
- **Role-Based Access Control** - Separate views and permissions for admins and sales staff
- **Real-Time Calculations** - Automatic order totals and commission amounts
- **Flexible Product Management** - Add, edit, or remove products from orders with automatic recalculation

## Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Recharts** - Data visualization
- **Framer Motion** - Smooth animations

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe server code
- **MongoDB** - NoSQL database
- **Prisma ORM** - Type-safe database client
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose (recommended for MongoDB)
- **Git** for version control

> **Note**: While you can install MongoDB locally, using Docker is recommended for easier setup and consistency across environments.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sales-hub
   ```

2. **Start MongoDB with Docker** (recommended)
   ```bash
   # Create and start MongoDB container
   docker run -d \
     --name pebble-mongodb \
     -p 27017:27017 \
     -e MONGO_INITDB_DATABASE=pebble-sales-hub \
     mongo:6
   ```
   
   Or use Docker Compose (create `docker-compose.yml` in root):
   ```yaml
   services:
     mongodb:
       image: mongo:7.0
       container_name: pebble-mongodb
       ports:
         - "27017:27017"
       environment:
         MONGO_INITDB_DATABASE: pebble-sales-hub
       volumes:
         - mongodb_data:/data/db
       restart: unless-stopped
       command: ["--replSet", "rs0", "--bind_ip_all"]
   
   volumes:
     mongodb_data:
       driver: local
   ```
   
   Then run:
   ```bash
   docker-compose up -d
   ```

3. **Install frontend dependencies**
   ```bash
   npm install
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Set up environment variables**

   Create `.env` files in both root and `backend/` directories:

   **Root `.env`:**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

   **Backend `.env`:**
   ```env
   DATABASE_URL="mongodb://localhost:27017/pebble-sales-hub"
   JWT_SECRET="your-secret-key-here"
   PORT=3000
   ```

6. **Initialize the database**
   ```bash
   cd backend
   
   # Generate Prisma Client (required after npm install)
   npx prisma generate
   
   # Push schema to MongoDB
   npx prisma db push
   
   # Seed with test data
   npm run seed
   ```
   
   > **Important**: `npx prisma generate` must be run after `npm install` on any new machine. This generates the Prisma Client based on your schema.

### Running the Application

1. **Start the backend server** (from `backend/` directory)
   ```bash
   npm run dev
   ```
   Backend runs on `http://localhost:3000`

2. **Start the frontend** (from root directory)
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:8080`

3. **Access the application**
   - Open `http://localhost:8080` in your browser
   - Use test credentials below to log in

## Usage

### Test Credentials

**Administrator Account:**
- Username: `admin`
- Password: `admin123`

**Sales Person Accounts:**
- Username: `sarah.j` | Password: `password123`
- Username: `mike.c` | Password: `password123`
- Username: `emma.w` | Password: `password123`

### Key Workflows

1. **Admin: Create a Campaign**
   - Navigate to Campaigns → Create Campaign
   - Assign to a sales person
   - Campaign gets a unique ID (e.g., `FB-001`)

2. **Admin: Register an Order**
   - Navigate to Orders → Add Order
   - Select campaign and add products
   - Commission is automatically calculated and locked

3. **Sales Person: View Payouts**
   - Navigate to My Payouts
   - Select month/year to view earnings breakdown by campaign

4. **View Analytics**
   - Dashboard shows performance metrics
   - Leaderboard ranks top performers

## Project Structure

```
sales-hub/
├── src/                    # Frontend source code
│   ├── features/          # Feature-based modules (auth, campaigns, orders, etc.)
│   ├── components/        # Shared UI components
│   ├── lib/              # API client and utilities
│   └── contexts/         # React contexts (Auth, Theme)
├── backend/               # Backend API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, error handling
│   │   └── utils/        # Helper functions
│   │   └── apps.ts       # Main application file  
│   └── prisma/           # Database schema and migrations
├── docs/                  # Documentation
│   ├── API.md            # API endpoint reference
│   ├── FEATURES.md       # Core business logic
│   ├── README.md         # Setup and deployment guide
│   └── requirements/     # Project requirements
└── agent-os/             # Development specifications and AI prompts
```

## Documentation

- **[Setup Guide](./docs/README.md)** - Detailed installation and deployment instructions
- **[API Reference](./docs/API.md)** - Complete API endpoint documentation
- **[Feature Logic](./docs/FEATURES.md)** - In-depth explanation of commission snapshots, RBAC, and core features
- **[User Guide](./docs/USER_GUIDE.md)** - Step-by-step guide for end users
- **[Requirements](./docs/requirements/)** - Original project requirements and specifications

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ for efficient sales tracking and fair commission management**

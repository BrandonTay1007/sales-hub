# Pebble Sales Hub

Pebble Sales Hub is a professional sales commission tracking system designed for businesses selling products through social media campaigns (Facebook, Instagram). It replaces manual spreadsheets with a high-performance web application, providing real-time tracking of sales person performance and accurate commission payouts.

## 🚀 Key Features

- **Campaign Management**: Track performance across Facebook and Instagram (Live, Posts, Events).
- **Order Tracking**: captured directly under campaigns with automated commission snapshots.
- **Commission Snapshot Logic**: Accurately calculates payouts by locking the commission rate at the time of sale, protecting against future rate changes.
- **Payout Reports**: Detailed monthly and yearly commission breakdown for sales persons.
- **Sales Leaderboard**: Real-time performance ranking by Sales Person or Campaign.
- **Human-Readable IDs**: Automatic generation of professional reference IDs (e.g., `FB-001`, `FB-001-01`).
- **Data Integrity**: 5-second undo window for deletions and comprehensive admin protections.

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript** & **Vite**
- **Tailwind CSS** & **shadcn/ui** for premium styling
- **TanStack Query** for efficient data fetching
- **Recharts** for interactive data visualization

### Backend
- **Node.js** & **Express** with **TypeScript**
- **MongoDB** with **Prisma ORM**
- **JWT Authentication** (jsonwebtoken + bcryptjs)

---

## 💻 Getting Started

### Prerequisites

- **Node.js 18+**
- **Docker Desktop** (for running MongoDB locally)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd sales-hub

# Install Frontend dependencies
npm install

# Install Backend dependencies
cd backend
npm install
```

### Step 2: Environment Setup

1. **Frontend**: The frontend uses `http://localhost:3000/api` by default. Copy `.env.example` to `.env` in the root directory if you need to change this.
2. **Backend**: Copy `backend/.env.example` to `backend/.env` and update the `JWT_SECRET`.

### Step 3: Run the Database

The project uses MongoDB. Start the local instance using Docker:

```bash
cd backend
docker-compose up -d
```

### Step 4: Initialize the Database

```bash
cd backend
# Generate Prisma client
npx prisma generate
# Push the schema to MongoDB
npm run prisma:push
# Seed with initial test data (Admin/Sales accounts)
npm run seed
```

### Step 5: Start the Application

Open two terminal windows:

**Terminal 1 (Backend)**:
```bash
cd backend
npm run dev
```
*Backend runs at `http://localhost:3000`*

**Terminal 2 (Frontend)**:
```bash
# From the root directory
npm run dev
```
*Frontend runs at `http://localhost:8080`*

---

## 🍎 Cross-Platform Support (macOS/Linux)

While the project is designed to be cross-platform, users on macOS or Linux might encounter these common issues:

### 1. MongoDB Replica Set Initialization
Prisma requires a replica set for transactions. If you see connection errors:
```bash
docker exec -it pebble-mongodb mongosh --eval "rs.initiate()"
```

### 2. Apple Silicon (M1/M2/M3)
If the MongoDB container crashes or performs poorly, ensure you are using a modern Docker Desktop version. You can also explicitly set the platform in `docker-compose.yml`:
```yaml
services:
  mongodb:
    platform: linux/amd64
```

### 3. Case-Sensitivity (Linux)
Linux file systems are case-sensitive. Ensure all `import` statements exactly match the filename casing (e.g., `App.tsx` vs `app.tsx`).

### 4. Native Modules
If moving the project between different operating systems, **always** delete `node_modules` and run `npm install` to rebuild native binaries like `bcrypt`.

---

## 🔑 Test Credentials

After running the seed script, you can log in with:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Sales** | `sarah.j` | `password123` |

---

## 📂 Project Structure

- `/src`: Frontend application (Pages, Components, Contexts)
- `/backend`: Node.js API, Prisma schema, and seed data
- `/agent-os`: Project roadmap and technical specifications
- `/requirements`: Business rules and original project scope

## 📄 License

This project is proprietary and intended for internal use by Pebble Tech.

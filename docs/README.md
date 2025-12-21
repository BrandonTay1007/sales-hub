# Pebble Sales Hub

Pebble Sales Hub is a professional sales commission tracking system designed for businesses selling products through social media campaigns (Facebook, Instagram). It replaces manual spreadsheets with a high-performance web application, providing real-time tracking of salesperson performance and accurate commission payouts.

---

## Key Features

*   **Campaign Management**: Track performance across Facebook and Instagram (Live, Posts, Events).
*   **Order Tracking**: captured directly under campaigns with automated commission snapshots.
*   **Commission Tracking**: Accurately calculates payouts by locking the commission rate at the time of sale, protecting against future rate changes.
*   **Payout Reports**: Detailed monthly and yearly commission breakdown for sales persons.
*   **Sales Leaderboard**: Real-time performance ranking by Sales Person or Campaign.

---

## Tech Stack

### Frontend
*   React 18 with TypeScript & Vite
*   Tailwind CSS & shadcn/ui for styling
*   TanStack Query for data fetching
*   Recharts for data visualization

### Backend
*   Node.js & Express with TypeScript
*   MongoDB with Prisma ORM
*   JWT Authentication (jsonwebtoken + bcryptjs)

---

## Getting Started

### Prerequisites
*   Node.js 18+
*   Docker Desktop (for running MongoDB locally)

### 1. Clone and Install
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

### 2. Environment Setup
*   **Frontend**: The frontend uses `http://localhost:3000/api` by default. Copy `.env.example` to `.env` in the root directory if you need to change this.
*   **Backend**: Copy `backend/.env.example` to `backend/.env` and update the `JWT_SECRET`.

### 3. Run the Database
The project uses MongoDB. Start the local instance using Docker:
```bash
cd backend
docker-compose up -d
```

### 4. Initialize the Database
```bash
cd backend
# Generate Prisma client
npx prisma generate
# Push the schema to MongoDB
npm run prisma:push
# Seed with initial test data (Admin/Sales accounts)
npm run seed
```

### 5. Start the Application
Open two terminal windows:

**Terminal 1 (Backend)**:
```bash
cd backend
npm run dev
```
*Backend runs at http://localhost:3000*

**Terminal 2 (Frontend)**:
```bash
# From the root directory
npm run dev
```
*Frontend runs at http://localhost:8080*

---

## Cross-Platform Support (macOS/Linux)

While the project is designed to be cross-platform, users on macOS or Linux might encounter these common issues:

1.  **MongoDB Replica Set Initialization**: Prisma requires a replica set for transactions. If you see connection errors, run:
    `docker exec -it pebble-mongodb mongosh --eval "rs.initiate()"`
2.  **Apple Silicon (M1/M2/M3)**: If the MongoDB container crashes or performs poorly, ensure you are using a modern Docker Desktop version. You can also explicitly set the platform in `docker-compose.yml`:
    ```yaml
    services:
      mongodb:
        platform: linux/amd64
    ```
3.  **Case-Sensitivity (Linux)**: Linux file systems are case-sensitive. Ensure all import statements exactly match the filename casing.
4.  **Native Modules**: If moving the project between different operating systems, always delete `node_modules` and run `npm install` to rebuild native binaries like `bcrypt`.

---

## Test Credentials

After running the seed script, you can log in with:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Sales | `sarah.j` | `password123` |

---

## Project Structure

This project uses a feature-driven modular architecture for the frontend.

```
/src
  /features       # Domain-specific logic (auth, campaigns, orders, etc.)
  /components
    /layout       # Global layout elements (Sidebar, TopBar)
    /shared       # Reusable components (Dialogs, Error boundaries)
    /ui           # Base UI components (shadcn/ui)
  /contexts       # Global state (Auth)
  /lib            # API helpers and utilities
/backend          # Node.js API, Prisma schema, and seed data
/docs             # Requirements and documentation
  ├── API.md      # Detailed API endpoint reference
  ├── FEATURES.md # In-depth business logic explanations
  └── README.md   # Deployment and setup guide
/agent-os         # Project roadmap and technical specifications
```

---

## License
This project is proprietary and intended for internal use by Pebble Tech.

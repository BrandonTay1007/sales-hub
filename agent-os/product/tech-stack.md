# Pebble Sales Hub - Tech Stack

## Overview

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | React + TypeScript + Vite | Complete |
| Backend | Node.js + Express + JavaScript | To build |
| Database | MongoDB | To set up |
| ORM | Prisma | To set up |
| Auth | JWT (jsonwebtoken) | To implement |

---

## Frontend Stack (Complete)

### Framework & Build
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18.x |
| Language | JavaScript | 5.x |
| Build Tool | Vite | 7.x |
| Package Manager | npm | - |

### Styling & UI
| Component | Technology | Purpose |
|-----------|------------|---------|
| CSS Framework | Tailwind CSS | Utility-first styling |
| UI Components | shadcn/ui | Pre-built accessible components |
| Icons | Lucide React | Icon library |
| Charts | Recharts | Data visualization |
| Animations | Framer Motion | UI animations |

### State & Data
| Component | Technology | Purpose |
|-----------|------------|---------|
| Server State | TanStack Query | API data fetching & caching |
| Forms | React Hook Form | Form state management |
| Validation | Zod | Schema validation |
| Routing | React Router | Client-side routing |
| Notifications | Sonner | Toast notifications |

---

## Backend Stack (To Build)

### Runtime & Framework
| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | 20+ |
| Language | JavaScript (ES6+) | - |
| Framework | Express.js | 4.x |
| Dev Server | nodemon | 3.x |

### Database & ORM
| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | MongoDB | Document database |
| ORM | Prisma | Type-safe database client |
| Hosting | MongoDB Atlas (or local) | Database hosting |

### Security & Auth
| Component | Technology | Purpose |
|-----------|------------|---------|
| Authentication | JWT (jsonwebtoken) | Token-based auth |
| Password Hashing | bcrypt | Secure password storage |
| Validation | Zod | Request validation |
| CORS | cors | Cross-origin requests |

### Configuration
| Component | Technology | Purpose |
|-----------|------------|---------|
| Environment | dotenv | Environment variables |

---

## Database Schema

### Collections (MongoDB)

```
users
├── _id (ObjectId)
├── name (String)
├── username (String, unique)
├── passwordHash (String)
├── role (Enum: admin, sales)
├── commissionRate (Float)
├── status (Enum: active, inactive)
├── createdAt (DateTime)
└── updatedAt (DateTime)

campaigns
├── _id (ObjectId)
├── title (String)
├── socialMedia (Enum: facebook, instagram)
├── type (Enum: post, event, live)
├── url (String)
├── salesPersonId (ObjectId → users)
├── createdAt (DateTime)
└── updatedAt (DateTime)

orders
├── _id (ObjectId)
├── campaignId (ObjectId → campaigns)
├── products (Array of embedded documents)
│   ├── name (String)
│   ├── quantity (Int)
│   └── basePrice (Float)
├── orderTotal (Float)
├── snapshotRate (Float)
├── commissionAmount (Float)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

---

## API Structure

```
/api
├── /auth
│   ├── POST /login
│   └── GET /me
├── /users
│   ├── GET / (admin)
│   ├── POST / (admin)
│   ├── PUT /:id (admin)
│   └── DELETE /:id (admin)
├── /campaigns
│   ├── GET /
│   ├── POST / (admin)
│   ├── PUT /:id (admin)
│   └── DELETE /:id (admin)
├── /orders
│   ├── GET /
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
└── /payouts
    ├── GET /me (sales)
    └── GET /team (admin)
```

---

## Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Prisma Studio | Database GUI |
| Postman / Thunder Client | API testing |
| MongoDB Compass | Database management |

---

## Deployment Options

### Backend
| Platform | Notes |
|----------|-------|
| Local | For development only |

### Frontend
| Platform | Notes |
|----------|-------|
| Local | For development only |

### Database
| Platform | Notes |
|----------|-------|
| Local MongoDB | For development only |

---

## Environment Variables

### Backend (.env)
```bash
PORT=3000
NODE_ENV=development
DATABASE_URL="mongodb://localhost:27017/pebble_sales_hub"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:8080"
```

### Frontend (.env)
```bash
VITE_API_URL="http://localhost:3000/api"
```

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| JavaScript| JavaScript | Simpler setup, faster development |
| MongoDB over PostgreSQL | MongoDB | Flexible schema, embedded products array |
| Prisma over Mongoose | Prisma | Better DX, type safety, migrations |
| JWT over sessions | JWT | Stateless, works well with React |
| Zod for validation | Zod | Same library frontend & backend |


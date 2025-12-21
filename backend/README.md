# Pebble Sales Hub - Backend API

REST API backend for the Pebble Sales Hub sales commission tracking system.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ORM**: Prisma
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Testing**: Jest

## Prerequisites

- Node.js 18+
- Docker Desktop (for MongoDB)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start MongoDB (Docker)

```bash
docker-compose up -d
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Push Schema to Database

```bash
npm run prisma:push
```

### 5. Seed Database

```bash
npm run seed
```

### 6. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm run start` | Run production build |
| `npm run test` | Run unit tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema to database |
| `npm run seed` | Seed database with test data |

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/                  # Unit tests for business logic
│   └── commission.test.ts # Commission calculation tests
└── integration/           # API endpoint tests
    ├── auth.test.ts      # Authentication endpoints
    ├── users.test.ts     # User CRUD endpoints
    └── orders.test.ts    # Order CRUD with commission
```

### Test Coverage

The test suite covers:

**Unit Tests:**
- ✅ Commission calculation (`calculateCommission`)
- ✅ Order total calculation (`calculateOrderTotal`)
- ✅ Product validation (`validateProducts`)
- ✅ Commission snapshot logic (CRITICAL business rule)

**Integration Tests:**
- ✅ Authentication (login, token validation)
- ✅ User management (CRUD, last admin protection)
- ✅ Order management (CRUD, commission snapshot)

### Writing New Tests

**Unit Test Example:**
```typescript
// tests/unit/myFeature.test.ts
import { myFunction } from '../../src/utils/myFeature';

describe('My Feature', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

**Integration Test Example:**
```typescript
// tests/integration/myEndpoint.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('GET /api/my-endpoint', () => {
  it('should return data', async () => {
    const response = await request(app)
      .get('/api/my-endpoint')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after each test
3. **Descriptive Names**: Use clear test descriptions
4. **Coverage**: Aim for >80% coverage on business logic
5. **Critical Paths**: Always test commission calculation and snapshot logic

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
PORT=3000
DATABASE_URL=mongodb://localhost:27017/pebble-sales-hub
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8080
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Current user | Yes |

### Users (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get user |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Campaigns

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/campaigns` | List campaigns | Filtered by role |
| GET | `/api/campaigns/:id` | Get campaign | Filtered by role |
| POST | `/api/campaigns` | Create campaign | Admin only |
| PUT | `/api/campaigns/:id` | Update campaign | Admin only |
| DELETE | `/api/campaigns/:id` | Delete campaign | Admin only |

### Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/orders` | List orders | Filtered by role |
| GET | `/api/orders/:id` | Get order | Filtered by role |
| POST | `/api/orders` | Create order | Auth required |
| PUT | `/api/orders/:id` | Update order | Auth required |
| DELETE | `/api/orders/:id` | Delete order | Auth required |

### Payouts

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/payouts/me` | My payout | Sales only |
| GET | `/api/payouts/team` | Team payouts | Admin only |

## Test Credentials

After running seed:

- **Admin**: `admin` / `admin123`
- **Sales**: `sarah.j` / `password123` (and other sales users)

## Business Rules

### Commission Snapshot (CRITICAL)

- Commission rate is captured at order creation time as `snapshotRate`
- This rate NEVER changes, even if sales person's rate is updated
- On order update, commission is recalculated using ORIGINAL `snapshotRate`

### Immutable Fields

- `Campaign.salesPersonId` - Cannot change after creation
- `Order.campaignId` - Cannot change after creation
- `Order.snapshotRate` - Set at creation, never changes

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # Route definitions
│   ├── middleware/      # Auth, error handling
│   ├── utils/           # Helper functions
│   ├── lib/             # Database client
│   ├── app.ts           # Express app
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # API tests
└── docker-compose.yml   # MongoDB
```

## Related Documentation

- Full API specification: `requirements/01-base-requirements.md`
- Product roadmap: `agent-os/product/roadmap.md`

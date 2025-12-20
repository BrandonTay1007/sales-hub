# Pebble Sales Hub - Backend Requirements

## Project Overview

Build a REST API backend for **Pebble Sales Hub** - a sales commission tracking system for a startup company that sells products through social media campaigns (Facebook, Instagram).

### Business Context

The company has been recording sales manually with Excel and papers. As the business grew, this manual process created problems in:
- Recording accurate sales
- Paying out sales persons correctly

The system needs to track sales person performance based on campaigns and sales orders, and correctly calculate commission payouts.

---

## User Roles & Permissions

### Admin
- Full access to all system features
- Manage users (CRUD operations)
- Manage campaigns (CRUD operations)
- Manage orders (CRUD operations)
- View all commission/payout data for all sales persons

### Sales Person
- View only their assigned campaigns (read-only on campaign details)
- View orders under their assigned campaigns (read-only)
- View their own commission payout by month with campaign breakdown
- **Cannot**: manage users, create/edit/delete campaigns, create/edit/delete orders

---

## Data Models

### User
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary Key |
| name | string | Required |
| username | string | Required, Unique |
| passwordHash | string | Required |
| role | enum | `admin` or `sales` |
| commissionRate | decimal | 0-100, required for sales persons |
| status | enum | `active` or `inactive`, default: `active` |
| createdAt | timestamp | Auto-generated |
| updatedAt | timestamp | Auto-updated |

### Campaign
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary Key |
| title | string | Required |
| socialMedia | enum | `facebook` or `instagram` |
| type | enum | `post`, `event`, or `live` |
| url | string | Required, valid URL |
| salesPersonId | UUID | FK → User, **IMMUTABLE after creation** |
| createdAt | timestamp | Auto-generated |
| updatedAt | timestamp | Auto-updated |

### Order
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary Key |
| campaignId | UUID | FK → Campaign, **IMMUTABLE after creation** |
| products | JSONB | Array of product objects |
| orderTotal | decimal | Calculated field |
| snapshotRate | decimal | Commission % locked at order creation |
| commissionAmount | decimal | Calculated field |
| createdAt | timestamp | Auto-generated |
| updatedAt | timestamp | Auto-updated |

#### Product Object Structure (within Order.products)
```json
{
  "name": "string",
  "quantity": "integer",
  "basePrice": "decimal"
}
```

### Entity Relationships
```
User (1) ←——→ (Many) Campaign
Campaign (1) ←——→ (Many) Order
```

---

## Business Rules

### 1. Commission Snapshot Logic (CRITICAL)

When an **order is CREATED**:
1. Look up the sales person via: `Order → Campaign → User`
2. Capture the sales person's current `commissionRate` as `snapshotRate`
3. Calculate: `commissionAmount = orderTotal × (snapshotRate / 100)`
4. Store `snapshotRate` - it **NEVER changes**, even if the sales person's rate changes later

**Example:**
- Order created with total RM100
- Sales person's current rate: 10%
- `snapshotRate` = 10, `commissionAmount` = RM10
- If sales person's rate later increases to 15%, this order's commission remains RM10

### 2. Order Update Logic

When an **order's products are UPDATED**:
1. Recalculate `orderTotal` from new products: `SUM(quantity × basePrice)`
2. Recalculate `commissionAmount` using the **ORIGINAL** `snapshotRate`
3. Formula: `commissionAmount = newOrderTotal × (snapshotRate / 100)`

**Example:**
- Original order: RM100, snapshotRate 10%, commission RM10
- Products updated, new total: RM150
- New commission: RM150 × 10% = RM15 (uses original snapshotRate)

### 3. Immutability Rules

| Field | On Entity | Rule |
|-------|-----------|------|
| salesPersonId | Campaign | Set at creation, **CANNOT be edited** |
| campaignId | Order | Set at creation, **CANNOT be edited** |

Return `400 Bad Request` if client attempts to change these fields.

### 4. Cascade Deletion Rules

**Delete Campaign:**
- All orders under the campaign are deleted
- Commission amounts from those orders are no longer counted in payouts

**Delete Order:**
- The order's commission is removed from the sales person's totals

### 5. Order Total Calculation
```
orderTotal = SUM(product.quantity × product.basePrice) for all products
```

### 6. Commission Calculation
```
commissionAmount = orderTotal × (snapshotRate / 100)
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login with username/password | No |
| POST | `/api/auth/logout` | Invalidate token | Yes |
| GET | `/api/auth/me` | Get current user profile | Yes |

#### Login Request/Response
```json
// POST /api/auth/login
// Request
{
  "username": "sarah.j",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "Sarah Johnson",
      "role": "sales",
      "commissionRate": 12
    }
  }
}
```

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get single user |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Campaigns

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/campaigns` | List campaigns | Admin: all, Sales: only assigned |
| GET | `/api/campaigns/:id` | Get campaign with stats | Admin: any, Sales: only if assigned |
| POST | `/api/campaigns` | Create campaign | Admin only |
| PUT | `/api/campaigns/:id` | Update campaign (salesPersonId immutable!) | Admin only |
| DELETE | `/api/campaigns/:id` | Delete campaign + cascade orders | Admin only |

### Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/orders` | List orders (filterable) | Admin: all, Sales: only from their campaigns |
| GET | `/api/orders/:id` | Get single order | Admin: any, Sales: only from their campaigns |
| POST | `/api/orders` | Create order | Admin or Sales (for their campaigns) |
| PUT | `/api/orders/:id` | Update order products | Admin or Sales (for their campaigns) |
| DELETE | `/api/orders/:id` | Delete order | Admin or Sales (for their campaigns) |

#### Order Query Parameters
- `campaignId` - Filter by campaign
- `startDate` - Filter orders from date (YYYY-MM-DD)
- `endDate` - Filter orders to date (YYYY-MM-DD)

### Commission Payouts

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/payouts/me` | Sales person's own payout | Sales only |
| GET | `/api/payouts/team` | All sales persons' payouts | Admin only |

#### Payout Query Parameters
- `year` - Required (e.g., 2025)
- `month` - Required (1-12)

#### Sales Person Payout Response
```json
// GET /api/payouts/me?year=2025&month=12
{
  "success": true,
  "data": {
    "year": 2025,
    "month": 12,
    "totalCommission": 1250.00,
    "campaigns": [
      {
        "campaignId": "uuid",
        "title": "Summer Sale 2025",
        "orderCount": 5,
        "totalSales": 5000.00,
        "totalCommission": 500.00
      },
      {
        "campaignId": "uuid",
        "title": "Flash Friday Deals",
        "orderCount": 3,
        "totalSales": 3000.00,
        "totalCommission": 360.00
      }
    ]
  }
}
```

#### Admin Team Payout Response
```json
// GET /api/payouts/team?year=2025&month=12
{
  "success": true,
  "data": {
    "year": 2025,
    "month": 12,
    "grandTotalCommission": 5000.00,
    "salesPersons": [
      {
        "userId": "uuid",
        "name": "Sarah Johnson",
        "currentRate": 12,
        "totalCommission": 1250.00,
        "campaigns": [
          {
            "campaignId": "uuid",
            "title": "Summer Sale 2025",
            "orderCount": 5,
            "totalCommission": 500.00
          }
        ]
      }
    ]
  }
}
```

---

## Validation Rules

### User Validation
| Field | Rules |
|-------|-------|
| name | Required, min 2 characters |
| username | Required, min 3 characters, alphanumeric + dots/underscores, unique |
| password | Required, min 6 characters |
| role | Required, must be `admin` or `sales` |
| commissionRate | Required for sales, 0 ≤ rate ≤ 100 |

### Campaign Validation
| Field | Rules |
|-------|-------|
| title | Required, min 3 characters |
| socialMedia | Required, must be `facebook` or `instagram` |
| type | Required, must be `post`, `event`, or `live` |
| url | Required, valid URL format |
| salesPersonId | Required, must exist, must be a user with role `sales` |

### Order Validation
| Field | Rules |
|-------|-------|
| campaignId | Required, must exist |
| products | Required, at least 1 product |
| products[].name | Required |
| products[].quantity | Required, integer ≥ 1 |
| products[].basePrice | Required, decimal ≥ 0 |

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Success Response with Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {
      "fieldName": ["Error message for this field"]
    }
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict (e.g., duplicate username) |
| INTERNAL_ERROR | 500 | Server error |

---

## Database Considerations

### Recommended Indexes
- `users.username` (unique)
- `campaigns.salesPersonId`
- `orders.campaignId`
- `orders.createdAt` (for date range filtering)

### Data Types
- Currency: Store as `DECIMAL(10, 2)` - Malaysian Ringgit (RM)
- Dates: Store as `TIMESTAMP WITH TIME ZONE`
- Products: Store as `JSONB` for flexibility

---

## Seed Data Requirements

Create a seed script with:
- 1 admin user (username: `admin`, password: `admin123`)
- 3-5 sales persons with varying commission rates (8-15%)
- 5-10 campaigns distributed across sales persons
- 20-50 orders distributed across campaigns and months

---

## Frontend Integration Notes

- Frontend runs on `localhost:8080` - configure CORS accordingly
- Frontend uses React Query - expects consistent response shapes
- Currency display: Malaysian Ringgit (RM)
- Date format: ISO 8601 (YYYY-MM-DD)
- Frontend path aliases: `@/` maps to `src/`

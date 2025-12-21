# Pebble Sales Hub - Node.js/JavaScript Implementation Guide

## Coding Standards Reference

This implementation follows the team's coding standards from `agent-os/standards/`:

### API Conventions
- RESTful URLs with plural nouns (`/users`, `/campaigns`, `/orders`)
- Appropriate HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- Consistent status codes: 200, 201, 400, 401, 403, 404, 500

### Validation Approach
- Server-side validation with Zod
- Fail early with specific, user-friendly error messages
- Never trust client-side validation alone

### Error Handling
- Centralized error handler middleware
- User-friendly messages without technical details
- Specific error types for targeted handling

### Code Style
- Self-documenting code with clear naming
- Small, focused functions (single responsibility)
- DRY principle - extract common logic
- Minimal comments - only for complex logic

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js 20+ | JavaScript runtime |
| Language | JavaScript (ES6+) | Modern JS with async/await |
| Framework | Express.js | HTTP server & routing |
| ORM | Prisma | Database access & schema management |
| Database | MongoDB | Primary data store (NoSQL document DB) |
| Auth | JWT (jsonwebtoken) | Token-based authentication |
| Password | bcrypt | Secure password hashing |
| Validation | Zod | Schema validation |
| Environment | dotenv | Environment variables |
| Dev Server | nodemon | Auto-restart on file changes |

---

## Understanding bcrypt and Zod

### bcrypt - Password Hashing

Securely hashes passwords before storing. Never store plain text passwords.

```javascript
const bcrypt = require('bcrypt');

// When user registers:
const plainPassword = 'user123';
const hashedPassword = await bcrypt.hash(plainPassword, 10);
// Result: "$2b$10$N9qo8uLOickgx2ZMRZoMye..." (different each time)

// When user logs in:
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
// Returns: true or false
```

### Zod - Schema Validation

Validates incoming request data with clear error messages.

```javascript
const { z } = require('zod');

// Define validation schema
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be 18 or older').optional(),
});

// In route handler
const result = createUserSchema.safeParse(req.body);

if (!result.success) {
  return res.status(400).json({ 
    success: false, 
    errors: result.error.flatten() 
  });
}

// result.data is validated and safe to use
const { name, email, age } = result.data;
```

---

## Project Structure

```
backend/
├── src/
│   ├── index.js               # App entry point
│   ├── app.js                 # Express app setup
│   ├── config/
│   │   └── database.js        # Prisma client instance
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js    # Centralized error handler
│   │   └── validate.js        # Zod validation middleware
│   ├── routes/
│   │   ├── index.js           # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── campaigns.routes.js
│   │   ├── orders.routes.js
│   │   └── payouts.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── users.service.js
│   │   ├── campaigns.service.js
│   │   ├── orders.service.js
│   │   └── payouts.service.js
│   └── schemas/
│       ├── auth.schema.js
│       ├── user.schema.js
│       ├── campaign.schema.js
│       └── order.schema.js
├── prisma/
│   ├── schema.prisma          # MongoDB schema
│   └── seed.js                # Seed data script
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment template
├── package.json
└── README.md
```

---

## Prisma Schema for MongoDB

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

enum UserRole {
  admin
  sales
}

enum UserStatus {
  active
  inactive
}

enum SocialMedia {
  facebook
  instagram
}

enum CampaignType {
  post
  event
  live
}

type Product {
  name      String
  quantity  Int
  basePrice Float
}

model User {
  id             String     @id @default(auto()) @map("_id") @db.ObjectId
  name           String
  username       String     @unique
  passwordHash   String
  role           UserRole
  commissionRate Float      @default(0)
  status         UserStatus @default(active)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  campaigns Campaign[]

  @@index([username])
}

model Campaign {
  id            String       @id @default(auto()) @map("_id") @db.ObjectId
  title         String
  socialMedia   SocialMedia
  type          CampaignType
  url           String
  salesPersonId String       @db.ObjectId
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  salesPerson User    @relation(fields: [salesPersonId], references: [id])
  orders      Order[]

  @@index([salesPersonId])
}

model Order {
  id               String    @id @default(auto()) @map("_id") @db.ObjectId
  campaignId       String    @db.ObjectId
  products         Product[]
  orderTotal       Float
  snapshotRate     Float
  commissionAmount Float
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  campaign Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId])
  @@index([createdAt])
}
```

---

## Environment Variables

```bash
# .env.example

# Server
PORT=3000
NODE_ENV=development

# MongoDB Connection
DATABASE_URL="mongodb://localhost:27017/pebble_sales_hub"

# For MongoDB Atlas (cloud):
# DATABASE_URL="mongodb+srv://username:password@cluster.xxxxx.mongodb.net/pebble_sales_hub?retryWrites=true&w=majority"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:8080"
```

---

## Database Configuration

```javascript
// src/config/database.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
```

---

## Zod Validation Schemas

```javascript
// src/schemas/auth.schema.js
const { z } = require('zod');

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

module.exports = { loginSchema };
```

```javascript
// src/schemas/user.schema.js
const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'sales']),
  commissionRate: z.number().min(0).max(100).optional().default(0),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

module.exports = { createUserSchema, updateUserSchema };
```

```javascript
// src/schemas/campaign.schema.js
const { z } = require('zod');

const createCampaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  socialMedia: z.enum(['facebook', 'instagram']),
  type: z.enum(['post', 'event', 'live']),
  url: z.string().url('Must be a valid URL'),
  salesPersonId: z.string().min(1, 'Sales person is required'),
});

const updateCampaignSchema = z.object({
  title: z.string().min(3).optional(),
  socialMedia: z.enum(['facebook', 'instagram']).optional(),
  type: z.enum(['post', 'event', 'live']).optional(),
  url: z.string().url().optional(),
});

module.exports = { createCampaignSchema, updateCampaignSchema };
```

```javascript
// src/schemas/order.schema.js
const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  basePrice: z.number().nonnegative('Price cannot be negative'),
});

const createOrderSchema = z.object({
  campaignId: z.string().min(1, 'Campaign is required'),
  products: z.array(productSchema).min(1, 'At least one product is required'),
});

const updateOrderSchema = z.object({
  products: z.array(productSchema).min(1, 'At least one product is required'),
});

module.exports = { createOrderSchema, updateOrderSchema };
```

---

## Validation Middleware

```javascript
// src/middleware/validate.js
const { ZodError } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.flatten().fieldErrors,
          },
        });
      }
      next(error);
    }
  };
};

module.exports = { validate };
```

---

## Authentication Middleware

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' },
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required' },
    });
  }
  next();
};

const requireSales = (req, res, next) => {
  if (req.user?.role !== 'sales') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Sales person access required' },
    });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireSales };
```

---

## Error Handler Middleware

```javascript
// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
      },
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : err.message,
    },
  });
};

module.exports = { errorHandler };
```

---

## Auth Service

```javascript
// src/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const login = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error('Invalid username or password');
  }

  if (user.status !== 'active') {
    throw new Error('Account is inactive');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      commissionRate: user.commissionRate,
    },
  };
};

const createUser = async (data) => {
  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      passwordHash,
      role: data.role,
      commissionRate: data.commissionRate || 0,
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      commissionRate: true,
      status: true,
      createdAt: true,
    },
  });
};

module.exports = { login, createUser };
```

---

## Order Service (Commission Logic)

```javascript
// src/services/orders.service.js
const prisma = require('../config/database');

const calculateOrderTotal = (products) => {
  return products.reduce(
    (sum, p) => sum + p.quantity * p.basePrice,
    0
  );
};

const calculateCommission = (orderTotal, rate) => {
  return orderTotal * (rate / 100);
};

const createOrder = async (campaignId, products) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { salesPerson: true },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const orderTotal = calculateOrderTotal(products);
  const snapshotRate = campaign.salesPerson.commissionRate;
  const commissionAmount = calculateCommission(orderTotal, snapshotRate);

  return prisma.order.create({
    data: {
      campaignId,
      products,
      orderTotal,
      snapshotRate,
      commissionAmount,
    },
  });
};

const updateOrder = async (orderId, products) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new Error('Order not found');
  }

  const orderTotal = calculateOrderTotal(products);
  const snapshotRate = existingOrder.snapshotRate;
  const commissionAmount = calculateCommission(orderTotal, snapshotRate);

  return prisma.order.update({
    where: { id: orderId },
    data: {
      products,
      orderTotal,
      commissionAmount,
    },
  });
};

const deleteOrder = async (orderId) => {
  return prisma.order.delete({
    where: { id: orderId },
  });
};

module.exports = { createOrder, updateOrder, deleteOrder };
```

---

## Payout Service

```javascript
// src/services/payouts.service.js
const prisma = require('../config/database');

const getSalesPersonPayout = async (userId, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const campaigns = await prisma.campaign.findMany({
    where: { salesPersonId: userId },
    include: {
      orders: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
  });

  const campaignBreakdown = campaigns
    .filter(c => c.orders.length > 0)
    .map(campaign => {
      const totalSales = campaign.orders.reduce(
        (sum, o) => sum + o.orderTotal,
        0
      );
      const totalCommission = campaign.orders.reduce(
        (sum, o) => sum + o.commissionAmount,
        0
      );

      return {
        campaignId: campaign.id,
        title: campaign.title,
        orderCount: campaign.orders.length,
        totalSales: Math.round(totalSales * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
      };
    });

  const totalCommission = campaignBreakdown.reduce(
    (sum, c) => sum + c.totalCommission,
    0
  );

  return {
    year,
    month,
    totalCommission: Math.round(totalCommission * 100) / 100,
    campaigns: campaignBreakdown,
  };
};

const getTeamPayouts = async (year, month) => {
  const salesPersons = await prisma.user.findMany({
    where: { role: 'sales' },
  });

  const payouts = await Promise.all(
    salesPersons.map(async (sp) => {
      const payout = await getSalesPersonPayout(sp.id, year, month);
      return {
        userId: sp.id,
        name: sp.name,
        currentRate: sp.commissionRate,
        ...payout,
      };
    })
  );

  const grandTotalCommission = payouts.reduce(
    (sum, p) => sum + p.totalCommission,
    0
  );

  return {
    year,
    month,
    grandTotalCommission: Math.round(grandTotalCommission * 100) / 100,
    salesPersons: payouts,
  };
};

module.exports = { getSalesPersonPayout, getTeamPayouts };
```

---

## Express App Setup

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
```

```javascript
// src/index.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
```

---

## Routes

```javascript
// src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const campaignsRoutes = require('./campaigns.routes');
const ordersRoutes = require('./orders.routes');
const payoutsRoutes = require('./payouts.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/orders', ordersRoutes);
router.use('/payouts', payoutsRoutes);

module.exports = router;
```

```javascript
// src/routes/auth.routes.js
const express = require('express');
const { login } = require('../services/auth.service');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../schemas/auth.schema');

const router = express.Router();

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await login(username, password);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: error.message },
    });
  }
});

module.exports = router;
```

```javascript
// src/routes/users.routes.js
const express = require('express');
const prisma = require('../config/database');
const { createUser } = require('../services/auth.service');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../schemas/user.schema');

const router = express.Router();

router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        commissionRate: true,
        status: true,
        createdAt: true,
      },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, validate(createUserSchema), async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, requireAdmin, validate(updateUserSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.password) {
      const bcrypt = require('bcrypt');
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        commissionRate: true,
        status: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

```javascript
// src/routes/campaigns.routes.js
const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCampaignSchema, updateCampaignSchema } = require('../schemas/campaign.schema');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const where = req.user.role === 'admin' 
      ? {} 
      : { salesPersonId: req.user.userId };

    const campaigns = await prisma.campaign.findMany({
      where,
      include: { salesPerson: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, validate(createCampaignSchema), async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, requireAdmin, validate(updateCampaignSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.campaign.delete({ where: { id } });
    res.json({ success: true, data: { message: 'Campaign deleted' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

```javascript
// src/routes/orders.routes.js
const express = require('express');
const prisma = require('../config/database');
const { createOrder, updateOrder, deleteOrder } = require('../services/orders.service');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createOrderSchema, updateOrderSchema } = require('../schemas/order.schema');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { campaignId, startDate, endDate } = req.query;
    
    const where = {};
    if (campaignId) where.campaignId = campaignId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      include: { campaign: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, validate(createOrderSchema), async (req, res, next) => {
  try {
    const { campaignId, products } = req.body;
    const order = await createOrder(campaignId, products);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validate(updateOrderSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { products } = req.body;
    const order = await updateOrder(id, products);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteOrder(id);
    res.json({ success: true, data: { message: 'Order deleted' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

```javascript
// src/routes/payouts.routes.js
const express = require('express');
const { getSalesPersonPayout, getTeamPayouts } = require('../services/payouts.service');
const { authenticate, requireAdmin, requireSales } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, requireSales, async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const payout = await getSalesPersonPayout(
      req.user.userId,
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1
    );
    res.json({ success: true, data: payout });
  } catch (error) {
    next(error);
  }
});

router.get('/team', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const payouts = await getTeamPayouts(
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1
    );
    res.json({ success: true, data: payouts });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

---

## Seed Script

```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.order.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      username: 'admin',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin',
      commissionRate: 0,
    },
  });
  console.log('Created admin user');

  const salesPersons = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        username: 'sarah.j',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'sales',
        commissionRate: 12,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Mike Chen',
        username: 'mike.c',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'sales',
        commissionRate: 15,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Emily Davis',
        username: 'emily.d',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'sales',
        commissionRate: 10,
      },
    }),
  ]);
  console.log('Created sales persons');

  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        title: 'Summer Sale 2025',
        socialMedia: 'facebook',
        type: 'live',
        url: 'https://facebook.com/live/summer2025',
        salesPersonId: salesPersons[0].id,
      },
    }),
    prisma.campaign.create({
      data: {
        title: 'New Product Launch',
        socialMedia: 'instagram',
        type: 'post',
        url: 'https://instagram.com/p/newlaunch',
        salesPersonId: salesPersons[1].id,
      },
    }),
    prisma.campaign.create({
      data: {
        title: 'Flash Friday Deals',
        socialMedia: 'facebook',
        type: 'event',
        url: 'https://facebook.com/events/flashfriday',
        salesPersonId: salesPersons[0].id,
      },
    }),
  ]);
  console.log('Created campaigns');

  const sampleProducts = [
    [{ name: 'Summer Dress', quantity: 2, basePrice: 49.99 }],
    [
      { name: 'Smart Watch', quantity: 1, basePrice: 299.99 },
      { name: 'Watch Band', quantity: 2, basePrice: 30.00 },
    ],
    [{ name: 'Running Shoes', quantity: 1, basePrice: 89.99 }],
  ];

  for (let i = 0; i < campaigns.length; i++) {
    const campaign = campaigns[i];
    const salesPerson = salesPersons.find(sp => sp.id === campaign.salesPersonId);
    const products = sampleProducts[i];
    const orderTotal = products.reduce((sum, p) => sum + p.quantity * p.basePrice, 0);
    const snapshotRate = salesPerson.commissionRate;
    const commissionAmount = orderTotal * (snapshotRate / 100);

    await prisma.order.create({
      data: {
        campaignId: campaign.id,
        products,
        orderTotal,
        snapshotRate,
        commissionAmount,
      },
    });
  }
  console.log('Created sample orders');

  console.log('\nSeed completed!');
  console.log('Admin login:  admin / admin123');
  console.log('Sales logins: sarah.j, mike.c, emily.d / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Package.json

```json
{
  "name": "pebble-sales-hub-api",
  "version": "1.0.0",
  "description": "Backend API for Pebble Sales Hub",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "node prisma/seed.js",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.x",
    "bcrypt": "^5.x",
    "cors": "^2.x",
    "dotenv": "^16.x",
    "express": "^4.x",
    "jsonwebtoken": "^9.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "nodemon": "^3.x",
    "prisma": "^5.x"
  }
}
```

---

## Getting Started

```bash
# 1. Create project folder
mkdir backend && cd backend

# 2. Initialize npm
npm init -y

# 3. Install dependencies
npm install express cors dotenv jsonwebtoken bcrypt zod @prisma/client

# 4. Install dev dependencies
npm install -D nodemon prisma

# 5. Initialize Prisma with MongoDB
npx prisma init --datasource-provider mongodb

# 6. Set up your .env file with MongoDB connection string
# DATABASE_URL="mongodb://localhost:27017/pebble_sales_hub"

# 7. Push schema to MongoDB
npx prisma db push

# 8. Generate Prisma client
npx prisma generate

# 9. Seed the database
npm run db:seed

# 10. Start development server
npm run dev
```

---

## MongoDB Setup Options

### Local MongoDB
```bash
# Install MongoDB Community Edition
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community

# Start MongoDB
mongod

# Connection string:
DATABASE_URL="mongodb://localhost:27017/pebble_sales_hub"
```

### MongoDB Atlas (Free Cloud)
1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist your IP
5. Get connection string:
```bash
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pebble_sales_hub?retryWrites=true&w=majority"
```

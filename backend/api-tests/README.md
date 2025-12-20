# API Test Collection

## Postman/Thunder Client

Import the `pebble-sales-hub.postman_collection.json` file into Postman or Thunder Client.

## Setup

1. **Set Base URL**: The collection uses `{{baseUrl}}` variable, defaulting to `http://localhost:3000/api`

2. **Get Token**: 
   - Run "Login (Admin)" or "Login (Sales)" request
   - Copy the `token` from the response
   - Set the `{{token}}` variable in your environment

## Test Credentials

| User | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Sales | sarah.j | password123 |
| Sales | mike.c | password123 |
| Sales | emily.w | password123 |

## Endpoints Overview

### Auth
- `POST /auth/login` - Login and get JWT token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Users (Admin Only)
- `GET /users` - List all users
- `GET /users/:id` - Get single user
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Campaigns
- `GET /campaigns` - List campaigns
- `GET /campaigns/:id` - Get campaign with stats
- `POST /campaigns` - Create campaign (Admin)
- `PUT /campaigns/:id` - Update campaign (Admin)
- `DELETE /campaigns/:id` - Delete campaign (Admin)

### Orders
- `GET /orders` - List orders (with optional filters)
- `GET /orders/:id` - Get single order
- `POST /orders` - Create order (captures snapshot rate)
- `PUT /orders/:id` - Update order (uses original rate)
- `DELETE /orders/:id` - Delete order

### Payouts
- `GET /payouts/me?year=&month=` - Sales person's payout
- `GET /payouts/team?year=&month=` - Team payouts (Admin)

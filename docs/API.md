# API Documentation

The Pebble Sales Hub API is built using Node.js, Express, and TypeScript. It uses JWT (JSON Web Tokens) for authentication and Prisma ORM for interacting with the MongoDB database.

## Authentication

All protected endpoints require an `Authorization` header with a valid JWT token.

**Header Format:**
```http
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### Login
Generate a JWT token for authentication.

*   **URL**: `/api/auth/login`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "username": "sarah.j",
      "password": "password123"
    }
    ```
*   **Success Response**: `200 OK` with user details and token.

### Logout
Invalidate the current session.

*   **URL**: `/api/auth/logout`
*   **Method**: `POST`
*   **Success Response**: `200 OK`.

### Get Current User
Retrieve details of the currently authenticated user.

*   **URL**: `/api/auth/me`
*   **Method**: `GET`
*   **Success Response**: `200 OK` with user data.

---

## User Endpoints (Admin Only)

### List All Users
Retrieve a list of all users in the system.

*   **URL**: `/api/users`
*   **Method**: `GET`
*   **Success Response**: `200 OK` with an array of user objects.

### Create User
Register a new user (Admin or Sales role).

*   **URL**: `/api/users`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "name": "Jane Smith",
      "username": "jane.s",
      "password": "securepassword",
      "role": "sales",
      "commissionRate": 15
    }
    ```
*   **Success Response**: `201 Created`.

### Update User
Modify an existing user's details.

*   **URL**: `/api/users/:id`
*   **Method**: `PUT`
*   **Body**: Partial user object (all fields except `username` are updateable).
*   **Success Response**: `200 OK`.

### Delete User
Remove a user from the system. Note: Last admin protection is enforced.

*   **URL**: `/api/users/:id`
*   **Method**: `DELETE`
*   **Success Response**: `200 OK`.

---

## Campaign Endpoints

### List Campaigns
Retrieve campaigns. Admins see all; Sales see only their assigned campaigns.

*   **URL**: `/api/campaigns`
*   **Method**: `GET`
*   **Success Response**: `200 OK` with an array of campaign objects.

### Create Campaign (Admin Only)
*   **URL**: `/api/campaigns`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "title": "Summer Sale",
      "platform": "facebook",
      "type": "live",
      "url": "https://fb.com/...",
      "salesPersonId": "user_id_here"
    }
    ```
*   **Success Response**: `201 Created`.

---

## Order Endpoints

### Register Order
Register a new sale. Commission rate is snapshotted during this request.

*   **URL**: `/api/orders`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "campaignId": "campaign_id_here",
      "products": [
        { "name": "Watch", "price": 150, "quantity": 1 }
      ],
      "orderDate": "2025-12-21T08:00:00.000Z"
    }
    ```
*   **Success Response**: `201 Created`.

### List Orders
Retrieve orders based on role and filters.

*   **URL**: `/api/orders`
*   **Method**: `GET`
*   **Parameters**: `campaignId`, `year`, `month` (optional).
*   **Success Response**: `200 OK`.

---

## Payout Endpoints

### Get My Payouts
Retrieve own commission details (for Sales).

*   **URL**: `/api/payouts/me`
*   **Method**: `GET`
*   **Parameters**: `year`, `month`.
*   **Success Response**: `200 OK`.

### Get Team Payouts (Admin Only)
Retrieve commission details for all sales staff.

*   **URL**: `/api/payouts/team`
*   **Method**: `GET`
*   **Parameters**: `year`, `month`.
*   **Success Response**: `200 OK`.

---

## Analytics Endpoints

### Get Leaderboard
Retrieve sales performance rankings.

*   **URL**: `/api/analytics/leaderboard`
*   **Method**: `GET`
*   **Success Response**: `200 OK`.

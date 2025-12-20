# Phase 1 - Backend API Foundation

## Feature Description
Build the core REST API backend for Pebble Sales Hub - a sales commission tracking system. This includes:

- **Project Setup**: Initialize Node.js + Express + Prisma with MongoDB
- **Authentication**: JWT-based login with role-based access (Admin/Sales Person)
- **User Management**: CRUD endpoints for managing sales team members
- **Campaign Management**: CRUD endpoints for social media campaigns
- **Order Management**: CRUD endpoints with commission snapshot logic
- **Payout Endpoints**: Commission calculations by month/campaign
- **Seed Data**: Test data matching frontend mock data structure

## Source Reference
- Roadmap: `agent-os/product/roadmap.md` (Phase 1)
- Base Requirements: `requirements/01-base-requirements.md`
- Tech Stack: `agent-os/product/tech-stack.md`

## Key Business Logic
- Commission rates are "snapshotted" at order creation time
- Sales person assignment on campaigns is immutable
- Campaign assignment on orders is immutable
- Order updates recalculate commission using original snapshot rate

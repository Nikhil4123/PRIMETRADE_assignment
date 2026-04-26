# Scalable REST API with Auth, RBAC, CRUD + React Frontend

## 1. Project Overview
This repository contains a production-ready full-stack task management platform:
- Backend: Express.js + Sequelize + PostgreSQL
- Auth: JWT access token + bcrypt password hashing
- Authorization: Role-based access control (user/admin)
- Frontend: React (Vite) + Axios with auth interceptors
- API docs: Swagger UI at `/api/docs`
- Security hardening: Helmet, rate limiting, input sanitization

## 2. Tech Stack
- Backend: Node.js, Express.js, Sequelize ORM
- Database: PostgreSQL
- Auth: jsonwebtoken, bcryptjs
- Validation: express-validator
- Security: helmet, express-rate-limit, express-mongo-sanitize
- Logging: Winston
- Docs: swagger-jsdoc, swagger-ui-express
- Frontend: React, Vite, Axios, React Router

## 3. Local Setup Steps
### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL running locally

### Clone and install
```bash
git clone <your-repo-url>
cd Primetrade

cd backend
npm install

cd ../frontend
npm install
```

### Environment setup
```bash
cd backend
cp .env.example .env
# Update DB and JWT values in .env

cd ../frontend
cp .env.example .env
```

### Database migrate/sync
```bash
cd backend
npm run db:sync
```

### Run backend and frontend
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

### Useful URLs
- API base: `http://localhost:5000/api/v1`
- Swagger docs: `http://localhost:5000/api/docs`
- Frontend: `http://localhost:5173`

## 4. API Endpoints
| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | /health | No | Public | Health check endpoint |
| POST | /api/v1/auth/register | No | Public | Register user, hash password, return JWT |
| POST | /api/v1/auth/login | No | Public | Login user, verify password, return JWT |
| GET | /api/v1/auth/me | Yes | User/Admin | Get current user profile |
| GET | /api/v1/tasks | Yes | User/Admin | User gets own tasks, admin gets all tasks |
| GET | /api/v1/tasks/:id | Yes | User/Admin | Get a single task (ownership enforced for user) |
| POST | /api/v1/tasks | Yes | User/Admin | Create task for authenticated user |
| PUT | /api/v1/tasks/:id | Yes | User/Admin | Update task (ownership enforced for user) |
| DELETE | /api/v1/tasks/:id | Yes | User/Admin | Delete task (ownership enforced for user) |
| GET | /api/v1/admin/users | Yes | Admin | List all users without passwords |
| DELETE | /api/v1/admin/users/:id | Yes | Admin | Delete a user and related tasks |
| GET | /api/docs | No | Public | Swagger API documentation |

## 5. Error Handling Standard
### Error shape
```json
{
  "success": false,
  "message": "Human readable message",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

### Success shape
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {}
}
```

### Status codes used
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

## 6. Scalability Note
### Microservices split strategy
- Start by extracting `auth-service` and `task-service` from the current monolith.
- Keep an API gateway layer for unified auth verification, rate limiting, and request routing.
- Move shared contracts (DTOs/schemas) into a shared package to keep compatibility between services.

### Redis caching strategy for GET /tasks
- Cache task list responses by role and user scope keys:
  - `tasks:user:<userId>`
  - `tasks:admin:all`
- Set short TTLs (for example 30 to 90 seconds) for freshness.
- Invalidate relevant keys after POST/PUT/DELETE task operations.
- Use stale-while-revalidate pattern for high-traffic read paths.

### Horizontal scaling with load balancer
- Run multiple backend replicas behind Nginx or AWS ALB.
- Keep app stateless (JWT already supports stateless sessions).
- Store logs centrally and use health checks on `/health`.
- Apply per-instance rate limits plus edge/API-gateway throttling.

### Docker and Docker Compose approach
- Containerize backend, frontend, and PostgreSQL as separate services.
- Example compose services: `api`, `web`, `db`, optional `redis`.
- Inject environment variables through Compose secrets/env files.
- Use named volumes for PostgreSQL persistence and shared network for service discovery.

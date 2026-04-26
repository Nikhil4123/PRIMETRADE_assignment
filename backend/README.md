# Backend Quick Guide

This backend is part of the full-stack project in the repository root.

## Run locally
```bash
npm install
cp .env.example .env
npm run db:sync
npm run dev
```

## Redis for load-balanced instances
When running multiple backend replicas, enable Redis so all instances share the same rate-limit counters.

1. Start Redis (for example, via Docker Compose in the repository root).
2. In `backend/.env` set:

```bash
REDIS_ENABLED=true
REDIS_URL=redis://127.0.0.1:6379
```

If the backend also runs in Docker Compose, use `redis://redis:6379` as the host.

## Important URLs
- API base: `http://localhost:5000/api/v1`
- Swagger docs: `http://localhost:5000/api/docs`

## Short scalability note
- Current state: this backend is a single Express service (monolith) and does not include a built-in load balancer.
- Load balancing: run multiple API instances behind Nginx or AWS ALB and route health checks to `/health`.
- Caching: add Redis for hot reads such as task listings and invalidate keys on create/update/delete.
- Microservices path: split auth and tasks into separate services only after traffic and team size justify added complexity.
- Production basics: keep JWT stateless auth, centralize logs/metrics, and apply edge/API-gateway rate limiting.

See the root `README.md` for complete project documentation and endpoint table.

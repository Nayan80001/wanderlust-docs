# Local development

The application can be tried locally with Docker Compose. This is a convenient way to change the
website without first deploying to AWS.

## Before starting

Install Docker Desktop and make sure its Linux/WSL 2 engine is running. The local Compose files
are in `wanderlust-gitops/local-dev`; the frontend and backend source folders are next to the
GitOps repository.

## Configure and start

In PowerShell:

```powershell
cd <workspace>\wanderlust-gitops\local-dev
Copy-Item .env.compose.example .env.compose
```

Open `.env.compose` and replace example credentials with new random local-only values. This file
is ignored by Git. Never reuse production passwords or commit the file.

Check the Compose configuration, build the containers, and start them:

```powershell
docker compose --env-file .env.compose config --quiet
docker compose --env-file .env.compose up --build -d
docker compose --env-file .env.compose ps
```

The frontend is normally available at `http://localhost:5173`, and the backend health endpoint is
normally `http://localhost:8080/api/health`. If a port is already in use, use the matching
`BACKEND_HOST_PORT` or `FRONTEND_HOST_PORT` setting in the local environment file. If you change
the backend port, update the frontend API path and rebuild.

## Seed optional sample posts

```powershell
docker compose --env-file .env.compose run --rm backend node data/seed.js
```

## Stop the application

```powershell
docker compose --env-file .env.compose down
```

`docker compose down -v` also deletes the local database volume and its sample data. Use it only
when you really want to remove that data.

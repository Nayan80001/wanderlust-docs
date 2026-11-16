# Local development

Docker Compose starts the frontend, backend, MongoDB, and Redis on one computer. You can try
application changes locally without first deploying them to AWS.

## What you need

| Tool | Needed for |
|---|---|
| Docker Desktop current stable release with its Linux/WSL 2 engine | Building and running the local containers; the project does not pin a Desktop patch version |
| Docker Compose v2 plugin (`docker compose`) | Starting the local stack |
| Git | Getting the project repositories; the project does not pin a minimum version |
| Node.js 20.x | Optional: running frontend or backend commands directly on the host |
| AWS CLI v2 and Session Manager plugin | Optional: accessing private AWS services, not needed for local Compose; patch versions are not pinned |
| Terraform `>= 1.10` | Optional: changing AWS infrastructure, not needed for local Compose |

The Compose files are in `wanderlust-gitops/local-dev`. The application source repositories should
be alongside the GitOps repository in your workspace.

## Environment variables

The Compose example file is the easiest way to start the full local stack. Copy it and replace the
example-only secrets with new, local values:

| Variable | Example default | Purpose |
|---|---|---|
| `MONGO_ROOT_USER` | `root` | Local MongoDB administrator name |
| `MONGO_ROOT_PASSWORD` | `change-me-local-only` | Local MongoDB administrator password; replace it |
| `JWT_SECRET` | `change-me-local-only-long-random` | Local token-signing secret; replace with a long random value |
| `FRONTEND_URL` | `http://localhost:5173` | Browser-visible frontend origin used by the backend |
| `VITE_API_PATH` | `http://localhost:8080` | Backend address compiled into the frontend bundle |
| `BACKEND_HOST_PORT` | `8080` | Host port mapped to the backend container |
| `FRONTEND_HOST_PORT` | `5173` | Host port mapped to the frontend container |

The backend's `.env.example` is for running the API outside Compose:

| Variable | Example default | Purpose |
|---|---|---|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/wanderlust` | MongoDB connection string |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection string |
| `PORT` | `8080` | Port on which the API listens |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed frontend origin |
| `ACCESS_COOKIE_MAXAGE` | `120000` | Access-cookie lifetime in milliseconds |
| `ACCESS_TOKEN_EXPIRES_IN` | `120s` | Access-token lifetime |
| `REFRESH_COOKIE_MAXAGE` | `120000` | Refresh-cookie lifetime in milliseconds |
| `REFRESH_TOKEN_EXPIRES_IN` | `120s` | Refresh-token lifetime |
| `JWT_SECRET` | `change-me-to-a-long-random-string` | Token-signing secret; replace it |
| `NODE_ENV` | `development` | Application runtime mode |

The frontend's `.env.example` has one variable:

| Variable | Example default | Purpose |
|---|---|---|
| `VITE_API_PATH` | `http://localhost:8080` | API base URL; Vite bakes it into the frontend at build time |

The values above are examples, not production credentials. Do not reuse production secrets or
commit populated `.env` files.

## Start the local stack

In PowerShell, from the project workspace:

```powershell
cd .\wanderlust-gitops\local-dev
Copy-Item .env.compose.example .env.compose
```

Edit `.env.compose`. Change the MongoDB password and JWT secret before starting. The file is
intended to stay local and out of Git.

Check the Compose configuration, build the containers, and start them:

```powershell
docker compose --env-file .env.compose config --quiet
docker compose --env-file .env.compose up --build -d
docker compose --env-file .env.compose ps
```

Open the frontend at `http://localhost:5173`. Check the backend health endpoint at
`http://localhost:8080/api/health`. If one of those host ports is already in use, change
`BACKEND_HOST_PORT` or `FRONTEND_HOST_PORT` in `.env.compose`. If you change the backend port,
also update `VITE_API_PATH` and rebuild the frontend because that value is baked in at build time.

To load the optional sample posts:

```powershell
docker compose --env-file .env.compose run --rm backend node data/seed.js
```

## Stop the application

```powershell
docker compose --env-file .env.compose down
```

`docker compose down -v` also deletes the local database volume and its sample data. Use it only
when you really want to remove that data.

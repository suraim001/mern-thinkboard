<div align="center">

# 🧠 ThinkBoard

**A full-stack, multi-user note-taking platform built on the MERN stack, packaged for Docker and Kubernetes.**

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3%20%2B%20daisyUI-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-kind-326CE5?logo=kubernetes&logoColor=white)](https://kind.sigs.k8s.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](#-license)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Configuration](#-configuration)
- [Getting Started (Local Development)](#-getting-started-local-development)
- [Deployment](#-deployment)
  - [Option A — Single Node Process](#option-a--single-node-process)
  - [Option B — Docker Compose](#option-b--docker-compose)
  - [Option C — Kubernetes (kind)](#option-c--kubernetes-kind)
- [API Reference](#-api-reference)
- [Data Model](#-data-model)
- [Authentication Flow](#-authentication-flow)
- [Security](#-security)
- [Operations & Troubleshooting](#-operations--troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 📖 Overview

ThinkBoard is a note-taking web application where each user has a private workspace of notes. It supports
email/password and **Google OAuth 2.0** sign-in, issues stateless **JWT** sessions, enforces per-owner data
isolation at the query level, and applies **distributed rate limiting** via Upstash Redis.

The repository is an npm **workspaces monorepo** containing the API (`backend/`), the SPA (`frontend/`), and
production-ready infrastructure for three deployment targets: a single Node process, Docker Compose, and a
multi-node Kubernetes cluster with NGINX Ingress.

---

## ✨ Features

### Product

| Area | Capability |
|------|------------|
| **Notes** | Create, read, update and delete notes; listed newest-first |
| **Accounts** | Sign up / log in with email + password, or continue with Google |
| **Account linking** | Google sign-in links automatically to an existing account with the same email |
| **Profile** | View profile and note count, rename username, change password, or *set* a password on a Google-only account |
| **Account deletion** | Deletes the user and cascades to all of their notes |
| **UX** | Protected routes, toast notifications, rate-limit screen, dark UI with Tailwind + daisyUI |

### Platform

- 🔐 **Stateless auth** — signed JWTs (7-day expiry) sent as `Authorization: Bearer <token>`
- 🧱 **Tenant isolation** — every note query is scoped by `user: req.user._id`
- 🚦 **Rate limiting** — sliding window, 100 requests / 60 s, backed by Upstash Redis
- 🐳 **Containerized** — lean `node:22-alpine` API image running as non-root; multi-stage NGINX image for the SPA
- ☸️ **Kubernetes-ready** — namespace, ConfigMap/Secret, readiness probes, resource requests/limits, init-container dependency gating, persistent storage, and Ingress
- 🩺 **Health endpoint** — `GET /api/status` for probes and uptime checks

---

## 🏗 Architecture

```mermaid
flowchart LR
    U[Browser<br/>React SPA] -->|HTTPS| I[NGINX Ingress / NGINX<br/>reverse proxy]
    I -->|/ static assets| F[Frontend<br/>NGINX + Vite build]
    I -->|/api/*| B[Backend<br/>Express API]
    F -. /api proxy .-> B
    B -->|Mongoose| M[(MongoDB)]
    B -->|REST| R[(Upstash Redis<br/>rate limiter)]
    B <-->|OAuth 2.0| G[Google Identity]
```

**Request path in production**

1. The browser loads the SPA from NGINX. All API calls use the relative path `/api`.
2. `/api/*` is routed to the Express backend — by the Kubernetes Ingress, or by the frontend container's NGINX
   (`proxy_pass ${BACKEND_URL}`) under Docker Compose.
3. The backend applies global middleware (JSON parsing → Passport → rate limiter), then route-level JWT
   authentication, then the controller.
4. Controllers talk to MongoDB through Mongoose models.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Vite 8, Tailwind CSS 3, daisyUI 4, Axios, lucide-react, react-hot-toast |
| **Backend** | Node.js 22, Express 4, Mongoose 9, Passport (Google OAuth 2.0), jsonwebtoken, bcryptjs, CORS, dotenv |
| **Data** | MongoDB (Atlas or self-hosted 7.x / 8.2) |
| **Rate limiting** | `@upstash/ratelimit` + `@upstash/redis` |
| **Serving** | NGINX 1.27 (SPA + reverse proxy) |
| **Containers** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (kind v1.36), ingress-nginx, Kustomize |
| **Tooling** | npm workspaces, nodemon, ESLint 10 |

---

## 📁 Project Structure

```text
mern-thinkboard/
├── backend/                     # Express REST API
│   ├── src/
│   │   ├── config/              # db.js (Mongo), passport.js (Google OAuth), upstash.js (rate limiter)
│   │   ├── controllers/         # auth, note, user business logic
│   │   ├── middlewear/          # isAuthenticated (JWT), rateLimiter
│   │   ├── models/              # Mongoose schemas: User, Note
│   │   ├── routes/              # /api/auth, /api/users, /api/notes
│   │   ├── utils/               # JWT signing + public user serializer
│   │   └── server.js            # App bootstrap
│   ├── .env.example
│   └── Dockerfile
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/          # Navbar, NoteCard, ProtectedRoute, GoogleButton, ...
│   │   ├── context/             # AuthContext (session state)
│   │   ├── lib/                 # axios instance (JWT + 401 interceptors), utils
│   │   └── pages/               # Home, Create, NoteDetail, Login, Signup, Profile, AuthSuccess
│   ├── nginx.conf.template      # SPA fallback + /api reverse proxy
│   └── Dockerfile               # Multi-stage: Vite build → NGINX
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yml
│   ├── configmap.yml / secret.yml.example
│   ├── mongo-{pv,pvc,deployment,service}.yml
│   ├── backend-{deployment,service}.yml
│   ├── frontend-{deployment,service}.yml
│   ├── ingress.yml
│   └── kustomization.yml        # Installs + patches ingress-nginx for kind
├── docker-compose.yml           # Frontend + backend
├── docker-compose.mongo.yml     # Optional override: local MongoDB container
├── kind-config.yml              # 1 control-plane + 3 worker kind cluster
└── package.json                 # npm workspaces root
```

---

## ✅ Prerequisites

| Tool | Version | Needed for |
|------|---------|-----------|
| Node.js | ≥ 22 | Local development |
| npm | ≥ 10 | Workspaces |
| MongoDB | Atlas cluster or local 7.x / 8.2 | All modes |
| Upstash Redis | Free tier is sufficient | All modes (rate limiter) |
| Google Cloud OAuth client | Web application type | Google sign-in |
| Docker + Docker Compose v2 | Latest | Option B |
| kind, kubectl | kind ≥ 0.27, kubectl ≥ 1.30 | Option C |

---

## ⚙️ Configuration

All backend configuration is provided through environment variables. Copy the template and fill it in:

```bash
cp backend/.env.example backend/.env
```

| Variable | Required | Description | Example |
|----------|:--------:|-------------|---------|
| `MONGO_URI` | ✅ | MongoDB connection string | `mongodb+srv://user:pass@cluster/thinkboard` |
| `PORT` | — | API port (default `5001`) | `5001` |
| `SECRET_KEY` | ✅ | HMAC secret used to sign JWTs | `openssl rand -hex 48` |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash REST endpoint | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash REST token | — |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret | — |
| `CLIENT_URL` | dev only | Frontend origin for OAuth redirects in development | `http://localhost:5173` |
| `NODE_ENV` | — | `production` enables static serving, disables dev CORS, uses relative redirects | `production` |

**Frontend container**

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_URL` | `http://backend:5001` | Upstream that NGINX proxies `/api/` to (substituted at container start) |

### Google OAuth setup

In **Google Cloud Console → APIs & Services → Credentials**, create an OAuth 2.0 Client ID (Web application) and
register an **Authorized redirect URI** for each environment you run:

| Environment | Redirect URI |
|-------------|--------------|
| Local dev | `http://localhost:5001/api/auth/google/callback` |
| Docker Compose | `http://localhost:8080/api/auth/google/callback` |
| Kubernetes (kind) | `http://thinkboard.com/api/auth/google/callback` |
| Your production domain | `https://<your-domain>/api/auth/google/callback` |

> The Passport strategy uses a relative callback with `proxy: true`, so the scheme and host are derived from the
> incoming request and `X-Forwarded-*` headers.

---

## 🚀 Getting Started (Local Development)

```bash
# 1. Clone
git clone https://github.com/suraim001/mern-thinkboard.git
cd mern-thinkboard

# 2. Install dependencies for both workspaces
npm install

# 3. Configure the backend
cp backend/.env.example backend/.env   # then edit values

# 4. Run the API (http://localhost:5001) with hot reload
npm run dev --workspace=backend

# 5. In a second terminal, run the SPA (http://localhost:5173)
npm run dev --workspace=frontend
```

In development the SPA calls `http://localhost:5001/api` directly and the backend allows CORS from
`http://localhost:5173`.

### Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev --workspace=backend` | Start API with nodemon |
| `npm run dev --workspace=frontend` | Start Vite dev server |
| `npm run lint --workspace=frontend` | Lint the frontend |
| `npm run build` | Install all deps and produce `frontend/dist` |
| `npm start` | Start the API (serves `frontend/dist` when `NODE_ENV=production`) |

---

## 📦 Deployment

### Option A — Single Node Process

Suitable for PaaS hosts such as Render or Railway. Express serves both the API and the built SPA.

```bash
npm run build
NODE_ENV=production npm start
```

Set all [environment variables](#️-configuration) in the host's dashboard. The app is served on `$PORT`.

### Option B — Docker Compose

Runs the frontend (NGINX) and backend as separate containers on a private bridge network.

```bash
# Uses MONGO_URI from backend/.env (e.g. MongoDB Atlas)
docker compose up -d --build

# — or — also run MongoDB locally in a container (data persisted in the mongo-data volume)
docker compose -f docker-compose.yml -f docker-compose.mongo.yml up -d --build
```

Open **http://localhost:8080** (override with `FRONTEND_PORT=xxxx`).

```bash
docker compose logs -f backend      # tail API logs
docker compose down                 # stop
docker compose -f docker-compose.yml -f docker-compose.mongo.yml down -v   # stop and wipe Mongo data
```

### Option C — Kubernetes (kind)

Provisions a 4-node local cluster with NGINX Ingress, an in-cluster MongoDB on a persistent volume, and the
ThinkBoard frontend and backend.

```mermaid
flowchart LR
    H[Host :80] --> IC[ingress-nginx<br/>control-plane node]
    IC -->|/api| BS[thinkboard-backend-service:5001]
    IC -->|/| FS[thinkboard-frontend-service:80]
    BS --> BP[backend pod]
    FS --> FP[frontend pod]
    BP --> MS[thinkboard-mongo-service:27017]
    MS --> MP[mongo pod] --> PV[(mongo-pv<br/>hostPath 2Gi)]
```

**1. Build and push images** (or replace `suraim001/` with your own registry in the deployment manifests)

```bash
docker build -t suraim001/thinkboard-backend:latest  ./backend
docker build -t suraim001/thinkboard-frontend:latest ./frontend
docker push suraim001/thinkboard-backend:latest
docker push suraim001/thinkboard-frontend:latest
```

**2. Create the cluster and install the ingress controller**

```bash
kind create cluster --config kind-config.yml
kubectl apply -k k8s/
kubectl wait -n ingress-nginx --for=condition=ready pod \
  -l app.kubernetes.io/component=controller --timeout=180s
```

**3. Create secrets**

```bash
cp k8s/secret.yml.example k8s/secret.yml
# edit k8s/secret.yml — for the in-cluster database use:
#   MONGO_URI: mongodb://thinkboard-mongo-service:27017/thinkboard
```

> `k8s/secret.yml` is git-ignored. **Never commit it.**

**4. Deploy the application**

```bash
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/configmap.yml -f k8s/secret.yml
kubectl apply -f k8s/mongo-pv.yml -f k8s/mongo-pvc.yml -f k8s/mongo-deployment.yml -f k8s/mongo-service.yml
kubectl apply -f k8s/backend-deployment.yml -f k8s/backend-service.yml
kubectl apply -f k8s/frontend-deployment.yml -f k8s/frontend-service.yml
kubectl apply -f k8s/ingress.yml
```

> Apply files individually as shown. `kubectl apply -f k8s/` would also pick up the ingress-controller patch files.

**5. Point the hostname at the cluster and open the app**

```bash
echo "127.0.0.1 thinkboard.com" | sudo tee -a /etc/hosts
kubectl get pods -n thinkboard -w
```

Open **http://thinkboard.com**.

**Teardown**

```bash
kind delete cluster --name thinkboard-cluster
```

#### Kubernetes resource summary

| Resource | Image | Requests | Limits | Probe |
|----------|-------|----------|--------|-------|
| Backend | `suraim001/thinkboard-backend` | 100m / 128Mi | 512Mi | HTTP `GET /api/status` |
| Frontend | `suraim001/thinkboard-frontend` | 50m / 32Mi | 128Mi | HTTP `GET /` |
| MongoDB | `mongo:7` | 100m / 256Mi | 1Gi | `mongosh ping` |

The backend pod uses a `busybox` init container that blocks until MongoDB accepts connections, and MongoDB uses
the `Recreate` strategy so two `mongod` processes never share the volume.

---

## 📡 API Reference

Base URL: `/api` · Content type: `application/json` · Protected routes require `Authorization: Bearer <JWT>`.

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/status` | — | Liveness check, returns `Server is Live` |

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
|--------|----------|:----:|------|-------------|
| `POST` | `/register` | — | `{ username, email, password }` | Create account, returns `{ token, user }` |
| `POST` | `/login` | — | `{ email, password }` | Log in, returns `{ token, user }` |
| `GET` | `/google` | — | — | Start Google OAuth flow |
| `GET` | `/google/callback` | — | — | OAuth callback; redirects to `/auth-success?token=…` |
| `GET` | `/me` | 🔒 | — | Current user |
| `POST` | `/logout` | 🔒 | — | Mark user logged out (client discards token) |

### Users — `/api/users`

| Method | Endpoint | Auth | Body | Description |
|--------|----------|:----:|------|-------------|
| `GET` | `/profile` | 🔒 | — | Profile + `notesCount` |
| `PUT` | `/profile` | 🔒 | `{ username }` | Update username |
| `PUT` | `/password` | 🔒 | `{ currentPassword?, newPassword }` | Change password (`currentPassword` not required if none set) |
| `DELETE` | `/profile` | 🔒 | — | Delete account and all notes |

### Notes — `/api/notes`

| Method | Endpoint | Auth | Body | Description |
|--------|----------|:----:|------|-------------|
| `GET` | `/` | 🔒 | — | List the caller's notes, newest first |
| `GET` | `/:id` | 🔒 | — | Get one note |
| `POST` | `/` | 🔒 | `{ title, content }` | Create note |
| `PUT` | `/:id` | 🔒 | `{ title, content }` | Update note |
| `DELETE` | `/:id` | 🔒 | — | Delete note |

### Example

```bash
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"jane@example.com","password":"secret123"}' | jq -r .token)

curl -X POST http://localhost:5001/api/notes \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"First note","content":"Hello ThinkBoard"}'
```

### Status codes

| Code | Meaning |
|------|---------|
| `200` / `201` | Success / created |
| `400` | Validation error (missing fields, short password, wrong current password) |
| `401` | Missing, invalid or expired token — the SPA clears the session and redirects to `/login` |
| `404` | Note not found or not owned by caller |
| `409` | Email already registered |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## 🗄 Data Model

```mermaid
erDiagram
    USER ||--o{ NOTE : owns
    USER {
        ObjectId _id
        string username
        string email "unique, lowercase"
        string password "bcrypt hash, select:false"
        string googleId
        string avatar
        boolean isVerified
        boolean isLoggedIn
        date createdAt
        date updatedAt
    }
    NOTE {
        ObjectId _id
        string title "required"
        string content "required"
        ObjectId user "ref User, indexed"
        date createdAt
        date updatedAt
    }
```

---

## 🔑 Authentication Flow

**Email / password**

```text
SPA ──POST /auth/login──▶ API ── bcrypt.compare ──▶ sign JWT (7d) ──▶ { token, user }
SPA stores token in localStorage; axios attaches it to every request.
```

**Google OAuth 2.0**

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as API
    participant G as Google
    B->>A: GET /api/auth/google
    A->>G: Redirect (scope: profile, email)
    G->>B: Consent screen
    B->>A: GET /api/auth/google/callback?code=…
    A->>G: Exchange code for profile
    A->>A: Find by googleId → email, or create user
    A->>B: 302 /auth-success?token=<JWT>
    B->>A: GET /api/auth/me (Bearer JWT)
    A->>B: { user }
```

When Google sign-in links to an existing **unverified** email/password account, that account's password is
removed so a party who registered someone else's email cannot retain access.

---

## 🛡 Security

| Control | Implementation |
|---------|----------------|
| Password storage | bcrypt, cost factor 10; `password` field is `select: false` |
| Session tokens | HS256 JWT signed with `SECRET_KEY`, 7-day expiry |
| Authorization | Ownership enforced in every note query (`{ _id, user }`) |
| Output filtering | `toPublicUser()` whitelists fields sent to the client |
| Rate limiting | Upstash sliding window, 100 req / 60 s |
| CORS | Enabled only for `http://localhost:5173` in non-production |
| Containers | Backend runs as unprivileged `node` user, production deps only |
| Secrets | `.env` and `k8s/secret.yml` are git-ignored; templates provided |

**Hardening recommendations for production**

- Serve exclusively over HTTPS (TLS at the Ingress / load balancer).
- Use a long, random `SECRET_KEY` and rotate it periodically.
- Key the rate limiter per client (IP or user ID) — it currently uses a single shared bucket for all traffic.
- Add `helmet` for security headers and request body size limits.
- Avoid returning raw `error.message` in 500 responses.
- Run MongoDB with authentication enabled, or use a managed service.

### Reporting a vulnerability

Please **do not** open a public issue. Email the maintainer privately (see [Author](#-author)) with steps to
reproduce, and allow reasonable time for a fix before disclosure.

---

## 🧯 Operations & Troubleshooting

| Symptom | Likely cause / fix |
|---------|-------------------|
| Backend exits with `Failed to connect MONGODB!` | Check `MONGO_URI`, network access / IP allow-list on Atlas |
| `mongo` container won't start on Linux | MongoDB 8.0 / latest fail on kernels 6.19–7.0.13 ([SERVER-121912](https://jira.mongodb.org/browse/SERVER-121912)); this repo pins `mongo:8.2` (Compose) and `mongo:7` (k8s) |
| Every request returns `429` | Global rate-limit bucket exhausted; wait 60 s or raise the limit in `backend/src/config/upstash.js` |
| Google login → `redirect_uri_mismatch` | Register the exact callback URL for this environment in Google Cloud Console |
| Google login redirects to wrong host in dev | Set `CLIENT_URL` in `backend/.env` |
| `/api` returns 502 from the frontend container | `BACKEND_URL` doesn't resolve, or backend container isn't running |
| Backend pod stuck in `Init:0/1` | MongoDB pod not ready — `kubectl describe pod -n thinkboard -l app=mongo` |
| `thinkboard.com` not reachable | Missing `/etc/hosts` entry, or ingress-nginx controller not ready |

Common diagnostics:

```bash
kubectl get all -n thinkboard
kubectl logs -n thinkboard deploy/thinkboard-backend-deployment
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
curl -i http://thinkboard.com/api/status
```

---

## 🗺 Roadmap

- [ ] Automated tests (Jest / Supertest for API, Vitest + Testing Library for SPA)
- [ ] CI/CD pipeline (lint, test, build and push images)
- [ ] Per-user / per-IP rate limiting
- [ ] Email verification and password reset (OTP fields already exist on the `User` schema)
- [ ] Note search, tags and pagination
- [ ] Helm chart and TLS via cert-manager
- [ ] MongoDB as a StatefulSet with replica set
- [ ] Liveness probes and Horizontal Pod Autoscaler for the backend

---

## 🤝 Contributing

1. Fork the repository and create a branch: `git checkout -b feat/short-description`
2. Follow the existing code style and run `npm run lint --workspace=frontend`
3. Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:` …)
4. Open a pull request describing the change, its motivation, and how it was tested

Bug reports and feature requests: [GitHub Issues](https://github.com/suraim001/mern-thinkboard/issues).

---

## 📄 License

Distributed under the **ISC License** as declared in [`package.json`](package.json).

---

## 👤 Author

**Fawaj Suraim**

- GitHub: [@suraim001](https://github.com/suraim001)
- Email: fawajsuraim@gmail.com

<div align="center">

⭐ If you find this project useful, consider giving it a star.

</div>

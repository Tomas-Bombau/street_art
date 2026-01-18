# Street Art

Fullstack application with Elixir/Phoenix backend and React/Vite frontend.

## Tech Stack

### Backend
- **Elixir + Phoenix** (API only)
- **Bandit** - HTTP server
- **Joken** - JWT authentication (access + refresh tokens)
- **Argon2** - Password hashing
- **Redix** - Redis client
- **PostgreSQL** - Database

### Frontend
- **React + TypeScript + Vite**
- **Tailwind CSS + shadcn/ui** - Styling and components
- **React Hook Form + Zod** - Form handling and validation
- **Sonner** - Toast notifications
- **Axios** - HTTP client with token refresh

## Setup

### Prerequisites
- Elixir 1.15+
- Node.js 20+
- PostgreSQL
- Redis

### Backend

```bash
cd backend
mix deps.get
mix ecto.create
mix phx.server
```

Runs on http://localhost:4000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173

## Project Structure

```
street_art/
├── backend/                 # Phoenix API
│   ├── lib/
│   │   ├── backend/        # Business logic
│   │   │   ├── auth/       # JWT token handling
│   │   │   └── cache.ex    # Redis wrapper
│   │   └── backend_web/    # Web layer
│   │       └── controllers/
│   └── config/
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/ui/  # shadcn components
│   │   ├── lib/           # Utilities (api, auth)
│   │   └── hooks/
│   └── components.json    # shadcn config
└── README.md
```

## API Endpoints

- `GET /api/health` - Health check (DB + Redis status)

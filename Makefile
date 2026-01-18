.PHONY: setup backend frontend dev db-create db-reset install help

# Default target
help:
	@echo "Street Art - Available commands:"
	@echo ""
	@echo "  make setup      - Install all dependencies (backend + frontend)"
	@echo "  make dev        - Start both backend and frontend"
	@echo "  make backend    - Start backend only (port 4000)"
	@echo "  make frontend   - Start frontend only (port 5173)"
	@echo "  make db-create  - Create the database"
	@echo "  make db-reset   - Drop and recreate the database"
	@echo "  make install    - Alias for setup"
	@echo ""

# Install all dependencies
setup:
	@echo "Installing backend dependencies..."
	cd backend && mix deps.get
	@echo ""
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo ""
	@echo "Setup complete! Run 'make db-create' then 'make dev'"

install: setup

# Database commands
db-create:
	cd backend && mix ecto.create

db-reset:
	cd backend && mix ecto.reset

# Start backend server
backend:
	cd backend && mix phx.server

# Start frontend dev server
frontend:
	cd frontend && npm run dev

# Start both (requires terminal multiplexer or run in background)
dev:
	@echo "Starting Street Art..."
	@echo "Backend:  http://localhost:4000"
	@echo "Frontend: http://localhost:5173"
	@echo ""
	@trap 'kill 0' INT; \
	(cd backend && mix phx.server) & \
	(cd frontend && npm run dev) & \
	wait

.PHONY: setup backend frontend dev db-reset install help

# Default target
help:
	@echo "Street Art - Available commands:"
	@echo ""
	@echo "  make setup      - Install dependencies + setup database"
	@echo "  make dev        - Start both backend and frontend"
	@echo "  make backend    - Start backend only (port 4000)"
	@echo "  make frontend   - Start frontend only (port 5173)"
	@echo "  make db-reset   - Drop and recreate the database"
	@echo "  make install    - Alias for setup"
	@echo ""
	@echo "After setup, access:"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:4000"
	@echo "  Mailbox:  http://localhost:4000/dev/mailbox"
	@echo ""

# Install all dependencies and setup database
setup:
	@echo "Installing backend dependencies..."
	cd backend && mix deps.get
	@echo ""
	@echo "Setting up database..."
	cd backend && mix ecto.setup
	@echo ""
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo ""
	@echo "Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Copy frontend/.env.example to frontend/.env"
	@echo "  2. Add your Google Maps and Cloudinary API keys"
	@echo "  3. Run 'make dev' to start both servers"
	@echo ""
	@echo "Admin login: admin@example.com / admin123"

install: setup

# Database commands
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

# Root Makefile

BACKEND_DIR=nodejs-backend
FRONTEND_DIR=react-frontend

# Install dependencies
install:
	cd $(BACKEND_DIR) && npm install
	cd $(FRONTEND_DIR) && npm install

# Run backend in foreground with live logs
backend:
	cd $(BACKEND_DIR) && npm install && node index.js

# OR: Run backend with nodemon (if you have it installed globally or locally)
backend-dev:
	cd $(BACKEND_DIR) && npm install && npx nodemon index.js

# Run frontend (in a separate terminal)
frontend:
	cd $(FRONTEND_DIR) && npm install && npm run dev

# Run both (backend in background, logs to backend.log; frontend in terminal)
run:
	@echo "🚀 Starting backend in background..."
	cd $(BACKEND_DIR) && npm install && node index.js > ../backend.log 2>&1 &

	@echo "🌐 Starting frontend..."
	cd $(FRONTEND_DIR) && npm install && npm run dev

# Run both backend and frontend in foreground with backend logs visible live
run-foreground:
	@echo "🚀 Starting backend and frontend together (both logs visible)..."
	cd $(BACKEND_DIR) && npm install && node index.js & \
	cd $(FRONTEND_DIR) && npm install && npm run dev

# View backend logs (real-time)
logs:
	tail -f backend.log

# Stop backend
stop:
	@echo "🛑 Stopping all node backend processes..."
	pkill -f "node index.js" || true
	pkill -f "nodemon index.js" || true

.PHONY: install backend backend-dev frontend run run-foreground logs stop

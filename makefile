# Makefile at root of your project

# Backend and frontend folders
BACKEND_DIR=job-tracker
FRONTEND_DIR=job-tracker-frontend

# Targets
run:
	@echo "🚀 Starting backend..."
	cd $(BACKEND_DIR) && npm install && node index.js &

	@echo "🌐 Starting frontend..."
	cd $(FRONTEND_DIR) && npm install && npm run dev

stop:
	@echo "🛑 Stopping all node processes..."
	pkill -f "node index.js" || true

.PHONY: run stop
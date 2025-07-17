# Dream Layer - Root Makefile
# Handles running, testing, and linting for the entire project

.PHONY: help run test lint clean install deps frontend backend comfyui
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Python and Node commands
PYTHON := python
NPM := npm
PIP := $(PYTHON) -m pip

# Directories
BACKEND_DIR := dream_layer_backend
FRONTEND_DIR := dream_layer_frontend
COMFYUI_DIR := ComfyUI

help: ## Show this help message
	@echo "$(BLUE)Dream Layer Makefile Commands$(NC)"
	@echo "================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# === INSTALLATION TARGETS ===

install: deps ## Install all dependencies for the project
	@echo "$(GREEN)[SUCCESS]$(NC) All dependencies installed!"

deps: backend-deps frontend-deps comfyui-deps ## Install dependencies for all components

backend-deps: ## Install backend Python dependencies
	@echo "$(BLUE)[INFO]$(NC) Installing backend dependencies..."
	cd $(BACKEND_DIR) && $(PIP) install -r requirements.txt

frontend-deps: ## Install frontend Node.js dependencies
	@echo "$(BLUE)[INFO]$(NC) Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && $(NPM) install

comfyui-deps: ## Install ComfyUI Python dependencies
	@echo "$(BLUE)[INFO]$(NC) Installing ComfyUI dependencies..."
	cd $(COMFYUI_DIR) && $(PIP) install -r requirements.txt

# === RUNNING TARGETS ===

run: ## Start all Dream Layer services
	@echo "$(BLUE)[INFO]$(NC) Starting Dream Layer services..."
ifeq ($(OS),Windows_NT)
	start_dream_layer.bat
else
	./start_dream_layer.sh
endif

backend: ## Start only the backend services
	@echo "$(BLUE)[INFO]$(NC) Starting backend services..."
	cd $(BACKEND_DIR) && $(PYTHON) dream_layer.py &
	cd $(BACKEND_DIR) && $(PYTHON) txt2img_server.py &
	cd $(BACKEND_DIR) && $(PYTHON) img2img_server.py &
	cd $(BACKEND_DIR) && $(PYTHON) extras.py &
	@echo "$(GREEN)[SUCCESS]$(NC) Backend services started"

frontend: ## Start only the frontend development server
	@echo "$(BLUE)[INFO]$(NC) Starting frontend development server..."
	cd $(FRONTEND_DIR) && $(NPM) run dev

comfyui: ## Start only ComfyUI server
	@echo "$(BLUE)[INFO]$(NC) Starting ComfyUI server..."
	cd $(COMFYUI_DIR) && $(PYTHON) main.py

# === TESTING TARGETS ===

test: test-backend test-frontend ## Run all tests
	@echo "$(GREEN)[SUCCESS]$(NC) All tests completed!"

test-backend: ## Run backend Python tests
	@echo "$(BLUE)[INFO]$(NC) Running backend tests..."
	cd $(COMFYUI_DIR) && $(PYTHON) -m pytest tests-unit/ -v
	cd $(COMFYUI_DIR) && $(PYTHON) -m pytest tests/ -m "not inference" -v

test-inference: ## Run inference tests (may require models)
	@echo "$(YELLOW)[WARNING]$(NC) Running inference tests (requires models)..."
	cd $(COMFYUI_DIR) && $(PYTHON) -m pytest tests/ -m "inference" -v

test-frontend: ## Run frontend tests (if any test framework is configured)
	@echo "$(BLUE)[INFO]$(NC) Frontend tests not configured yet"
	@echo "$(YELLOW)[TODO]$(NC) Configure test framework for frontend"

# === LINTING TARGETS ===

lint: lint-backend lint-frontend ## Run all linting and formatting
	@echo "$(GREEN)[SUCCESS]$(NC) All linting completed!"

lint-backend: ## Run Python linting with ruff
	@echo "$(BLUE)[INFO]$(NC) Running Python linting..."
	cd $(COMFYUI_DIR) && $(PYTHON) -m ruff check .
	@echo "$(BLUE)[INFO]$(NC) Running Python format check..."
	cd $(COMFYUI_DIR) && $(PYTHON) -m ruff format --check .

lint-frontend: ## Run TypeScript/JavaScript linting
	@echo "$(BLUE)[INFO]$(NC) Running frontend linting..."
	cd $(FRONTEND_DIR) && $(NPM) run lint

format: format-backend format-frontend ## Format all code

format-backend: ## Format Python code with ruff
	@echo "$(BLUE)[INFO]$(NC) Formatting Python code..."
	cd $(COMFYUI_DIR) && $(PYTHON) -m ruff format .

format-frontend: ## Format frontend code (if formatter is configured)
	@echo "$(BLUE)[INFO]$(NC) Frontend formatting not configured"
	@echo "$(YELLOW)[TODO]$(NC) Configure Prettier or similar for frontend"

# === BUILD TARGETS ===

build: build-frontend ## Build the project for production
	@echo "$(GREEN)[SUCCESS]$(NC) Build completed!"

build-frontend: ## Build frontend for production
	@echo "$(BLUE)[INFO]$(NC) Building frontend..."
	cd $(FRONTEND_DIR) && $(NPM) run build

build-frontend-dev: ## Build frontend for development
	@echo "$(BLUE)[INFO]$(NC) Building frontend for development..."
	cd $(FRONTEND_DIR) && $(NPM) run build:dev

# === CLEANUP TARGETS ===

clean: clean-frontend clean-logs ## Clean build artifacts and logs
	@echo "$(GREEN)[SUCCESS]$(NC) Cleanup completed!"

clean-frontend: ## Clean frontend build artifacts
	@echo "$(BLUE)[INFO]$(NC) Cleaning frontend build artifacts..."
	cd $(FRONTEND_DIR) && rm -rf dist node_modules/.vite

clean-logs: ## Clean log files
	@echo "$(BLUE)[INFO]$(NC) Cleaning log files..."
	rm -f logs/*.log
	rm -f logs/*.pid

clean-all: clean ## Clean everything including dependencies
	@echo "$(YELLOW)[WARNING]$(NC) Removing all dependencies..."
	rm -rf $(FRONTEND_DIR)/node_modules
	@echo "$(GREEN)[SUCCESS]$(NC) Complete cleanup finished!"

# === DEVELOPMENT TARGETS ===

dev-setup: install ## Set up development environment
	@echo "$(BLUE)[INFO]$(NC) Setting up development environment..."
	@echo "$(GREEN)[SUCCESS]$(NC) Development environment ready!"

check: lint test ## Run all checks (linting and testing)
	@echo "$(GREEN)[SUCCESS]$(NC) All checks passed!"

# === UTILITY TARGETS ===

status: ## Show status of services
	@echo "$(BLUE)[INFO]$(NC) Checking service status..."
	@echo "Checking ports:"
	@echo "  Frontend (8080): $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null || echo "Not running")"
	@echo "  Backend (5002): $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5002 2>/dev/null || echo "Not running")"
	@echo "  ComfyUI (8188): $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8188 2>/dev/null || echo "Not running")"

logs: ## Show recent logs
	@echo "$(BLUE)[INFO]$(NC) Recent log entries:"
	@if [ -d logs ]; then \
		for log in logs/*.log; do \
			if [ -f "$$log" ]; then \
				echo "$(YELLOW)=== $$log ===$(NC)"; \
				tail -n 5 "$$log" 2>/dev/null || echo "Empty or unreadable"; \
				echo; \
			fi; \
		done; \
	else \
		echo "No logs directory found"; \
	fi
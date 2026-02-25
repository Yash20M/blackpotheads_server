.PHONY: help build up down restart logs clean dev dev-down prod

# Default target
help:
	@echo "Available commands:"
	@echo "  make build       - Build Docker images"
	@echo "  make up          - Start production containers"
	@echo "  make down        - Stop and remove containers"
	@echo "  make restart     - Restart containers"
	@echo "  make logs        - View container logs"
	@echo "  make clean       - Remove containers, volumes, and images"
	@echo "  make dev         - Start development environment with hot reload"
	@echo "  make dev-down    - Stop development environment"
	@echo "  make prod        - Build and start production environment"
	@echo "  make shell       - Open shell in app container"
	@echo "  make mongo       - Open MongoDB shell"

# Build Docker images
build:
	docker-compose build

# Start production containers
up:
	docker-compose up -d

# Stop and remove containers
down:
	docker-compose down

# Restart containers
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# View app logs only
logs-app:
	docker-compose logs -f app

# MongoDB is on Atlas (no local container)

# Remove everything (containers, volumes, images)
clean:
	docker-compose down -v --rmi all

# Start development environment
dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "App: http://localhost:3000"
	@echo "Using MongoDB Atlas from .env"

# Stop development environment
dev-down:
	docker-compose -f docker-compose.dev.yml down

# Build and start production
prod:
	docker-compose up -d --build
	@echo "Production environment started!"
	@echo "App: http://localhost:3000"

# Open shell in app container
shell:
	docker-compose exec app sh

# Note: MongoDB is on Atlas, not in container
# Connect using: mongosh "your_atlas_connection_string"

# Check container status
status:
	docker-compose ps

# Rebuild and restart
rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# View real-time stats
stats:
	docker stats blackpotheads-app

# Docker Setup Guide

This project includes Docker configuration for easy deployment and development.

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)
- Make (optional, for using Makefile commands)

## Quick Start

### Production Environment

```bash
# Build and start containers
docker-compose up -d --build

# Or using Make
make prod
```

### Development Environment (with hot reload)

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Or using Make
make dev
```

## Available Commands

### Using Docker Compose

```bash
# Build images
docker-compose build

# Start containers (detached mode)
docker-compose up -d

# Start containers (with logs)
docker-compose up

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# Restart containers
docker-compose restart

# Remove everything (including volumes)
docker-compose down -v
```

### Using Makefile (Recommended)

```bash
# View all available commands
make help

# Production
make build          # Build Docker images
make up             # Start production containers
make prod           # Build and start production
make down           # Stop containers
make restart        # Restart containers

# Development
make dev            # Start development with hot reload
make dev-down       # Stop development environment

# Monitoring
make logs           # View all logs
make logs-app       # View app logs only
make logs-db        # View MongoDB logs only
make status         # Check container status
make stats          # View real-time container stats

# Utilities
make shell          # Open shell in app container
make mongo          # Open MongoDB shell
make clean          # Remove everything (containers, volumes, images)
make rebuild        # Rebuild from scratch
```

## Environment Variables

The application uses environment variables from your `.env` file. Make sure you have:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blackpotheads
SECRETKEY=your_secret_key
ADMIN_SECRET=your_admin_secret
FRONTEND_URL=your_frontend_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_API_KEY=your_razorpay_key
RAZORPAY_SECRET_KEY=your_razorpay_secret
RAZORPAY_ID=your_razorpay_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Important**: This setup uses MongoDB Atlas (cloud), not a local MongoDB container.

## Services

### Application (Node.js)
- **Port**: 3000
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/v1/health

### MongoDB
- **Type**: MongoDB Atlas (Cloud)
- **Connection**: Uses `MONGO_URI` from `.env` file
- **Note**: No local MongoDB container - connects to Atlas

## Volumes

- `./uploads`: Application uploads directory (persisted on host)

## Development vs Production

### Development (`docker-compose.dev.yml`)
- Uses `Dockerfile.dev`
- Includes nodemon for hot reload
- Mounts source code as volume
- Installs dev dependencies
- Better for active development

### Production (`docker-compose.yml`)
- Uses optimized `Dockerfile`
- Production-only dependencies
- No source code mounting
- Smaller image size
- Better for deployment

## Troubleshooting

### Container won't start
```bash
# Check logs
make logs

# Check container status
make status

# Rebuild from scratch
make rebuild
```

### MongoDB connection issues
```bash
# Check app logs for connection errors
make logs-app

# Verify MONGO_URI in .env is correct
# Test connection using mongosh:
mongosh "your_atlas_connection_string"
```

### Port already in use
```bash
# Stop all containers
make down

# Check what's using the port
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Clear everything and start fresh
```bash
# Remove all containers, volumes, and images
make clean

# Rebuild and start
make prod
```

## Accessing Containers

### App Container Shell
```bash
make shell
# or
docker-compose exec app sh
```

### MongoDB Atlas Shell
```bash
# Connect to Atlas using mongosh (install separately)
mongosh "your_atlas_connection_string"
```

## Health Checks

Both services include health checks:

- **App**: Checks `/api/v1/health` endpoint every 30s
- **MongoDB**: Pings database every 10s

View health status:
```bash
docker-compose ps
```

## Production Deployment

For production deployment:

1. Update `.env` with production values
2. Build and start:
   ```bash
   make prod
   ```
3. Verify health:
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

## Backup MongoDB Atlas

Use MongoDB Atlas built-in backup features or mongodump/mongorestore:

```bash
# Backup (requires mongosh/mongodump installed locally)
mongodump --uri="your_atlas_connection_string" --out=./backup

# Restore
mongorestore --uri="your_atlas_connection_string" ./backup
```

## Notes

- This setup uses MongoDB Atlas (cloud) - no local MongoDB container
- Make sure your Atlas cluster allows connections from your Docker host IP
- The app automatically creates an admin user on first run
- Uploads directory is mounted from host for persistence
- For production, consider using Docker secrets for sensitive environment variables

#!/bin/bash

# VPS Deployment Script for E-commerce Server
# Run this script on your VPS

echo "🚀 Starting VPS Deployment for E-commerce Server..."

# 1. Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please logout and login again, then run this script again."
    exit 0
fi

# 3. Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "📋 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 4. Create SSL directory
echo "🔒 Creating SSL directory..."
mkdir -p ssl

# 5. Set up environment variables
echo "⚙️ Setting up environment variables..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Please edit .env file with your actual values:"
    echo "   - MONGO_ROOT_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - FRONTEND_URL"
    echo "   - CLOUDINARY_* (if using Cloudinary)"
    echo ""
    echo "Press Enter when you've updated the .env file..."
    read
fi

# 6. Set proper permissions
echo "🔐 Setting file permissions..."
chmod 600 .env
chmod 600 ssl/* 2>/dev/null || true

# 7. Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# 8. Build and start production services
echo "🏗️ Building and starting production services..."
docker-compose -f docker-compose.prod.yml up -d --build

# 9. Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# 10. Check service status
echo "📊 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# 11. Test health endpoint
echo "🏥 Testing health endpoint..."
if curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Check logs with: docker-compose -f docker-compose.prod.yml logs -f"
fi

# 12. Show useful commands
echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "   Update application: git pull && docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "🌐 Your application should be available at:"
echo "   - HTTP: http://your-server-ip"
echo "   - HTTPS: https://your-server-ip (if SSL certificates are configured)"
echo ""
echo "📝 Next steps:"
echo "   1. Configure your domain DNS to point to this server"
echo "   2. Set up SSL certificates (Let's Encrypt recommended)"
echo "   3. Configure firewall (UFW)"
echo "   4. Set up monitoring and backups" 
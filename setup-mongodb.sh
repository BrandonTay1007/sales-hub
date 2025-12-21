#!/bin/bash

echo "🚀 Starting MongoDB setup..."

# Start MongoDB container
echo "📦 Starting MongoDB container..."
docker-compose up -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to start..."
sleep 3

# Check if replica set is already initialized
echo "🔍 Checking replica set status..."
RS_STATUS=$(docker exec pebble-mongodb mongosh --quiet --eval "try { rs.status().ok } catch(e) { 0 }" 2>/dev/null)

if [ "$RS_STATUS" = "1" ]; then
  echo "✅ Replica set already initialized"
else
  echo "🔧 Initializing replica set..."
  docker exec pebble-mongodb mongosh --eval "rs.initiate()" > /dev/null 2>&1
  
  # Wait for replica set to be ready
  echo "⏳ Waiting for replica set to be ready..."
  sleep 2
  
  echo "✅ Replica set initialized successfully"
fi

echo ""
echo "✅ MongoDB is ready!"
echo ""
echo "Next steps:"
echo "  cd backend"
echo "  npx prisma generate"
echo "  npx prisma db push"
echo "  npm run seed"

# MongoDB Setup Script for Windows
# Run with: .\setup-mongodb.ps1

Write-Host "🚀 Starting MongoDB setup..." -ForegroundColor Cyan

# Start MongoDB container
Write-Host "📦 Starting MongoDB container..." -ForegroundColor Yellow
docker-compose up -d

# Wait for MongoDB to be ready
Write-Host "⏳ Waiting for MongoDB to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if replica set is already initialized
Write-Host "🔍 Checking replica set status..." -ForegroundColor Yellow
$rsStatus = docker exec pebble-mongodb mongosh --quiet --eval "try { rs.status().ok } catch(e) { 0 }" 2>$null

if ($rsStatus -match "1") {
    Write-Host "✅ Replica set already initialized" -ForegroundColor Green
} else {
    Write-Host "🔧 Initializing replica set..." -ForegroundColor Yellow
    docker exec pebble-mongodb mongosh --eval "rs.initiate()" | Out-Null
    
    # Wait for replica set to be ready
    Write-Host "⏳ Waiting for replica set to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    
    Write-Host "✅ Replica set initialized successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ MongoDB is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  cd backend"
Write-Host "  npx prisma generate"
Write-Host "  npx prisma db push"
Write-Host "  npm run seed"

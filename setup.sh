#!/bin/bash

# School Inspection Monitoring System - Setup Script

echo "=========================================="
echo "EduScope - Setup & Installation"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v16+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) found"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create .env file if not exists
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "📝 Creating backend/.env file..."
    cat > backend/.env << EOF
MONGO_URI=mongodb://localhost:27017/eduscope
JWT_SECRET=your_jwt_secret_key_change_this_12345
JWT_EXPIRE=7d
OTP_EXPIRE=5m
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ Created backend/.env (update with your credentials)"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend/.env file..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
    echo "✅ Created frontend/.env"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Ensure MongoDB is running (mongodb://localhost:27017)"
echo "2. Seed test data: cd backend && npm run seed"
echo "3. Start the app: npm run dev (from root)"
echo ""
echo "📚 Documentation: See SETUP.md and backend/API.md"
echo "🔐 Test Credentials in SETUP.md"
echo ""

@echo off
REM School Inspection Monitoring System - Windows Setup Script

echo.
echo ==========================================
echo EduScope - Setup and Installation
echo ==========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js not found. Please install Node.js v16+ from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo OK Node.js %NODE_VERSION% found

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X npm not found. Please install npm.
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo OK npm %NPM_VERSION% found

REM Install root dependencies
echo.
echo Installing root dependencies...
call npm install

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Create .env files if they don't exist
if not exist "backend\.env" (
    echo.
    echo Creating backend\.env file...
    (
        echo MONGO_URI=mongodb://localhost:27017/eduscope
        echo JWT_SECRET=your_jwt_secret_key_change_this_12345
        echo JWT_EXPIRE=7d
        echo OTP_EXPIRE=5m
        echo TWILIO_ACCOUNT_SID=your_twilio_sid
        echo TWILIO_AUTH_TOKEN=your_twilio_token
        echo TWILIO_PHONE=+1234567890
        echo NODE_ENV=development
        echo PORT=5000
        echo FRONTEND_URL=http://localhost:5173
    ) > backend\.env
    echo OK Created backend\.env
)

if not exist "frontend\.env" (
    echo Creating frontend\.env file...
    (
        echo VITE_API_URL=http://localhost:5000/api
    ) > frontend\.env
    echo OK Created frontend\.env
)

echo.
echo ==========================================
echo OK Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Ensure MongoDB is running on localhost:27017
echo 2. Seed test data: cd backend ^&^& npm run seed
echo 3. Start the app: npm run dev (from root)
echo.
echo For documentation, see SETUP.md and backend/API.md
echo.
pause

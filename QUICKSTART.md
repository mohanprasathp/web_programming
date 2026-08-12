# Quick Start Guide - 5 Minutes

## 1️⃣ Prerequisites (1 minute)

Ensure you have:
- **Node.js 16+** - [Download](https://nodejs.org/)
- **MongoDB running** - [Install locally](https://docs.mongodb.com/manual/installation/) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 2️⃣ Clone/Download Project

```bash
# Navigate to project folder
cd "eduscope project"
```

## 3️⃣ Setup (2 minutes)

### Windows:
```bash
# Run setup script
setup.bat
```

### macOS/Linux:
```bash
# Run setup script
bash setup.sh
```

### Manual Setup:
```bash
# Install all dependencies
npm install && cd frontend && npm install && cd ../backend && npm install && cd ..
```

## 4️⃣ Seed Test Data (1 minute)

```bash
cd backend
npm run seed
cd ..
```

This creates:
- 3 test users (CEO, DEO, Headmaster)
- 3 sample schools
- 1 inspection plan with assignments

## 5️⃣ Start the Application (1 minute)

```bash
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**URLs:**
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)
- API: [http://localhost:5000/api](http://localhost:5000/api)

## 🔐 Log In

**CEO:**
- Employee ID: `ceo001`
- Password: `password123`
- OTP: `123456`

**DEO/BEO:**
- Employee ID: `deo001`
- Password: `password123`
- OTP: `123456`

**Headmaster:**
- Employee ID: `hm001`
- Password: `password123`
- OTP: `123456`

## 🎯 Test the Main Feature (GPS Inspection)

### As DEO/BEO:

1. **Log in** with deo001 credentials
2. **Dashboard** → Click "View Assigned Inspections"
3. **Click** on any school → "Start Inspection"
4. **Browser will ask** for location permission → **Allow**
5. **System verifies** you're within 100m of school
6. **Proceed** with inspection checklist
7. **Upload photos** (with GPS coordinates)
8. **Create issues** (if any)
9. **Submit report** with OTP signature

## 📊 CEO Features

1. **Create inspection plan** with checklist items
2. **Digitally sign** plans with OTP
3. **Assign schools** to DEO/BEO with deadlines
4. **View analytics** dashboard
5. **Monitor all issues** with priority tracking
6. **Generate reports** by date/district

## 📋 Headmaster Features

1. **View inspection reports** for your school
2. **See all issues** with deadlines
3. **Add corrective actions** with proof photos
4. **Request extensions** for issue resolution
5. **Mark issues as resolved**

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000/5173 already in use | Change in `.env` or kill process |
| MongoDB connection error | Start MongoDB or check connection string |
| GPS not working | Allow permissions, use HTTPS or localhost |
| Can't login | Run `npm run seed` to create test users |
| Dependencies missing | Run `npm install` in backend and frontend |

## 📚 More Documentation

- **Full Setup**: See [SETUP.md](SETUP.md)
- **API Reference**: See [backend/API.md](backend/API.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Development**: See [DEVELOPMENT.md](DEVELOPMENT.md)

## 🚀 Next Steps

- [ ] Test all three user roles
- [ ] Try GPS-based inspection start
- [ ] Create and track issues
- [ ] Test corrective actions
- [ ] Review analytics dashboard
- [ ] Customize for your needs

## 💡 Tips

1. **GPS Testing**: If you don't have GPS, use browser DevTools to set location
2. **Test Data**: Seed creates 3 schools in Chennai area
3. **PDF Export**: (Coming soon) Generate inspection reports as PDF
4. **Offline Mode**: (Coming soon) Work offline and sync later

## 🆘 Need Help?

1. Check the detailed error message in terminal
2. Review [SETUP.md](SETUP.md) for common issues
3. Check [API.md](backend/API.md) for endpoint details
4. Look at console (F12) in browser for debugging

---

**Ready? Start with `npm run dev`!** 🎉

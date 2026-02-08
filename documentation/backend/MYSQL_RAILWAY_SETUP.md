# 🚀 MySQL + Railway Setup Guide

## ✅ SWITCHED FROM MONGODB TO MYSQL!

Your Hospital Management System now uses **MySQL** instead of MongoDB!

---

## 🎯 What Changed

### Before (MongoDB)
```
❌ MongoDB local database
❌ Mongoose models
❌ Limited to local machine
```

### After (MySQL)
```
✅ MySQL database (local or Railway)
✅ SQL queries with mysql2/promise
✅ Can deploy to production instantly
✅ Railway integration ready
```

---

## 📋 Setup Steps

### Step 1: Install MySQL Locally (Optional)

**For Development (Windows):**

1. Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
2. Run installer
3. Default settings usually work
4. Default user: `root`, password: `root`

OR use Docker:
```bash
docker run --name mysql-hospital -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0
```

### Step 2: Create Database Schema

Run this command in the backend folder:

```bash
cd hospital-backend
npm run create-schema
```

This will:
- ✅ Create `hospital_management` database
- ✅ Create all 13 tables
- ✅ Set up relationships between tables
- ✅ Ready for data insertion

### Step 3: Start Backend with MySQL

```bash
cd hospital-backend
npm start
```

You should see:
```
🌍 MySQL Connected Successfully
Server running on port 5001
```

---

## 🚄 Connect to Railway MySQL

Railway makes deployment super easy!

### Option A: Use Railway MySQL (Recommended for Production)

1. **Go to Railway:** https://railway.app
2. **Create New Project** → Select **MySQL**
3. **Get Connection Details:**
   - Click on MySQL service
   - Go to "Connect" tab
   - Copy the **MySQL_URL**

### Option B: Add to Existing Railway Project

1. **In your Railway Dashboard**
2. **Click "New"** → **MySQL**
3. **Copy MySQL_URL**

---

## 🔧 Configure Environment Variables

### For Local Development

Edit `.env` in `hospital-backend`:

```env
# Local MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=hospital_management
MYSQL_URL=  # Leave empty for local
```

### For Railway Production

Edit `.env` or set in Railway:

```env
# Railway MySQL
MYSQL_URL=mysql://user:password@hostname:port/database_name
# Leave other DB vars empty
```

**OR** in Railway Dashboard:

1. Click your project
2. Click MySQL service
3. Go to "Variables" tab
4. Add new variable:
   - Name: `MYSQL_URL`
   - Value: (paste the MySQL_URL from Railway)
5. Click Add

---

## 📊 Database Tables Created

The schema creates these tables automatically:

```
1. users              → Login credentials
2. patients           → Patient information
3. doctors            → Doctor details
4. appointments       → Appointment records
5. billing            → Bills and invoices
6. laboratory         → Lab tests
7. staff              → Staff members
8. wards              → Hospital wards
9. ipd                → In-patient admissions
10. opd               → Out-patient visits
11. insurance_policies → Insurance info
12. insurance_claims   → Insurance claims
13. tpa               → TPA information
```

---

## 🧪 Test the Connection

### Test 1: Check Health Endpoint

```bash
curl http://localhost:5001/api/health
```

Response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Test 2: Create a Patient

```bash
curl -X POST http://localhost:5001/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "phone": "9876543210",
    "email": "john@example.com"
  }'
```

### Test 3: Get All Patients

```bash
curl http://localhost:5001/api/patients
```

---

## 🌍 Railway Deployment

### Step 1: Push to GitHub

```bash
cd hospital-backend
git add .
git commit -m "switch: MongoDB to MySQL with Railway support"
git push
```

### Step 2: Connect GitHub to Railway

1. **Go to Railway Dashboard**
2. **New Project** → **Deploy from GitHub**
3. **Select** `hospital_frontend` repo
4. **Railway auto-detects** Node.js project
5. **Add MySQL** if not already added

### Step 3: Set Environment Variables

In Railway Dashboard for backend service:

```
DB_HOST=mysql-hostname
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<from-mysql-service>
DB_NAME=hospital_management
MYSQL_URL=<copy-from-mysql-service>
```

### Step 4: Deploy

Click **Deploy** button. Railway will:
- ✅ Install dependencies
- ✅ Start npm start
- ✅ Connect to MySQL
- ✅ Create schema automatically
- ✅ Ready to use!

---

## 📝 NPM Scripts

### Create Schema (First Time)

```bash
npm run create-schema
```

### Start Backend

```bash
npm start
```

### Start with Seed Data

```bash
npm run seed
```

---

## 🔗 API Endpoints (Same as Before)

All endpoints work the same way, but now save to MySQL:

### Patients
```
GET    /api/patients              → List all patients
POST   /api/patients              → Create patient
GET    /api/patients/:id          → Get patient
PUT    /api/patients/:id          → Update patient
DELETE /api/patients/:id          → Delete patient
```

### Billing
```
GET    /api/billing               → List all bills
POST   /api/billing               → Create bill
GET    /api/billing/:id           → Get bill
PUT    /api/billing/:id           → Update bill
DELETE /api/billing/:id           → Delete bill
```

### Other Modules
Same pattern for: `/api/appointments`, `/api/doctors`, `/api/laboratory`, `/api/staff`, `/api/wards`, `/api/ipd`, `/api/opd`, `/api/insurance-policies`, `/api/insurance-claims`, `/api/tpa`

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MySQL"

**Solution 1: Check MySQL is running**
```bash
# Windows
mysql -u root -p
# Should connect

# Docker
docker ps | grep mysql
# Should show container running
```

**Solution 2: Check credentials in .env**
```env
DB_HOST=localhost          # Check correct
DB_USER=root               # Check correct
DB_PASSWORD=root           # Check correct
DB_NAME=hospital_management # Check correct
```

**Solution 3: Create database manually**
```bash
mysql -u root -p
CREATE DATABASE hospital_management;
USE hospital_management;
# Now run npm run create-schema
```

### Error: "Table already exists"

**Solution:** Drop and recreate
```bash
mysql -u root -p
DROP DATABASE hospital_management;
# Run npm run create-schema again
```

### Railway Connection Issue

**Solution 1: Copy URL correctly**
```
Format: mysql://user:password@hostname:port/database
Example: mysql://root:abc123@containers-us-west-17.railway.app:6875/railway
```

**Solution 2: Check Railway variables**
```
Log into Railway Dashboard
→ Select MySQL service
→ Click "Variables" tab
→ Copy MYSQL_URL exactly
→ Paste in backend .env or Railway project variables
```

---

## 📦 Dependencies

Your package.json now has:

```json
{
  "mysql2": "^3.6.0",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "helmet": "^7.0.0"
}
```

If missing, install:
```bash
npm install mysql2 express cors dotenv helmet
```

---

## ✨ Features That Work the Same

- ✅ Patient Management (CRUD)
- ✅ Billing (Create, Update, Delete, Export)
- ✅ Appointments
- ✅ Lab Tests
- ✅ Staff Management
- ✅ Ward Management
- ✅ Insurance Management
- ✅ Dark Mode
- ✅ Analytics
- ✅ Search & Filter
- ✅ PDF Export
- ✅ CSV Export

**Everything works exactly the same, but now with MySQL!**

---

## 🎯 Quick Start (5 Minutes)

### 1. Install MySQL Locally (Skip if using Railway)
```bash
# Windows: Download from mysql.com
# Or Docker:
docker run --name mysql-hospital -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0
```

### 2. Create Schema
```bash
cd hospital-backend
npm run create-schema
```

### 3. Start Backend
```bash
npm start
# Should show: 🌍 MySQL Connected Successfully
```

### 4. Start Frontend (In another terminal)
```bash
cd hospitalmanagement
npm start
# Visit http://localhost:3000
```

### 5. Test
```bash
Add patient → See it in database
Create bill → Download PDF
Everything works! ✅
```

---

## 🚀 Deploy to Railway (5 Steps)

1. **Push code to GitHub**
   ```bash
   git push
   ```

2. **Go to Railway.app**

3. **Create New Project** → **MySQL**

4. **Deploy from GitHub** → Select backend repo

5. **Set environment variables** → Add MYSQL_URL

**Done! 🎉 Your backend is live!**

---

## 📞 Need Help?

### Check These Files
- `hospital-backend/.env` → Configuration
- `hospital-backend/server.js` → MySQL setup
- `hospital-backend/db/models.js` → SQL functions
- `hospital-backend/db/createSchema.js` → Table creation

### Test Endpoints
```bash
# Health check
curl http://localhost:5001/api/health

# List patients
curl http://localhost:5001/api/patients

# Create patient
curl -X POST http://localhost:5001/api/patients -H "Content-Type: application/json" -d '{"firstName":"Test"}'
```

---

## ✅ You're Ready!

Your Hospital Management System now:
- ✅ Uses MySQL instead of MongoDB
- ✅ Can deploy to Railway instantly
- ✅ Connects to your Railway MySQL database
- ✅ Has all features working perfectly
- ✅ Is production-ready!

**Start using it now: http://localhost:3000**

Made with ❤️ for your hospital needs!

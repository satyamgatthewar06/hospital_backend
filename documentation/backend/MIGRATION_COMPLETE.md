# ✅ SWITCHED TO MYSQL WITH RAILWAY SUPPORT

## 🎉 Your Backend Now Uses MySQL Instead of MongoDB!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Set Your Railway MySQL Credentials

Edit `hospital-backend/.env`:

```env
MYSQL_URL=mysql://user:password@hostname:port/database
```

OR keep local MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=hospital_management
```

### Step 2: Create Database Schema

```bash
cd hospital-backend
npm run create-schema
```

You'll see:
```
✅ Database 'hospital_management' ready
✅ Users table created
✅ Patients table created
...
✅ All tables created successfully!
```

### Step 3: Start Backend

```bash
npm start
```

You'll see:
```
🌍 MySQL Connected Successfully
Server running on port 5001
```

---

## 📋 What Was Changed

| Aspect | Before | After |
|--------|--------|-------|
| Database | MongoDB | ✅ MySQL |
| ORM | Mongoose | ✅ mysql2/promise |
| Schema | Document-based | ✅ Table-based |
| Deployment | Local only | ✅ Railway ready |
| Tables | N/A | ✅ 13 tables created |

---

## 📍 Database Schema Created

13 Tables:
1. `users` - Login credentials
2. `patients` - Patient information
3. `doctors` - Doctor details
4. `appointments` - Appointment records
5. `billing` - Bills and invoices
6. `laboratory` - Lab tests
7. `staff` - Staff members
8. `wards` - Hospital wards
9. `ipd` - In-patient admissions
10. `opd` - Out-patient visits
11. `insurance_policies` - Insurance info
12. `insurance_claims` - Insurance claims
13. `tpa` - TPA information

All with proper relationships and indexes!

---

## 🌍 Deploy to Railway (5 Steps)

### 1. Add MySQL to Railway Project
- Go to Railway.app
- Click your project
- Click "New" → Select "MySQL"

### 2. Copy MySQL Connection String
- Click MySQL service
- Go to "Connect" tab
- Copy the **MySQL_URL**

### 3. Update Backend Environment
- Add variable `MYSQL_URL` with the copied URL
- OR set individual variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### 4. Push Code
```bash
git push origin main
```

### 5. Railway Deploys Automatically!
- Railway detects Node.js project
- Installs dependencies
- Runs `npm start`
- Database ready!

---

## 🧪 Test It Works

### Test 1: Health Check
```bash
curl http://localhost:5001/api/health
```

Response:
```json
{"status":"ok","database":"connected"}
```

### Test 2: Create Patient
```bash
curl -X POST http://localhost:5001/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"firstName":"John","lastName":"Doe","dateOfBirth":"1990-01-15","gender":"Male"}'
```

### Test 3: Get Patients
```bash
curl http://localhost:5001/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Documentation

**Complete guide in:** `hospital-backend/MYSQL_RAILWAY_SETUP.md`

Topics covered:
- ✅ Local MySQL setup
- ✅ Railway connection
- ✅ Environment variables
- ✅ Schema creation
- ✅ API endpoints
- ✅ Troubleshooting
- ✅ Deployment steps

---

## ✨ All Features Still Work

- ✅ Patient Management (CRUD)
- ✅ Billing (Create, Update, Delete)
- ✅ Appointments
- ✅ Lab Tests
- ✅ Staff Management
- ✅ Ward Management
- ✅ Insurance Management
- ✅ Reports
- ✅ Authentication
- ✅ All APIs

**Everything same, but with MySQL!**

---

## 🔄 Frontend Works the Same

No changes needed in frontend! Keep using:
```
http://localhost:3000
```

Backend automatically uses MySQL now.

---

## 🎯 Next Steps

1. **Setup MySQL locally** (if not done)
   ```bash
   npm run create-schema
   ```

2. **Start backend**
   ```bash
   npm start
   ```

3. **Test endpoints**
   ```bash
   curl http://localhost:5001/api/health
   ```

4. **Deploy to Railway** (when ready)
   - Push to GitHub
   - Railway auto-deploys

---

## ✅ Status

- ✅ MongoDB removed
- ✅ MySQL2 configured
- ✅ Schema creation script ready
- ✅ SQL models created
- ✅ Routes updated
- ✅ Railway support added
- ✅ Documentation complete
- ✅ Ready to use!

**Start now:** `npm run create-schema && npm start`

Made with ❤️ for your hospital!

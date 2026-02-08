# Quick Start Guide - Hospital Management Backend

Get the Hospital Management System backend up and running in 5 minutes!

## ⚡ Quick Start (Local Development)

### 1. Prerequisites Check
```bash
node --version   # Should be v14 or higher
npm --version    # Should be v6 or higher
mongod --version # Should be installed
```

### 2. Install & Setup (Copy-Paste)
```bash
# Navigate to backend folder
cd hospital-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

✅ **Server is running at:** `http://localhost:5000`

---

## 🧪 Test the API

### Option 1: Using Terminal (cURL)

```bash
# 1. Check server health
curl http://localhost:5000/api/health

# 2. Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "fullName": "John Doe",
    "phone": "9876543210",
    "role": "DOCTOR"
  }'

# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'

# Save the token from response and use it:
export TOKEN="your_token_here"

# 4. Get patients
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer $TOKEN"
```

### Option 2: Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import collection: `hospital-backend.postman_collection.json`
3. Set `token` variable in Postman environment
4. Start making requests

### Option 3: Using VS Code Rest Client

Create file `test.http`:
```http
### Health Check
GET http://localhost:5000/api/health

### Register User
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123",
  "fullName": "John Doe",
  "phone": "9876543210",
  "role": "DOCTOR"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123"
}

### Get Patients
GET http://localhost:5000/api/patients
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🗄️ Setup with Sample Data

### 1. Start MongoDB
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas (cloud), connection is automatic via .env
```

### 2. Seed Database with Sample Data
```bash
npm run seed
```

Output:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
✅ Admin user created: admin@hospital.com
✅ Doctor users created: 3
✅ Staff users created: 3
✅ Patients created: 3
✅ Wards created: 4
✅ TPAs created: 3
✅ Insurance Policies created: 3

Test Credentials:
Admin:     admin@hospital.com / Admin@123
Doctor:    doctor1@hospital.com / Doctor@123
```

### 3. Login with Sample Credentials
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "Admin@123"
  }'
```

---

## 📝 Environment Configuration

Create `.env` file with these variables:

### Minimal Setup (Local)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hospital_management

# JWT
JWT_SECRET=your_super_secret_key_min_32_characters_long_please
JWT_REFRESH_SECRET=your_refresh_token_secret_also_32_chars
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Full Production Setup
See `.env.example` for all available options

---

## 🚀 Common Commands

```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Seed database
npm run seed

# Run tests
npm test

# View logs
tail -f logs/requests.log
tail -f logs/errors.log

# PM2 Management
pm2 start server.js --name "hospital-backend"
pm2 stop hospital-backend
pm2 restart hospital-backend
pm2 logs hospital-backend
```

---

## 📚 API Endpoints Quick Reference

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - List all doctors
- `POST /api/doctors` - Register new doctor

### Appointments
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create appointment

### Billing
- `GET /api/billing` - List all bills
- `POST /api/billing` - Create bill

### Reports
- `GET /api/reports/stats/overview` - Dashboard stats
- `GET /api/reports/reports/revenue` - Revenue report
- `GET /api/reports/reports/appointments` - Appointment stats

---

## 🔗 Connect Frontend to Backend

In your React app, update API calls to use the backend:

```javascript
// services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  });

  return response.json();
};

// Usage
const patients = await apiCall('/patients');
const newPatient = await apiCall('/patients', {
  method: 'POST',
  body: JSON.stringify({ firstName: 'John', lastName: 'Doe' })
});
```

---

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### MongoDB connection error
```bash
# Check MongoDB is running
mongod

# Or verify Atlas connection string in .env
# Format: mongodb+srv://username:password@cluster.mongodb.net/database
```

### JWT token errors
- Make sure `Authorization: Bearer <token>` header is included
- Check token hasn't expired
- Verify JWT_SECRET matches between auth and verification

### CORS errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Ensure frontend is using the correct backend URL

---

## 📞 Support Resources

- API Documentation: See `README.md`
- Deployment Guide: See `DEPLOYMENT.md`
- Database Models: See `models/` directory
- Route Files: See `routes/` directory

---

## ✨ Next Steps

1. ✅ Backend is running
2. 📱 Connect your frontend
3. 🗄️ Setup MongoDB (Atlas or local)
4. 🔐 Configure JWT secrets
5. 📧 Add email notifications (optional)
6. 💳 Integrate payment gateway (Razorpay)
7. 🚀 Deploy to production

---

**Happy Coding! 🎉**

For detailed information, check the full [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)

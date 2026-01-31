# Hospital Management System - Backend API

A production-ready Node.js/Express backend for the Hospital Management System with MongoDB database integration, JWT authentication, and comprehensive healthcare management features.

## 📋 Overview

This backend API provides RESTful endpoints for:
- **Patient Management** - Patient registration and medical records
- **Appointment Scheduling** - OPD and IPD appointment management
- **Billing & Payments** - Billing generation and payment tracking
- **Laboratory** - Lab tests and results management
- **Insurance & TPA** - Insurance policies, claims, and third-party administrator management
- **Staff Management** - Doctor, nurse, and staff administration
- **Ward Management** - Ward and bed availability tracking
- **Reports & Analytics** - Revenue reports and performance metrics

## 🛠️ Technology Stack

- **Runtime:** Node.js (v14+)
- **Framework:** Express.js (v4.18.0)
- **Database:** MongoDB with Mongoose ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet.js, CORS
- **Logging:** Custom request logging
- **Password Hashing:** bcryptjs

## 📦 Installation

### Prerequisites
- Node.js v14 or higher
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Steps

1. **Clone the repository and navigate to backend folder:**
```bash
cd hospital-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file from template:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
Edit `.env` and set the following:
```
# Database
MONGODB_URI=mongodb://localhost:27017/hospital_management

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_token_secret_min_32_chars
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

5. **Start the server:**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

6. **Verify the server is running:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "database": "connected"
}
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "fullName": "John Doe",
  "phone": "9876543210",
  "role": "DOCTOR"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer <token>
```

#### Refresh Token
```
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>
```

### Patient Endpoints

#### Get All Patients
```
GET /patients
Authorization: Bearer <token>
```

#### Get Patient by ID
```
GET /patients/:id
Authorization: Bearer <token>
```

#### Create Patient
```
POST /patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "bloodGroup": "O+",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001"
}
```

#### Update Patient
```
PUT /patients/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Patient
```
DELETE /patients/:id
Authorization: Bearer <token>
```

### Appointment Endpoints

#### Get All Appointments
```
GET /appointments
Authorization: Bearer <token>
```

#### Create Appointment
```
POST /appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient_mongo_id",
  "doctorId": "doctor_mongo_id",
  "appointmentDate": "2024-01-20",
  "appointmentTime": "14:30",
  "reason": "Consultation",
  "type": "OPD"
}
```

### Billing Endpoints

#### Get All Bills
```
GET /billing
Authorization: Bearer <token>
```

#### Create Bill
```
POST /billing
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient_mongo_id",
  "appointmentId": "appointment_mongo_id",
  "services": [
    { "name": "Consultation", "amount": 500 },
    { "name": "Lab Tests", "amount": 1000 }
  ],
  "totalAmount": 1500,
  "paymentMethod": "CARD"
}
```

### Doctor Endpoints

#### Get All Doctors
```
GET /doctors
Authorization: Bearer <token>
```

#### Create Doctor
```
POST /doctors
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "secure_password",
  "fullName": "Dr. Smith",
  "phone": "9876543210",
  "specialization": "Cardiology",
  "licenseNumber": "DL12345",
  "experience": 10
}
```

### Laboratory Endpoints

#### Get All Lab Tests
```
GET /laboratory
Authorization: Bearer <token>
```

#### Create Lab Test
```
POST /laboratory
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient_mongo_id",
  "testName": "Blood Test",
  "testType": "Pathology",
  "status": "PENDING"
}
```

### OPD Endpoints

#### Get All OPD Appointments
```
GET /opd
Authorization: Bearer <token>
```

### IPD Endpoints

#### Get All IPD Records
```
GET /ipd
Authorization: Bearer <token>
```

### Ward Endpoints

#### Get All Wards
```
GET /wards
Authorization: Bearer <token>
```

### Insurance & TPA

#### Get All Insurance Policies
```
GET /insurance-policies
Authorization: Bearer <token>
```

#### Get All Insurance Claims
```
GET /insurance-claims
Authorization: Bearer <token>
```

#### Get All TPAs
```
GET /tpa
Authorization: Bearer <token>
```

### Reports

#### Get Dashboard Statistics
```
GET /reports/stats/overview
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalPatients": 150,
    "totalAppointments": 450,
    "totalBillings": 200,
    "totalRevenue": 450000
  }
}
```

#### Get Revenue Report
```
GET /reports/reports/revenue
Authorization: Bearer <token>
```

#### Get Appointment Statistics
```
GET /reports/reports/appointments
Authorization: Bearer <token>
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### User Roles

The system supports multiple roles with different permissions:

- **ADMIN** - Full system access, user management
- **DOCTOR** - Appointment and prescription management
- **ACCOUNTANT** - Billing and payment processing
- **NURSE** - Patient care and vital monitoring
- **TECHNICIAN** - Laboratory test management
- **RECEPTIONIST** - Appointment scheduling

## 📊 Database Models

### User
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  phone: String,
  role: String (ADMIN, DOCTOR, ACCOUNTANT, etc.),
  department: String,
  isActive: Boolean,
  lastLogin: Date,
  loginHistory: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Patient
```javascript
{
  patientId: String (auto-generated: P00001),
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: String,
  bloodGroup: String,
  allergies: Array,
  currentMedications: Array,
  medicalHistory: Array,
  insurance: {
    insurancePolicyId: ObjectId,
    policyNumber: String,
    insuranceCompany: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment
```javascript
{
  appointmentId: String,
  patientId: ObjectId,
  doctorId: ObjectId,
  appointmentDate: Date,
  appointmentTime: String,
  type: String (OPD, IPD),
  reason: String,
  status: String (SCHEDULED, COMPLETED, CANCELLED),
  notes: String,
  isReminderSent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Billing
```javascript
{
  billId: String (auto-generated: BILL000001),
  patientId: ObjectId,
  appointmentId: ObjectId,
  services: Array,
  totalAmount: Number,
  insuranceAmount: Number,
  patientAmount: Number,
  paymentMethod: String (CASH, CARD, UPI),
  paymentStatus: String (PENDING, PAID),
  razorpayOrderId: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

To test the API, you can use:

### Using Postman
1. Import the API collection from `postman-collection.json`
2. Set the authorization token in the request headers
3. Execute requests

### Using cURL
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","fullName":"John Doe"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Get patients (requires token)
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Error Handling

All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": {
    "code": "ERR_CODE",
    "details": []
  }
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## 🚀 Deployment

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t hospital-backend .
docker run -p 5000:5000 --env-file .env hospital-backend
```

### Cloud Deployment (Heroku)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create hospital-backend-app

# Set environment variables
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your_secret"

# Deploy
git push heroku main
```

## 📝 Logging

Request logs are automatically generated in the `logs/` directory:
- `logs/requests.log` - All HTTP requests
- `logs/errors.log` - Error logs

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### JWT Errors
- Ensure token is included in Authorization header
- Check if token has expired
- Verify JWT_SECRET is correctly set

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process: `lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9`

## 📞 Support

For issues or questions, please create an issue in the repository or contact the development team.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Express.js community
- MongoDB documentation
- Security best practices from OWASP

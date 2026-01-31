# Hospital Management System - Complete API Reference

Comprehensive API documentation with cURL examples for all 50+ endpoints.

---

## 🔑 Authentication

All protected endpoints require this header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 AUTH ENDPOINTS

### 1. Register User
Register a new user in the system.

**Endpoint:**
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@hospital.com",
  "password": "SecurePass@123",
  "fullName": "Dr. John Doe",
  "phone": "9876543210",
  "role": "DOCTOR"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "Doctor@123",
    "fullName": "Dr. Smith",
    "phone": "9876543210",
    "role": "DOCTOR"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "doctor@hospital.com",
    "fullName": "Dr. Smith",
    "role": "DOCTOR"
  }
}
```

---

### 2. Login
Authenticate user and get JWT token.

**Endpoint:**
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@hospital.com",
  "password": "SecurePass@123"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "Doctor@123"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "doctor@hospital.com",
    "fullName": "Dr. Smith",
    "role": "DOCTOR"
  }
}
```

---

### 3. Get Current User
Get authenticated user's profile.

**Endpoint:**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "doctor@hospital.com",
    "fullName": "Dr. Smith",
    "role": "DOCTOR",
    "phone": "9876543210"
  }
}
```

---

### 4. Refresh Token
Get a new access token using refresh token.

**Endpoint:**
```http
POST /api/auth/refresh-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Logout
Logout user session.

**Endpoint:**
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👥 PATIENT ENDPOINTS

### 1. Get All Patients
Retrieve list of all patients.

**Endpoint:**
```http
GET /api/patients
Authorization: Bearer <token>
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "patientId": "P00001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "bloodGroup": "O+",
      "gender": "Male",
      "dateOfBirth": "1990-01-15",
      "address": "123 Main St",
      "city": "Mumbai",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Patient by ID
Retrieve specific patient details.

**Endpoint:**
```http
GET /api/patients/:id
Authorization: Bearer <token>
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/patients/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "patientId": "P00001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "bloodGroup": "O+",
    "gender": "Male",
    "dateOfBirth": "1990-01-15",
    "allergies": ["Penicillin"],
    "currentMedications": ["Aspirin"],
    "medicalHistory": ["Hypertension"],
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  }
}
```

---

### 3. Create Patient
Register a new patient.

**Endpoint:**
```http
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "bloodGroup": "O+",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "allergies": ["Penicillin"],
  "currentMedications": ["Aspirin"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "9876543211",
    "dateOfBirth": "1985-05-20",
    "gender": "Female",
    "bloodGroup": "AB+",
    "address": "456 Oak Ave",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "patientId": "P00002",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com"
  }
}
```

---

### 4. Update Patient
Modify patient information.

**Endpoint:**
```http
PUT /api/patients/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "9999999999",
  "address": "789 Pine Rd"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/patients/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999",
    "address": "New Address"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": { ... }
}
```

---

### 5. Delete Patient
Remove patient record.

**Endpoint:**
```http
DELETE /api/patients/:id
Authorization: Bearer <token>
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/patients/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

---

## 🏥 APPOINTMENT ENDPOINTS

### 1. Get All Appointments
Retrieve all appointments.

**Endpoint:**
```http
GET /api/appointments
Authorization: Bearer <token>
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 2. Create Appointment
Schedule new appointment.

**Endpoint:**
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": "507f1f77bcf86cd799439012",
  "doctorId": "507f1f77bcf86cd799439014",
  "appointmentDate": "2024-02-15",
  "appointmentTime": "14:30",
  "reason": "Routine Checkup",
  "type": "OPD"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "507f1f77bcf86cd799439012",
    "doctorId": "507f1f77bcf86cd799439014",
    "appointmentDate": "2024-02-15",
    "appointmentTime": "14:30",
    "reason": "Checkup",
    "type": "OPD"
  }'
```

---

### 3. Update Appointment
Modify appointment details.

**Endpoint:**
```http
PUT /api/appointments/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentTime": "15:00",
  "status": "COMPLETED"
}
```

---

### 4. Delete Appointment
Cancel appointment.

**Endpoint:**
```http
DELETE /api/appointments/:id
Authorization: Bearer <token>
```

---

## 💰 BILLING ENDPOINTS

### 1. Get All Bills
Retrieve all bills.

**Endpoint:**
```http
GET /api/billing
Authorization: Bearer <token>
```

---

### 2. Create Bill
Generate new bill.

**Endpoint:**
```http
POST /api/billing
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": "507f1f77bcf86cd799439012",
  "appointmentId": "507f1f77bcf86cd799439015",
  "services": [
    {
      "name": "Consultation",
      "amount": 500
    },
    {
      "name": "Lab Tests",
      "amount": 1000
    }
  ],
  "totalAmount": 1500,
  "paymentMethod": "CARD"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/billing \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "507f1f77bcf86cd799439012",
    "services": [
      {"name": "Consultation", "amount": 500},
      {"name": "Tests", "amount": 1000}
    ],
    "totalAmount": 1500,
    "paymentMethod": "CARD"
  }'
```

---

## 👨‍⚕️ DOCTOR ENDPOINTS

### 1. Get All Doctors
Retrieve all doctors.

**Endpoint:**
```http
GET /api/doctors
Authorization: Bearer <token>
```

---

### 2. Create Doctor
Register new doctor.

**Endpoint:**
```http
POST /api/doctors
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "Doctor@123",
  "fullName": "Dr. Smith",
  "phone": "9876543210",
  "specialization": "Cardiology",
  "licenseNumber": "DL12345",
  "experience": 10
}
```

---

## 🔬 LABORATORY ENDPOINTS

### 1. Get All Lab Tests
Retrieve all lab tests.

**Endpoint:**
```http
GET /api/laboratory
Authorization: Bearer <token>
```

---

### 2. Create Lab Test
Register new lab test.

**Endpoint:**
```http
POST /api/laboratory
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": "507f1f77bcf86cd799439012",
  "testName": "Blood Test",
  "testType": "Pathology",
  "status": "PENDING"
}
```

---

## 🏨 IPD ENDPOINTS

### 1. Get All IPD Records
Retrieve all in-patient records.

**Endpoint:**
```http
GET /api/ipd
Authorization: Bearer <token>
```

---

### 2. Create IPD Record
Register new in-patient.

**Endpoint:**
```http
POST /api/ipd
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": "507f1f77bcf86cd799439012",
  "wardId": "507f1f77bcf86cd799439016",
  "doctorId": "507f1f77bcf86cd799439014",
  "admissionDate": "2024-01-15",
  "status": "ACTIVE"
}
```

---

## 🚪 OPD ENDPOINTS

### 1. Get All OPD Appointments
Retrieve all out-patient appointments.

**Endpoint:**
```http
GET /api/opd
Authorization: Bearer <token>
```

---

## 🛏️ WARD ENDPOINTS

### 1. Get All Wards
Retrieve all wards.

**Endpoint:**
```http
GET /api/wards
Authorization: Bearer <token>
```

---

### 2. Create Ward
Register new ward.

**Endpoint:**
```http
POST /api/wards
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "wardName": "ICU Ward",
  "wardType": "ICU",
  "totalBeds": 20,
  "availableBeds": 15,
  "charges": 5000
}
```

---

## 🏢 STAFF ENDPOINTS

### 1. Get All Staff
Retrieve all staff members.

**Endpoint:**
```http
GET /api/staff
Authorization: Bearer <token>
```

---

### 2. Create Staff Member
Register new staff member.

**Endpoint:**
```http
POST /api/staff
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "nurse@hospital.com",
  "password": "Nurse@123",
  "fullName": "Nurse Maria",
  "phone": "9876543210",
  "role": "NURSE"
}
```

---

## 🏥 TPA ENDPOINTS

### 1. Get All TPAs
Retrieve all third-party administrators.

**Endpoint:**
```http
GET /api/tpa
Authorization: Bearer <token>
```

---

### 2. Create TPA
Register new TPA.

**Endpoint:**
```http
POST /api/tpa
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tpaName": "Apollo Insurance",
  "tpaCode": "APL001",
  "contactPerson": "Mr. Sharma",
  "email": "contact@apolloinsurance.com",
  "phone": "9876543210",
  "address": "Apollo Building",
  "bankAccount": "123456789",
  "bankIFSC": "APOL0001"
}
```

---

## 📋 INSURANCE POLICY ENDPOINTS

### 1. Get All Insurance Policies
Retrieve all insurance policies.

**Endpoint:**
```http
GET /api/insurance-policies
Authorization: Bearer <token>
```

---

### 2. Create Insurance Policy
Register new policy.

**Endpoint:**
```http
POST /api/insurance-policies
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": "507f1f77bcf86cd799439012",
  "tpaId": "507f1f77bcf86cd799439017",
  "policyNumber": "POL001001",
  "insuranceCompany": "Apollo Insurance",
  "coverageAmount": 500000,
  "copayPercentage": 20,
  "deductible": 5000
}
```

---

## 📄 INSURANCE CLAIM ENDPOINTS

### 1. Get All Claims
Retrieve all insurance claims.

**Endpoint:**
```http
GET /api/insurance-claims
Authorization: Bearer <token>
```

---

### 2. Create Insurance Claim
File new claim.

**Endpoint:**
```http
POST /api/insurance-claims
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "insurancePolicyId": "507f1f77bcf86cd799439018",
  "billingId": "507f1f77bcf86cd799439019",
  "claimAmount": 1500,
  "status": "SUBMITTED"
}
```

---

## 📊 REPORTS ENDPOINTS

### 1. Get Dashboard Statistics
Retrieve key metrics.

**Endpoint:**
```http
GET /api/reports/stats/overview
Authorization: Bearer <token>
```

**Success Response:**
```json
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

---

### 2. Get Revenue Report
Get revenue statistics.

**Endpoint:**
```http
GET /api/reports/reports/revenue
Authorization: Bearer <token>
```

---

### 3. Get Appointment Statistics
Get appointment analytics.

**Endpoint:**
```http
GET /api/reports/reports/appointments
Authorization: Bearer <token>
```

---

### 4. Get Patient Statistics
Get patient demographics.

**Endpoint:**
```http
GET /api/reports/reports/patients
Authorization: Bearer <token>
```

---

## ⚠️ Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid input data",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["Email is required", "Password must be at least 8 characters"]
  }
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": {
    "code": "SERVER_ERROR"
  }
}
```

---

## 🔐 HTTP Status Codes

- `200` - OK (successful GET/PUT)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE)
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

**Complete API Reference for Hospital Management System**
**Version 1.0.0 | 2024**

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import laboratoryRoutes from './routes/laboratoryRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import wardRoutes from './routes/wardRoutes.js';
import tpaRoutes from './routes/tpaRoutes.js';
import insurancePolicyRoutes from './routes/insurancePolicyRoutes.js';
import insuranceClaimRoutes from './routes/insuranceClaimRoutes.js';
import opdRoutes from './routes/opdRoutes.js';
import ipdRoutes from './routes/ipdRoutes.js';
import ipdDetailsRoutes from './routes/ipdDetailsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Import Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============ MYSQL CONNECTION ============
let dbPool;

/**
 * Connect to MySQL with retries. Railway provides a single connection
 * URL via `MYSQL_URL`. We retry a few times before failing to avoid
 * transient deployment/network issues causing immediate crashes.
 */
const connectDB = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (process.env.MYSQL_URL) {
        dbPool = mysql.createPool(process.env.MYSQL_URL);
      } else {
        dbPool = mysql.createPool({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'hospital_management',
          port: process.env.DB_PORT || 3306,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
      }

      // Test the connection
      const connection = await dbPool.getConnection();
      await connection.ping();
      connection.release();

      console.log('🌍 MySQL Connected Successfully');
      return true;
    } catch (error) {
      console.error(`⚠️ MySQL Connection Error (attempt ${attempt}/${retries}):`, error.message);
      if (attempt < retries) {
        console.log(`Retrying MySQL connection in ${delayMs}ms...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        console.error('❌ All MySQL connection attempts failed.');
        // Do not exit here — return false so server can still start and serve non-DB routes.
        return false;
      }
    }
  }
  return false;
};

// Export pool for use in routes
export { dbPool };

// ============ SECURITY MIDDLEWARE ============
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Split FRONTEND_URL by comma and trim whitespace
    const allowedOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
      : ['http://localhost:3000'];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// ============ BODY PARSER MIDDLEWARE ============
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============ LOGGING MIDDLEWARE ============
app.use(logger);

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🏥 Hospital Management System Backend is Running',
    documentation: '/api-docs',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbPool ? 'connected' : 'disconnected'
  });
});

// ============ API ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/tpa', tpaRoutes);
app.use('/api/insurance/policies', insurancePolicyRoutes);
app.use('/api/insurance/claims', insuranceClaimRoutes);
app.use('/api/opd', opdRoutes);
app.use('/api/ipd', ipdRoutes);
app.use('/api/ipd-details', ipdDetailsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/insurance-claims', insuranceClaimRoutes);
app.use('/api/opd', opdRoutes);
// app.use('/api/ipd', ipdRoutes);
// app.use('/api/reports', reportsRoutes);

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// ============ ERROR HANDLING MIDDLEWARE ============
app.use(errorHandler);

// ============ CREATE DATABASE TABLES ============
const createTables = async () => {
  try {
    const connection = await dbPool.getConnection();

    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        dateOfBirth DATE,
        gender VARCHAR(10),
        bloodGroup VARCHAR(10),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zipCode VARCHAR(10),
        insuranceId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        specialization VARCHAR(100),
        phone VARCHAR(20),
        qualifications TEXT,
        yearsExperience INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patientId INT NOT NULL,
        doctorId INT NOT NULL,
        appointmentDate DATETIME NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        reason TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (doctorId) REFERENCES doctors(id)
      )`,
      `CREATE TABLE IF NOT EXISTS billing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patientId INT NOT NULL,
        amount DECIMAL(10, 2),
        description TEXT,
        paymentStatus VARCHAR(50) DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )`,
      `CREATE TABLE IF NOT EXISTS wards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        totalBeds INT,
        availableBeds INT,
        type VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS laboratory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patientId INT NOT NULL,
        testName VARCHAR(255),
        result TEXT,
        testDate DATE,
        status VARCHAR(50) DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )`,
      `CREATE TABLE IF NOT EXISTS opd_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patientName VARCHAR(255),
        patientId VARCHAR(100),
        visitDate DATE,
        department VARCHAR(100),
        doctorName VARCHAR(255),
        symptoms TEXT,
        diagnosis TEXT,
        treatment TEXT,
        consultationFee DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'Completed',
        vitals TEXT,
        notes TEXT,
        followUpDate DATE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS lab_tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        testName VARCHAR(255) NOT NULL,
        testCategory VARCHAR(100),
        price DECIMAL(10, 2),
        sampleType VARCHAR(100),
        normalRange VARCHAR(255),
        tat VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS lab_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reqId VARCHAR(50) UNIQUE,
        patientId INT NOT NULL,
        patientName VARCHAR(255),
        testName VARCHAR(255),
        sampleType VARCHAR(100),
        collectionDate DATETIME,
        status VARCHAR(50) DEFAULT 'Pending',
        priority VARCHAR(50) DEFAULT 'Normal',
        technicianName VARCHAR(255),
        testResult VARCHAR(255),
        remarks TEXT,
        signature VARCHAR(255),
        resultDate DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )`,
      `CREATE TABLE IF NOT EXISTS lab_bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        billNo VARCHAR(50) UNIQUE,
        billDate DATETIME,
        reqId VARCHAR(50),
        patientName VARCHAR(255),
        testName VARCHAR(255),
        price DECIMAL(10, 2),
        discount DECIMAL(10, 2),
        gst DECIMAL(10, 2),
        total DECIMAL(10, 2),
        paymentMode VARCHAR(50),
        status VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS insurance_policies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        policyId VARCHAR(50) UNIQUE,
        patientId INT NOT NULL,
        insuranceProvider VARCHAR(255),
        policyNumber VARCHAR(50),
        groupNumber VARCHAR(50),
        memberId VARCHAR(50),
        policyType VARCHAR(50),
        coverageAmount DECIMAL(15, 2),
        copay DECIMAL(10, 2),
        deductible DECIMAL(10, 2),
        startDate DATE,
        expiryDate DATE,
        status VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )`,
      `CREATE TABLE IF NOT EXISTS insurance_claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        claimNumber VARCHAR(50) UNIQUE,
        policyId INT NOT NULL,
        patientId INT NOT NULL,
        billId INT,
        claimAmount DECIMAL(15, 2),
        approvedAmount DECIMAL(15, 2),
        status VARCHAR(50),
        reason TEXT,
        notes TEXT,
        claimDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (policyId) REFERENCES insurance_policies(id),
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )`,
      `CREATE TABLE IF NOT EXISTS nursing_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ipdId INT NOT NULL,
        nurseName VARCHAR(255),
        note TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ipdId) REFERENCES ipd_admissions(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS doctor_rounds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ipdId INT NOT NULL,
        doctorName VARCHAR(255),
        observation TEXT,
        instruction TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ipdId) REFERENCES ipd_admissions(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS ipd_medications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ipdId INT NOT NULL,
        medicineName VARCHAR(255),
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        startDate DATE,
        endDate DATE,
        status VARCHAR(50) DEFAULT 'Active',
        FOREIGN KEY (ipdId) REFERENCES ipd_admissions(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS intake_output (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ipdId INT NOT NULL,
        date DATE,
        time TIME,
        type VARCHAR(50), 
        item VARCHAR(255),
        quantity VARCHAR(100),
        recordedBy VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ipdId) REFERENCES ipd_admissions(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS ot_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ipdId INT NOT NULL,
        procedureName VARCHAR(255),
        operatingSurgeon VARCHAR(255),
        otRoom VARCHAR(100),
        scheduledDate DATETIME,
        status VARCHAR(50) DEFAULT 'Scheduled',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ipdId) REFERENCES ipd_admissions(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        settingsData JSON NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_settings (userId)
      )`
    ];

    for (const table of tables) {
      await connection.query(table);
    }

    connection.release();
    console.log("✅ Database tables created/verified");
  } catch (error) {
    console.warn("⚠️ Table creation warning (may already exist):", error.message);
    // Don't exit — tables may already exist
  }
};

// ============ START SERVER ============
const startServer = async () => {
  try {
    // Connect to MySQL and create tables (if available)
    const dbConnected = await connectDB();
    if (dbConnected) {
      await createTables();
    } else {
      console.warn('⚠️ Starting server without database connection. DB routes will return errors until DB is available.');
    }

    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║        🏥 Hospital Management System Backend                ║
║                    Server Started Successfully              ║
╚════════════════════════════════════════════════════════════╝
      `);
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`💻 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`
🔑 Available Routes:
   /api/auth          - Authentication & Authorization
   /api/patients      - Patient Management
   /api/doctors       - Doctor Management
   /api/appointments  - Appointment Scheduling
   /api/opd           - Out-Patient Department
   /api/ipd           - In-Patient Department
   /api/billing       - Billing & Payments
   /api/laboratory    - Laboratory Tests
   /api/staff         - Staff Management
   /api/wards         - Ward Management
   /api/tpa           - TPA Management
   /api/reports       - Reports & Analytics
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;

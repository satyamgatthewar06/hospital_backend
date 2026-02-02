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
import opdRoutes from './routes/opdRoutes.js';
import ipdRoutes from './routes/ipdRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import laboratoryRoutes from './routes/laboratoryRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import wardRoutes from './routes/wardRoutes.js';
import tpaRoutes from './routes/tpaRoutes.js';
import insurancePolicyRoutes from './routes/insurancePolicyRoutes.js';
import insuranceClaimRoutes from './routes/insuranceClaimRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';

// Import Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============ MYSQL CONNECTION ============
let dbPool;

const connectDB = async () => {
  try {
    // Railway (and other platforms) provide a single connection URL via an env var
    // e.g. set MYSQL_URL=${{ MySQL.MYSQL_URL }} in Railway. mysql2 accepts a
    // connection string as well as an options object.
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
    
    console.log("🌍 MySQL Connected Successfully");
  } catch (error) {
    console.error("⚠️ MySQL Connection Error:", error.message);
    process.exit(1);
  }
};

// Export pool for use in routes
export { dbPool };

// ============ SECURITY MIDDLEWARE ============
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// ============ BODY PARSER MIDDLEWARE ============
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============ LOGGING MIDDLEWARE ============
app.use(logger);

// ============ HEALTH CHECK ============
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
app.use('/api/opd', opdRoutes);
app.use('/api/ipd', ipdRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/tpa', tpaRoutes);
app.use('/api/insurance-policies', insurancePolicyRoutes);
app.use('/api/insurance-claims', insuranceClaimRoutes);
app.use('/api/reports', reportsRoutes);

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
    // Connect to MySQL and create tables
    await connectDB();
    await createTables();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
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

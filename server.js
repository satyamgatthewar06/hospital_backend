import express from 'express';
import mongoose from 'mongoose';
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

// ============ MONGODB CONNECTION ============
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.db.name}`);
  } catch (error) {
    console.error('⚠️  MongoDB Connection Error:', error.message);
    console.log('📌 Running in DEMO MODE (without database)');
    console.log('💡 To use database: Ensure MongoDB is running on port 27017');
  }
};

connectDB();

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
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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

// ============ START SERVER ============
const startServer = async () => {
  try {
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

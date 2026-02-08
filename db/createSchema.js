import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createSchema = async () => {
  let pool;
  let connection;
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD, // let default to undefined so logic below handles it
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
    };

    // Default password to root if not provided in env, for local dev
    if (config.password === undefined) {
      config.password = 'root';
    }

    // Checking MYSQL_URL
    if (process.env.MYSQL_URL && process.env.MYSQL_URL.trim().length > 0) {
      console.log('Connecting via MYSQL_URL...');
      pool = mysql.createPool(process.env.MYSQL_URL);
    } else {
      console.log('Connecting via config...');
      pool = mysql.createPool(config);
    }

    connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Server');

    const dbName = process.env.DB_NAME || 'hospital_management';

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' verified`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // ================== TABLE DEFINITIONS ==================
    // 1. Users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'doctor', 'nurse', 'patient', 'staff') DEFAULT 'patient',
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table');

    // 2. Patients
    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT UNIQUE,
        patientId VARCHAR(50) UNIQUE NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        dateOfBirth DATE NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        bloodType VARCHAR(10),
        phone VARCHAR(20),
        email VARCHAR(100),
        street VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        zipCode VARCHAR(20),
        country VARCHAR(100),
        emergencyContactName VARCHAR(100),
        emergencyContactRelation VARCHAR(50),
        emergencyContactPhone VARCHAR(20),
        medicalHistory LONGTEXT,
        allergies LONGTEXT,
        medications LONGTEXT,
        chronicDiseases LONGTEXT,
        surgicalHistory LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Patients table');

    // 3. Doctors
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT UNIQUE,
        doctorId VARCHAR(50) UNIQUE NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        specialization VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        licenseNumber VARCHAR(50),
        department VARCHAR(100),
        yearsOfExperience INT,
        qualifications LONGTEXT,
        availabilityStatus ENUM('available', 'busy', 'on-leave') DEFAULT 'available',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Doctors table');

    // 4. Appointments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        appointmentNumber VARCHAR(50) UNIQUE NOT NULL,
        patientId INT NOT NULL,
        doctorId INT NOT NULL,
        appointmentDate DATETIME NOT NULL,
        appointmentType VARCHAR(100),
        reason VARCHAR(500),
        status ENUM('scheduled', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
        notes LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Appointments table');

    // 5. Billing
    await connection.query(`
      CREATE TABLE IF NOT EXISTS billing (
        id INT PRIMARY KEY AUTO_INCREMENT,
        billNumber VARCHAR(50) UNIQUE NOT NULL,
        patientId INT NOT NULL,
        billDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        dueDate DATE,
        items LONGTEXT NOT NULL,
        subtotal DECIMAL(10, 2) DEFAULT 0,
        taxes DECIMAL(10, 2) DEFAULT 0,
        discount DECIMAL(10, 2) DEFAULT 0,
        totalAmount DECIMAL(10, 2) DEFAULT 0,
        amountPaid DECIMAL(10, 2) DEFAULT 0,
        status ENUM('pending', 'paid', 'partial', 'cancelled') DEFAULT 'pending',
        paymentMethod VARCHAR(100),
        notes LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX (billNumber),
        INDEX (patientId),
        INDEX (status)
      )
    `);
    console.log('✅ Billing table');

    // 6. Laboratory
    await connection.query(`
      CREATE TABLE IF NOT EXISTS laboratory (
        id INT PRIMARY KEY AUTO_INCREMENT,
        testId VARCHAR(50) UNIQUE NOT NULL,
        patientId INT NOT NULL,
        doctorId INT,
        testName VARCHAR(200) NOT NULL,
        testCategory VARCHAR(100),
        testDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        sampleCollectionDate DATE,
        reportDate DATE,
        testResults LONGTEXT,
        referenceRange VARCHAR(500),
        status ENUM('pending', 'in-progress', 'completed', 'cancelled') DEFAULT 'pending',
        normalRange VARCHAR(255),
        normalValue VARCHAR(255),
        abnormalFlag BOOLEAN DEFAULT false,
        comments LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Laboratory table');

    // 7. Staff
    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT PRIMARY KEY AUTO_INCREMENT,
        staffId VARCHAR(50) UNIQUE NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        department VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        shiftTiming VARCHAR(100),
        qualifications LONGTEXT,
        joiningDate DATE,
        status ENUM('active', 'inactive', 'on-leave') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (staffId),
        INDEX (department)
      )
    `);
    console.log('✅ Staff table');

    // 8. Wards
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wardId VARCHAR(50) UNIQUE NOT NULL,
        wardName VARCHAR(100) NOT NULL,
        wardType VARCHAR(100),
        totalBeds INT,
        occupiedBeds INT DEFAULT 0,
        availableBeds INT,
        floorNumber INT,
        facilities LONGTEXT,
        status ENUM('active', 'maintenance', 'closed') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (wardId)
      )
    `);
    console.log('✅ Wards table');

    // 9. IPD
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ipd (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admissionNumber VARCHAR(50) UNIQUE NOT NULL,
        patientId INT NOT NULL,
        doctorId INT,
        wardId INT,
        bedNumber VARCHAR(20),
        admissionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        estimatedDischargeDate DATE,
        actualDischargeDate DATE,
        admissionReason LONGTEXT,
        diagnosis LONGTEXT,
        treatment LONGTEXT,
        status ENUM('admitted', 'discharged', 'transferred') DEFAULT 'admitted',
        notes LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE SET NULL,
        FOREIGN KEY (wardId) REFERENCES wards(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ IPD table');

    // 10. OPD
    await connection.query(`
      CREATE TABLE IF NOT EXISTS opd (
        id INT PRIMARY KEY AUTO_INCREMENT,
        opdTicketNumber VARCHAR(50) UNIQUE NOT NULL,
        patientId INT NOT NULL,
        doctorId INT,
        visitDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        consultationFee DECIMAL(10, 2),
        complaint LONGTEXT,
        diagnosis LONGTEXT,
        treatment LONGTEXT,
        prescriptions LONGTEXT,
        followUpDate DATE,
        notes LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ OPD table');

    // 11. Insurance Policies
    await connection.query(`
      CREATE TABLE IF NOT EXISTS insurance_policies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        policyId VARCHAR(50) UNIQUE NOT NULL,
        patientId INT NOT NULL,
        insuranceProvider VARCHAR(200),
        policyNumber VARCHAR(100),
        groupNumber VARCHAR(100),
        memberId VARCHAR(100),
        policyType VARCHAR(100),
        coverageAmount DECIMAL(12, 2),
        copay DECIMAL(10, 2),
        deductible DECIMAL(10, 2),
        startDate DATE,
        expiryDate DATE,
        isPrimary BOOLEAN DEFAULT true,
        status ENUM('active', 'expired', 'suspended') DEFAULT 'active',
        documentUrl VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Insurance Policies table');

    // 12. Insurance Claims
    await connection.query(`
      CREATE TABLE IF NOT EXISTS insurance_claims (
        id INT PRIMARY KEY AUTO_INCREMENT,
        claimNumber VARCHAR(50) UNIQUE NOT NULL,
        policyId INT NOT NULL,
        patientId INT NOT NULL,
        billId INT NOT NULL,
        claimDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        claimAmount DECIMAL(12, 2),
        approvedAmount DECIMAL(12, 2),
        status ENUM('submitted', 'approved', 'rejected', 'processing') DEFAULT 'submitted',
        reason VARCHAR(500),
        notes LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (policyId) REFERENCES insurance_policies(id) ON DELETE CASCADE,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (billId) REFERENCES billing(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Insurance Claims table');

    // 13. TPA
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tpa (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tpaId VARCHAR(50) UNIQUE NOT NULL,
        tpaName VARCHAR(200) NOT NULL,
        contactPerson VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        address LONGTEXT,
        networkHospitals LONGTEXT,
        claimProcessingTime INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ TPA table');

    console.log('\n✅ All tables verified/created!');

    await connection.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
    if (pool) await pool.end();
    process.exit(1);
  }
};

createSchema();

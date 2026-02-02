import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createSchema = async () => {
  let connection;
  try {
    // Connect to MySQL server (without specifying database)
    if (process.env.MYSQL_URL) {
      connection = await mysql.createConnection(process.env.MYSQL_URL);
    } else {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306,
      });
    }

    const dbName = process.env.DB_NAME || 'hospital_management';

    // Create database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' ready`);

    // Use the database
    await connection.execute(`USE ${dbName}`);
    console.log(`✅ Using database '${dbName}'`);

    // Create Users table
    await connection.execute(`
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
    console.log('✅ Users table created');

    // Create Patients table
    await connection.execute(`
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
    console.log('✅ Patients table created');

    // Create Doctors table
    await connection.execute(`
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
    console.log('✅ Doctors table created');

    // Create Appointments table
    await connection.execute(`
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
    console.log('✅ Appointments table created');

    // Create Billing table
    await connection.execute(`
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
    console.log('✅ Billing table created');

    // Create Laboratory table
    await connection.execute(`
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
    console.log('✅ Laboratory table created');

    // Create Staff table
    await connection.execute(`
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
    console.log('✅ Staff table created');

    // Create Wards table
    await connection.execute(`
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
    console.log('✅ Wards table created');

    // Create IPD (In-Patient Department) table
    await connection.execute(`
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
    console.log('✅ IPD table created');

    // Create OPD (Out-Patient Department) table
    await connection.execute(`
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
    console.log('✅ OPD table created');

    // Create Insurance Policy table
    await connection.execute(`
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
    console.log('✅ Insurance Policies table created');

    // Create Insurance Claims table
    await connection.execute(`
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
    console.log('✅ Insurance Claims table created');

    // Create TPA (Third Party Administrator) table
    await connection.execute(`
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
    console.log('✅ TPA table created');

    console.log('\n✅ All tables created successfully!');
    console.log(`\n📊 Database Schema Summary:`);
    console.log(`   - Users`);
    console.log(`   - Patients`);
    console.log(`   - Doctors`);
    console.log(`   - Appointments`);
    console.log(`   - Billing`);
    console.log(`   - Laboratory`);
    console.log(`   - Staff`);
    console.log(`   - Wards`);
    console.log(`   - IPD (In-Patient)`);
    console.log(`   - OPD (Out-Patient)`);
    console.log(`   - Insurance Policies`);
    console.log(`   - Insurance Claims`);
    console.log(`   - TPA`);
    console.log(`\n✅ Ready to use!`);

    await connection.end();
  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
    process.exit(1);
  }
};

createSchema();

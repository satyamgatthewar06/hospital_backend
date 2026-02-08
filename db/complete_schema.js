import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const completeSchema = async () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
        };

        console.log('Connecting to complete schema...');
        const pool = mysql.createPool(config);
        const connection = await pool.getConnection();
        console.log('✅ Connected!');

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

        await connection.release();
        await pool.end();
        console.log('🎉 All missing tables created successfully!');

    } catch (error) {
        console.error('❌ Error creating missing tables:', error.message);
    }
};

completeSchema();

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const fixRemainingTables = async () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
        };

        const pool = mysql.createPool(config);
        const connection = await pool.getConnection();

        console.log('Disabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Drop tables
        console.log('Dropping remaining tables...');
        await connection.query('DROP TABLE IF EXISTS staff');
        await connection.query('DROP TABLE IF EXISTS wards');
        await connection.query('DROP TABLE IF EXISTS tpa');
        await connection.query('DROP TABLE IF EXISTS insurance_claims'); // Drop claims before policies
        await connection.query('DROP TABLE IF EXISTS insurance_policies');

        // Create staff table
        console.log('Creating staff table...');
        await connection.query(`
            CREATE TABLE staff (
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

        // Create wards table
        console.log('Creating wards table...');
        await connection.query(`
            CREATE TABLE wards (
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

        // Create insurance policies table
        console.log('Creating insurance_policies table...');
        await connection.query(`
            CREATE TABLE insurance_policies (
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

        // Create insurance claims table
        console.log('Creating insurance_claims table...');
        await connection.query(`
            CREATE TABLE insurance_claims (
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

        // Create TPA table
        console.log('Creating tpa table...');
        await connection.query(`
            CREATE TABLE tpa (
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

        console.log('Re-enabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ All remaining tables recreated successfully!');

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

fixRemainingTables();

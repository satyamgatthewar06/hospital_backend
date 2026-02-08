import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const fixAllTables = async () => {
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

        // Drop all tables
        console.log('Dropping old tables...');
        await connection.query('DROP TABLE IF EXISTS doctors');
        await connection.query('DROP TABLE IF EXISTS appointments');
        await connection.query('DROP TABLE IF EXISTS billing');
        await connection.query('DROP TABLE IF EXISTS laboratory');

        // Create doctors table
        console.log('Creating doctors table...');
        await connection.query(`
            CREATE TABLE doctors (
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

        // Create appointments table
        console.log('Creating appointments table...');
        await connection.query(`
            CREATE TABLE appointments (
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

        // Create billing table
        console.log('Creating billing table...');
        await connection.query(`
            CREATE TABLE billing (
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

        // Create laboratory table
        console.log('Creating laboratory table...');
        await connection.query(`
            CREATE TABLE laboratory (
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
                interpretation VARCHAR(500),
                performedBy VARCHAR(200),
                verifiedBy VARCHAR(200),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
                FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE SET NULL,
                INDEX (testId),
                INDEX (patientId),
                INDEX (status)
            )
        `);

        console.log('Re-enabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ All tables recreated successfully!');

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

fixAllTables();

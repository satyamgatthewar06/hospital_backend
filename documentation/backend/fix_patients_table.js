import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const fixPatientsTable = async () => {
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

        console.log('Dropping old patients table...');
        await connection.query('DROP TABLE IF EXISTS patients');

        console.log('Creating new patients table with correct schema...');
        await connection.query(`
            CREATE TABLE patients (
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

        console.log('Re-enabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Patients table recreated successfully!');

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
};

fixPatientsTable();

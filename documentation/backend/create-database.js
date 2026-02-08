import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
  let connection;
  try {
    // Connect to MySQL. If running on Railway (or similar) you can set
    // MYSQL_URL=${{ MySQL.MYSQL_URL }} and we will use that connection string.
    if (process.env.MYSQL_URL) {
      connection = await mysql.createConnection(process.env.MYSQL_URL);
    } else {
      // Connect to MySQL without specifying a database
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306,
      });
    }

    console.log('✅ Connected to MySQL');

    // Create database
    const dbName = process.env.DB_NAME || 'hospital_management';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created/exists`);

    // Switch to the new database
    await connection.query(`USE ${dbName}`);

    // Create tables
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

    console.log('✅ All tables created successfully');
    console.log(`
╔════════════════════════════════════════════════════════════╗
║           Database Setup Complete! ✅                      ║
╚════════════════════════════════════════════════════════════╝

Database: ${dbName}
Tables created:
  - users
  - patients
  - doctors
  - appointments
  - billing
  - wards
  - laboratory

You can now run: npm run dev
    `);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createDatabase();

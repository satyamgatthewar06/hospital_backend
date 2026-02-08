import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const updateSchema = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(process.env.MYSQL_URL || {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hospital_management'
        });

        console.log('Connected. Creating new IPD tables...');

        const queries = [
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
        type VARCHAR(50), -- Intake or Output
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
      )`
        ];

        for (const query of queries) {
            await connection.query(query);
            console.log('✅ Executed table creation query.');
        }

        console.log('🎉 IPD Schema update complete!');

    } catch (error) {
        console.error('❌ Error updating schema:', error);
    } finally {
        if (connection) await connection.end();
    }
};

updateSchema();

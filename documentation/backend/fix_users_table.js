import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const fixDB = async () => {
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

        console.log('Dropping old users table...');
        await connection.query('DROP TABLE IF EXISTS users');

        console.log('Creating new users table with correct schema...');
        await connection.query(`
            CREATE TABLE users (
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

        console.log('✅ Users table recreated with username column!');

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
};

fixDB();

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createDoctor = async () => {
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

        // Hash password
        const hashedPassword = await bcrypt.hash('Doctor@123', 10);

        // Insert doctor user
        await connection.query(
            'INSERT INTO users (username, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)',
            ['doctor1', 'doctor1@hospital.com', hashedPassword, 'doctor', true]
        );

        console.log('✅ Doctor user created successfully!');
        console.log('   Email: doctor1@hospital.com');
        console.log('   Password: Doctor@123');

        connection.release();
        await pool.end();
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('ℹ️  Doctor user already exists');
        } else {
            console.error('Error:', error.message);
        }
    }
};

createDoctor();

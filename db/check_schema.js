import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const checkSchema = async () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '', // default to empty to match server.js if needed, but env should override
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
        };

        // Add password from env if set (safeguard)
        if (process.env.DB_PASSWORD) {
            config.password = process.env.DB_PASSWORD;
        }

        console.log('Connecting to verify schema...');

        // Use createPool like server.js
        const pool = mysql.createPool(config);
        const connection = await pool.getConnection();

        console.log('✅ Connected!');

        const [rows] = await connection.query('SHOW TABLES');
        console.log('Tables in database:', rows.map(r => Object.values(r)[0]));

        await connection.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Error checking schema:', error.message);
    }
};

checkSchema();

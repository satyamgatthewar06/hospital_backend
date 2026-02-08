
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const checkLabSchema = async () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
        };

        const pool = mysql.createPool(config);
        const connection = await pool.getConnection();

        const table = 'lab_requests';
        console.log(`\n=== ${table.toUpperCase()} TABLE ===`);
        try {
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            columns.forEach(col => {
                console.log(`- ${col.Field} (${col.Type})`);
            });
        } catch (err) {
            console.log(`❌ Table doesn't exist: ${err.message}`);
        }

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
};

checkLabSchema();

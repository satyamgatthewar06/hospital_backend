
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkSchema = async () => {
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

        console.log('\n=== WARDS columns ===');
        const [columns] = await connection.query(`SHOW COLUMNS FROM wards`);
        columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));

        connection.release();
        await pool.end();
    } catch (e) {
        console.error(e);
    }
};

checkSchema();

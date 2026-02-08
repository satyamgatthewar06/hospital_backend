import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkAllTables = async () => {
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

        const tables = ['users', 'patients', 'doctors', 'appointments', 'billing'];

        for (const table of tables) {
            console.log(`\n=== ${table.toUpperCase()} TABLE ===`);
            try {
                const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
                columns.forEach(col => {
                    console.log(`- ${col.Field} (${col.Type})`);
                });
            } catch (err) {
                console.log(`❌ Table doesn't exist: ${err.message}`);
            }
        }

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
};

checkAllTables();

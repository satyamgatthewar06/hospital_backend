
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkSchema = async () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '', // flexible
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
        };

        const pool = mysql.createPool(config);
        const connection = await pool.getConnection();

        console.log('\n=== LAB_BILLS columns ===');
        try {
            const [columns] = await connection.query(`SHOW COLUMNS FROM lab_bills`);
            columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
        } catch (e) {
            console.log('Table lab_bills does not exist yet.');
        }

        connection.release();
        await pool.end();
    } catch (e) {
        console.error(e);
    }
};

checkSchema();

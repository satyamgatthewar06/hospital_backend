import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const inspectUserTable = async () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
        };
        if (config.password === undefined) config.password = 'root';

        const pool = mysql.createPool(config);
        const connection = await pool.getConnection();

        const [rows] = await connection.query('DESCRIBE users');
        console.log('Users Table Schema:', rows);

        await connection.release();
        await pool.end();
    } catch (error) {
        console.error(error);
    }
};

inspectUserTable();

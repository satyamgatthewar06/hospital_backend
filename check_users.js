import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const listUsers = async () => {
    const connection = await mysql.createConnection(process.env.MYSQL_URL || {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hospital_management'
    });
    const [rows] = await connection.query('SELECT * FROM users'); // or admins?
    console.log(rows);
    await connection.end();
};
listUsers();

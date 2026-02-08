import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('MYSQL_URL value:', process.env.MYSQL_URL);
console.log('MYSQL_URL type:', typeof process.env.MYSQL_URL);

async function testConnection() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        port: process.env.DB_PORT || 3306,
    };

    console.log('Testing connection to:', { ...config, password: '***' });

    try {
        const connection = await mysql.createConnection(config);
        console.log('Successfully connected!');
        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error.code, error.message);
    }
}

testConnection();

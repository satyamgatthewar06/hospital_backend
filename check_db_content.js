import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkPatients = async () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
        };

        const pool = mysql.createPool(config);
        const [rows] = await pool.query('SELECT * FROM patients');

        console.log('Total patients:', rows.length);
        rows.forEach(p => {
            console.log(`ID: ${p.id}`);
            console.log(`  firstName: '${p.firstName}' (${typeof p.firstName})`);
            console.log(`  lastName: '${p.lastName}' (${typeof p.lastName})`);
            console.log(`  dob: '${p.dateOfBirth}'`);
            console.log('---');
        });

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkPatients();

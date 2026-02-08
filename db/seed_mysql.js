import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedMySQL = async () => {
    let pool;
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
        };

        if (config.password === undefined) config.password = 'root';

        console.log('Connecting to MySQL...');
        pool = mysql.createPool(config);
        const connection = await pool.getConnection();
        console.log('✅ Connected!');

        // Hash passwords
        const adminPass = await bcrypt.hash('Admin@123', 10);
        const doctorPass = await bcrypt.hash('Doctor@123', 10);
        const nursePass = await bcrypt.hash('Nurse@123', 10);

        // 1. Create Admin
        const [existingAdmin] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@hospital.com']);
        if (existingAdmin.length === 0) {
            await connection.query(
                'INSERT INTO users (username, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)',
                ['admin', 'admin@hospital.com', adminPass, 'admin', true]
            );
            console.log('✅ Admin user created: admin@hospital.com / Admin@123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // 2. Create Doctor
        const [existingDoctor] = await connection.query('SELECT * FROM users WHERE email = ?', ['doctor1@hospital.com']);
        let doctorUserId;
        if (existingDoctor.length === 0) {
            const [result] = await connection.query(
                'INSERT INTO users (username, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)',
                ['doctor1', 'doctor1@hospital.com', doctorPass, 'doctor', true]
            );
            doctorUserId = result.insertId;
            console.log('✅ Doctor user created: doctor1@hospital.com / Doctor@123');

            // Add detailed doctor profile
            await connection.query(
                'INSERT INTO doctors (userId, doctorId, firstName, lastName, specialization, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [doctorUserId, 'DOC001', 'Rajesh', 'Kumar', 'Cardiology', 'doctor1@hospital.com', '9876543211']
            );
        } else {
            console.log('ℹ️  Doctor user already exists');
        }

        await connection.release();
        await pool.end();
        console.log('\n✅ Seeding complete!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedMySQL();

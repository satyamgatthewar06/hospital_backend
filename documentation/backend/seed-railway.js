import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedRailway = async () => {
    try {
        const pool = mysql.createPool(process.env.MYSQL_URL);
        const connection = await pool.getConnection();
        console.log('✅ Connected to Railway MySQL');

        const dbName = 'hospital_management';
        await connection.query(`USE ${dbName}`);

        // Hash password
        const hashedPassword = await bcrypt.hash('Doctor@123', 10);

        // Create admin user
        await connection.query(
            `INSERT INTO users (username, email, password, role, isActive) 
       VALUES (?, ?, ?, ?, ?)`,
            ['doctor1', 'doctor1@hospital.com', hashedPassword, 'doctor', true]
        );
        console.log('✅ Created admin user: doctor1@hospital.com / Doctor@123');

        // Get the user ID
        const [userRows] = await connection.query('SELECT id FROM users WHERE email = ?', ['doctor1@hospital.com']);
        const userId = userRows[0].id;

        // Create doctor profile
        await connection.query(
            `INSERT INTO doctors (userId, doctorId, firstName, lastName, specialization, phone, email, department, yearsOfExperience, qualifications, availabilityStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, 'DOC001', 'Dr. John', 'Smith', 'Cardiology', '9876543210', 'doctor1@hospital.com', 'Cardiology', 10, JSON.stringify(['MBBS', 'MD']), 'available']
        );
        console.log('✅ Created doctor profile for Dr. John Smith');

        connection.release();
        await pool.end();
        console.log('\n✨ Seed completed! You can now log in with:');
        console.log('   Email: doctor1@hospital.com');
        console.log('   Password: Doctor@123');
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedRailway();

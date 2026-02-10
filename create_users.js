import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hospital_management',
    port: 3306
};

async function createUsers() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const doctorPassword = await bcrypt.hash('doctor123', 10);
        const nursePassword = await bcrypt.hash('nurse123', 10);

        console.log('\n=== Creating Users ===');

        // Create admin user
        try {
            await connection.query(
                `INSERT INTO users (username, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)`,
                ['admin', 'admin@hospital.com', adminPassword, 'admin', 1]
            );
            console.log('✅ Admin user created (username: admin, password: admin123)');
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log('⚠️  Admin user already exists');
            } else {
                throw err;
            }
        }

        // Create doctor user
        try {
            await connection.query(
                `INSERT INTO users (username, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)`,
                ['doctor', 'doctor@hospital.com', doctorPassword, 'doctor', 1]
            );
            console.log('✅ Doctor user created (username: doctor, password: doctor123)');
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log('⚠️  Doctor user already exists');
            } else {
                throw err;
            }
        }

        // Create nurse user
        try {
            await connection.query(
                `INSERT INTO users (username, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)`,
                ['nurse', 'nurse@hospital.com', nursePassword, 'nurse', 1]
            );
            console.log('✅ Nurse user created (username: nurse, password: nurse123)');
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log('⚠️  Nurse user already exists');
            } else {
                throw err;
            }
        }

        // Show all users
        const [users] = await connection.query('SELECT id, username, email, role, isActive FROM users');
        console.log('\n=== All Users in Database ===');
        console.table(users);

        await connection.end();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createUsers();

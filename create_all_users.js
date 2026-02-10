import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hospital_management',
    port: 3306
};

async function createAllRoleUsers() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Define all roles (excluding pharmacist)
        const roles = [
            { username: 'admin', email: 'admin@hospital.com', password: 'admin123', role: 'admin' },
            { username: 'doctor', email: 'doctor@hospital.com', password: 'doctor123', role: 'doctor' },
            { username: 'nurse', email: 'nurse@hospital.com', password: 'nurse123', role: 'nurse' },
            { username: 'receptionist', email: 'receptionist@hospital.com', password: 'receptionist123', role: 'receptionist' },
            { username: 'accountant', email: 'accountant@hospital.com', password: 'accountant123', role: 'accountant' },
            { username: 'lab', email: 'lab@hospital.com', password: 'lab123', role: 'lab' },
            { username: 'laboratory', email: 'laboratory@hospital.com', password: 'laboratory123', role: 'laboratory' }
        ];

        console.log('\n=== Creating Users for All Roles ===\n');

        for (const user of roles) {
            try {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await connection.query(
                    `INSERT INTO users (username, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)`,
                    [user.username, user.email, hashedPassword, user.role, 1]
                );
                console.log(`✅ ${user.role.toUpperCase().padEnd(15)} - username: ${user.username.padEnd(15)} password: ${user.password}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠️  ${user.role.toUpperCase().padEnd(15)} - already exists (${user.username})`);
                } else {
                    console.error(`❌ ${user.role.toUpperCase()} - Error: ${err.message}`);
                }
            }
        }

        // Show all users
        const [users] = await connection.query('SELECT id, username, email, role, isActive FROM users ORDER BY role');
        console.log('\n=== All Users in Database ===');
        console.table(users);

        await connection.end();
        console.log('\n✅ Done! All role users created.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createAllRoleUsers();

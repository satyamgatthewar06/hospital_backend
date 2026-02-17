import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hospital_management',
    port: 3306
};

async function verifyDatabase() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database: hospital_management\n');

        // 1. Check all tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('=== DATABASE TABLES ===');
        console.log(`Total tables: ${tables.length}`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`  ✓ ${tableName}`);
        });

        // 2. Check users table
        console.log('\n=== USERS TABLE ===');
        const [users] = await connection.query('SELECT id, username, email, role, isActive FROM users ORDER BY role');
        console.log(`Total users: ${users.length}`);
        console.table(users);

        // 3. Check staff table
        console.log('\n=== STAFF TABLE ===');
        const [staff] = await connection.query('SELECT id, staffId, firstName, lastName, role, department, status FROM staff LIMIT 10');
        console.log(`Total staff: ${staff.length}`);
        console.table(staff);

        // 4. Check patients table
        console.log('\n=== PATIENTS TABLE ===');
        const [patients] = await connection.query('SELECT COUNT(*) as count FROM patients');
        console.log(`Total patients: ${patients[0].count}`);

        // 5. Check doctors table
        console.log('\n=== DOCTORS TABLE ===');
        const [doctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');
        console.log(`Total doctors: ${doctors[0].count}`);

        // 6. Check lab_requests table
        console.log('\n=== LAB_REQUESTS TABLE ===');
        const [labRequests] = await connection.query('SELECT COUNT(*) as count FROM lab_requests');
        console.log(`Total lab requests: ${labRequests[0].count}`);

        // 7. Check appointments table
        console.log('\n=== APPOINTMENTS TABLE ===');
        const [appointments] = await connection.query('SELECT COUNT(*) as count FROM appointments');
        console.log(`Total appointments: ${appointments[0].count}`);

        await connection.end();
        console.log('\n✅ Database verification complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verifyDatabase();

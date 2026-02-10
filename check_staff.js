import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hospital_management',
    port: 3306
};

async function checkStaffData() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        const [staff] = await connection.query('SELECT * FROM staff LIMIT 10');
        console.log('\n=== STAFF DATA ===');
        console.log(`Total staff found: ${staff.length}`);
        console.log(JSON.stringify(staff, null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkStaffData();

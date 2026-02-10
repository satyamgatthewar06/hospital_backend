import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hospital_management',
    port: 3306
};

async function checkUsers() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Check if users table exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
        console.log('\n=== USERS TABLE EXISTS ===');
        console.log(tables.length > 0 ? 'Yes' : 'No');

        if (tables.length > 0) {
            // Get table structure
            const [columns] = await connection.query('DESCRIBE users');
            console.log('\n=== USERS TABLE STRUCTURE ===');
            columns.forEach(col => {
                console.log(`${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });

            // Get all users
            const [users] = await connection.query('SELECT * FROM users');
            console.log('\n=== USERS IN DATABASE ===');
            console.log(`Total users: ${users.length}`);
            console.log(JSON.stringify(users, null, 2));
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUsers();

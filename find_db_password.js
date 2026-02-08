import mysql from 'mysql2/promise';

const passwords = ['', 'root', 'admin', 'password', '1234', '123456', 'mysql', 'root123', 'admin123'];
const user = 'root';

(async () => {
    console.log("🔍 Attempting to find correct MySQL password for user 'root'...");

    for (const pwd of passwords) {
        try {
            console.log(`Testing password: '${pwd}' ...`);
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: user,
                password: pwd,
                database: 'hospital_management' // Optional, but good to check
            });
            console.log(`\n✅ SUCCESS! CONNECTED!`);
            console.log(`✅ The correct password is: '${pwd}'`);
            console.log(`\n👉 Please update your .env file: DB_PASSWORD=${pwd}`);
            await connection.end();
            process.exit(0);
        } catch (err) {
            if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                // Continue
            } else if (err.code === 'ER_BAD_DB_ERROR') {
                // Password worked, but DB missing? Still a success for password.
                console.log(`\n✅ SUCCESS! Password '${pwd}' works (but database 'hospital_management' might be missing).`);
                console.log(`\n👉 Please update your .env file: DB_PASSWORD=${pwd}`);
                process.exit(0);
            } else {
                console.log(`   Error with '${pwd}': ${err.message}`);
            }
        }
    }
    console.log("\n❌ All common passwords failed.");
    console.log("Please check your MySQL/XAMPP settings to find your root password.");
    process.exit(1);
})();

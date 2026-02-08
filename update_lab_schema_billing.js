
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const updateLabSchemaBilling = async () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
        };

        const pool = mysql.createPool(config);
        const connection = await pool.getConnection();

        console.log('🔌 Connected to database. Updating LAB_BILLS schema...');

        // Check if table exists
        const [tables] = await connection.query(`SHOW TABLES LIKE 'lab_bills'`);

        if (tables.length === 0) {
            console.log('✨ Creating table lab_bills...');
            await connection.query(`
                CREATE TABLE lab_bills (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    billNo VARCHAR(50) NOT NULL UNIQUE,
                    billDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    reqId INT,
                    patientName VARCHAR(255),
                    testName VARCHAR(255),
                    totalAmount DECIMAL(10, 2),
                    discount DECIMAL(10, 2) DEFAULT 0,
                    finalAmount DECIMAL(10, 2),
                    paymentMode VARCHAR(50),
                    status VARCHAR(50) DEFAULT 'Pending',
                    isCashless BOOLEAN DEFAULT FALSE,
                    insuranceProvider VARCHAR(255),
                    policyNumber VARCHAR(100),
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Table lab_bills created successfully.');
        } else {
            console.log('ℹ️ Table lab_bills already exists. Checking for missing columns...');
            const [columns] = await connection.query(`SHOW COLUMNS FROM lab_bills`);
            const existingCols = columns.map(c => c.Field);

            const newCols = [
                { name: 'isCashless', def: 'BOOLEAN DEFAULT FALSE' },
                { name: 'insuranceProvider', def: 'VARCHAR(255)' },
                { name: 'policyNumber', def: 'VARCHAR(100)' },
                { name: 'discount', def: 'DECIMAL(10, 2) DEFAULT 0' },
                { name: 'finalAmount', def: 'DECIMAL(10, 2)' }
            ];

            for (const col of newCols) {
                if (!existingCols.includes(col.name)) {
                    await connection.query(`ALTER TABLE lab_bills ADD COLUMN ${col.name} ${col.def}`);
                    console.log(`✅ Added column: ${col.name}`);
                }
            }
        }

        connection.release();
        await pool.end();
        console.log('🏁 Billing Schema update complete.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

updateLabSchemaBilling();


import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const updateLabSchema = async () => {
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

        console.log('🔌 Connected to database. Updating schema...');

        const columnsToAdd = [
            { name: 'resultType', type: 'VARCHAR(50)' },
            { name: 'pathologistRemark', type: 'TEXT' },
            { name: 'verifiedBy', type: 'VARCHAR(255)' },
            { name: 'verifiedDate', type: 'DATETIME' },
            { name: 'isVerified', type: 'TINYINT DEFAULT 0' }
        ];

        for (const col of columnsToAdd) {
            try {
                // Check if column exists
                const [rows] = await connection.query(`SHOW COLUMNS FROM lab_requests LIKE '${col.name}'`);

                if (rows.length === 0) {
                    await connection.query(`ALTER TABLE lab_requests ADD COLUMN ${col.name} ${col.type}`);
                    console.log(`✅ Added column: ${col.name}`);
                } else {
                    console.log(`ℹ️ Column already exists: ${col.name}`);
                }
            } catch (err) {
                console.error(`❌ Error adding column ${col.name}:`, err.message);
            }
        }

        connection.release();
        await pool.end();
        console.log('🏁 Schema update complete.');
    } catch (error) {
        console.error('❌ Fatal Error:', error.message);
    }
};

updateLabSchema();

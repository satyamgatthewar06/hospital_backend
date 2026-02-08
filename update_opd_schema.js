import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const updateSchema = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(process.env.MYSQL_URL || {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hospital_management'
        });

        console.log('Connected. Checking opd_records table...');

        // Add vitals column
        try {
            await connection.query('ALTER TABLE opd_records ADD COLUMN vitals TEXT');
            console.log('✅ Added "vitals" column.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ "vitals" column already exists.');
            } else {
                throw err;
            }
        }

        // Add notes column
        try {
            await connection.query('ALTER TABLE opd_records ADD COLUMN notes TEXT');
            console.log('✅ Added "notes" column.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ "notes" column already exists.');
            } else {
                throw err;
            }
        }

        // Add followUpDate column (frontend expects this but maybe it goes to appointments table? 
        // Wait, frontend saves followUp to appointments table, but also keeps it in state. 
        // Let's add it to OPD record too for history if we want, but implementation strictly saved it to appointments. 
        // However, saving it in OPD record is good for "Next Follow Up" display in history.)
        try {
            await connection.query('ALTER TABLE opd_records ADD COLUMN followUpDate DATE');
            console.log('✅ Added "followUpDate" column.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ "followUpDate" column already exists.');
            } else {
                throw err;
            }
        }

        console.log('🎉 Schema update complete!');

    } catch (error) {
        console.error('❌ Error updating schema:', error);
    } finally {
        if (connection) await connection.end();
    }
};

updateSchema();

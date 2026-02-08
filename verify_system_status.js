
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const verifySystem = async () => {
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

        console.log('✅ Connected to DB');

        // 1. Get All Tables
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log(`\nFound ${tableNames.length} tables.`);

        // 2. Check Row Counts
        console.log('\n📊 Table Status:');
        for (const table of tableNames) {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`- ${table}: ${rows[0].count} rows`);
        }

        // 3. Modules vs Tables Check
        const modules = [
            { name: 'Auth', table: 'users' },
            { name: 'Patients', table: 'patients' },
            { name: 'Appointments', table: 'appointments' },
            { name: 'Doctors', table: 'doctors' },
            { name: 'Staff', table: 'staff' },
            { name: 'OPD', table: 'opd_records' },
            { name: 'IPD', table: 'ipd_admissions' },
            { name: 'Lab Tests', table: 'lab_tests' },
            { name: 'Lab Requests', table: 'lab_requests' },
            { name: 'Lab Bills', table: 'lab_bills' },
            { name: 'General Bills', table: 'billing' },
            { name: 'Insurance Policies', table: 'insurance_policies' },
            { name: 'Insurance Claims', table: 'insurance_claims' },
            { name: 'TPAs', table: 'tpa' },
            { name: 'Wards', table: 'wards' }
        ];

        console.log('\n🔍 Module Validation:');
        const missing = [];
        for (const m of modules) {
            if (tableNames.includes(m.table)) {
                console.log(`✅ ${m.name}: Table '${m.table}' exists.`);
            } else {
                console.log(`❌ ${m.name}: Table '${m.table}' MISSING!`);
                missing.push(m.name);
            }
        }

        connection.release();
        await pool.end();

        if (missing.length > 0) {
            console.log(`\n⚠️ CRITICAL: The following modules are missing database tables: ${missing.join(', ')}`);
        } else {
            console.log('\n✨ All core modules have corresponding tables.');
        }

    } catch (e) {
        console.error('Verify Error:', e);
    }
};

verifySystem();

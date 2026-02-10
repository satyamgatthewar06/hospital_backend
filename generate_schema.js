import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hospital_management',
    port: 3306
};

async function generateSchema() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database: hospital_management\n');

        // Get all tables
        const [tables] = await connection.query('SHOW TABLES');

        let schemaSQL = `-- Hospital Management System Database Schema\n`;
        schemaSQL += `-- Generated on: ${new Date().toISOString()}\n\n`;
        schemaSQL += `CREATE DATABASE IF NOT EXISTS hospital_management;\nUSE hospital_management;\n\n`;

        for (const table of tables) {
            const tableName = Object.values(table)[0];
            console.log(`Processing table: ${tableName}`);

            const [createTable] = await connection.query(`SHOW CREATE TABLE ${tableName}`);
            schemaSQL += `-- Table structure for table \`${tableName}\`\n`;
            schemaSQL += `${createTable[0]['Create Table']};\n\n`;
        }

        fs.writeFileSync('database_schema.sql', schemaSQL);
        console.log('\n✅ Schema file created: database_schema.sql');

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

generateSchema();
